import { NextFunction, Request, Response } from "express";
import { IProductSold, ProductSold } from "../models/productSoldModel";
import { Service } from "../models/serviceModel";
import { catchAsync } from "../utils/catchAsync";

import {
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "../utils/controllerFactory";
import { IServiceFee, ServiceFee } from "../models/serviceFeeModel";
import { AppError } from "../utils/appError";

export const getAllServices = getAll(Service);

export const getService = getOne(Service);

import mongoose from "mongoose";
import { IProduct, Product } from "../models/productModel";
import StockLogs, { IStockLog } from "../models/stockLogsModel";

export const createService = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      serviceFeesData,
      productsSoldData,
      taxRate = 0.1,
      ...rest
    } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    const user = req.user;
    if (!user)
      return new AppError(
        "Unauthorized action, make usre you are logged in with an admin account",
        403,
      );

    try {
      // 1. Fetch Products & Validate Stock (DO THIS FIRST)
      const productSoldIds: mongoose.Types.ObjectId[] =
        productsSoldData?.map((p: any) => p.product) || [];

      const dbProducts = await Product.find({
        _id: { $in: productSoldIds },
      }).session(session);

      //!important: Even though the user is allowed one entry of each product, some people might want to miss with the site and send multiple entries of the same product. So we want check for any duplicates. This is done becasue we are checking for the stock availablity once for each sold product rather than grouping them.

      productSoldIds.forEach((id) => {
        const otherIds = productSoldIds.filter(
          (otherIds) => otherIds.toString() === id.toString(),
        );
        if (otherIds.length > 1)
          throw new Error(
            `You have enter more than one entry of the same product, You can only select the product one and adjust the amount you need sold from it`,
          );
      });

      // 2. CALCULATE TOTALS FIRST (The "Math Office")
      let subTotal = 0;
      let totalDiscount = 0;
      // const productsOutStockAfter: mongoose.Types.ObjectId[] = [];

      // Calculate from Service Fees
      serviceFeesData?.forEach((fee: IServiceFee) => {
        subTotal += Number(fee.price);
        totalDiscount += Number(fee.discount);
      });

      const logs: any[] = [];

      // Calculate from Products
      const processedProducts = productsSoldData?.map((p: IProductSold) => {
        const dbP = dbProducts.find(
          (db) => db._id.toString() === p.product.toString(),
        );

        // --- BUG FIX: INSUFFICIENT STOCK CHECK ---
        if (!dbP || dbP.stock < p.count) {
          throw new AppError(
            `Not enough stock for ${dbP?.name || "product"}.`,
            400,
          );
        }

        const itemSubTotal = p.pricePerUnit * p.count;
        const itemDiscount = p.discountPerUnit * p.count;

        // --- BUG FIX: PROPER OUT OF STOCK CALCULATION ---
        const remaining = dbP.stock - p.count;
        // if (remaining <= 0) {
        //   productsOutStockAfter.push(dbP._id as mongoose.Types.ObjectId);
        // }

        subTotal += itemSubTotal;
        totalDiscount += itemDiscount;

        // Check that the discount for each item doesn't exceed the total price for that item.
        if (itemDiscount > itemSubTotal) {
          throw new AppError(
            `Discount for ${dbP?.name || "product"} cannot exceed the total price.`,
            400,
          );
        }

        logs.push({
          product: p.product,
          change: -p.count, // Negative because stock is leaving
          previousStock: dbP.stock,
          currentStock: remaining,
          reason: "service-sale",
          user: user._id,
        });

        return {
          ...p,
          totalPriceAfterDiscount: itemSubTotal - itemDiscount,
          originalPricePerUnit: dbP.listPrice,
          originalDiscountPerUnit: (dbP.listPrice || 0) - (dbP.salePrice || 0),
        };
      });

      const taxAmount = (subTotal - totalDiscount) * taxRate;
      const grandTotal = subTotal - totalDiscount + taxAmount;

      // 3. CREATE EVERYTHING IN ONE GO
      // No need for "12" placeholders anymore!
      const [createdService] = await Service.create(
        [
          {
            ...rest,
            subTotal,
            taxAmount,
            totalDiscount,
            grandTotal,
          },
        ],
        { session },
      );

      if (!createdService)
        throw new AppError(
          "Failed to create a new service, Please re-creating the same serivce",
          500,
        );

      if (processedProducts?.length) {
        const productsWithServiceId = processedProducts.map((p: IProduct) => ({
          ...p,
          service: createdService._id,
        }));
        await ProductSold.create(productsWithServiceId, { session });

        // 4. BULK UPDATE STOCK
        const bulkOps = logs.map((item: any) => ({
          updateOne: {
            filter: { _id: item.product },
            update: {
              $inc: { stock: item.count },
              $set: { isAvailable: !item.currentStock },
            },
          },
        }));
        await Product.bulkWrite(bulkOps, { session });
      }

      if (serviceFeesData?.length) {
        const feesWithServiceId = serviceFeesData.map((f: any) => ({
          ...f,
          service: createdService._id,
        }));
        await ServiceFee.create(feesWithServiceId, { session });
      }

      if (logs.length) {
        const stockLogs = logs.map((log) => ({
          ...log,
          referenceId: createdService._id,
        }));
        await StockLogs.create(stockLogs, { session });
      }

      await session.commitTransaction();
      res.status(201).json({ status: "success", data: createdService });
    } catch (error) {
      await session.abortTransaction();
      return next(error);
    } finally {
      session.endSession();
    }
  },
);
// export const createService = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const { serviceFeesData, productsSoldData, ...rest } = req.body;

//     const productsSold = (productsSoldData || []) as IProductSold[];
//     const serviceFees = (serviceFeesData || []) as IServiceFee[];
//     // 1. Start a Session
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//       let createdServiceFees: IServiceFee[] = [];
//       let createdProductsSold: IProductSold[] = [];

//       // 1) Get the id of the service being created
//       const createdService = await Service.create(
//         {
//           ...rest,
//           subTotal: 12, // the 12 is a random number because we are updating those values later on in the code.
//           taxAmount: 12,
//           totalDiscount: 12,
//           grandTotal: 12,
//         },
//         { session },
//       );

//       if (!createdService || !createdService[0])
//         throw new AppError(
//           `Failed to create a new service, Please retry again`,
//           500,
//         );

//       const serviceId = createdService[0]._id;

//       // 2) Find the related products you want to sell from the DB
//       const productSoldIds = productsSold
//         ? productsSold.map((p: IProductSold) => p.product)
//         : [];
//       const dbProducts = await Product.find({
//         _id: { $in: productSoldIds },
//       }).select("id _id stock listPrice salePrice isAvailable name");

//       // 3) Check for any unavailable or out of stock product
//       const unAvailableProduct = dbProducts
//         .filter((p) => !p.isAvailable || !p.stock)
//         .map((unAvailable, i) => `${i + 1}: ${unAvailable.name} `)
//         .join(", ");
//       if (unAvailableProduct.length)
//         throw new Error(
//           `The following products are unAvailable or out of stock:${unAvailableProduct}`,
//         );

//       // 4) Insert Products Sold
//       if (productsSold?.length) {
//         // 4.1)  Check some of the product have insufficient amount stop the creation
//         const stockIssue: string[] = [];

//         productsSold.forEach((soldProduct, i) => {
//           const product = dbProducts.find(
//             (p) => p.id === soldProduct.id,
//           ) as IProduct;
//           if (product.stock < soldProduct.count)
//             stockIssue.push(
//               `${i + 1}: Product(${product.name}) has only ${product.stock} in stock available  `,
//             );
//         });

//         if (stockIssue.length) throw new Error(stockIssue.join(", "));

//         // 4.2) Check for any duplicate IDs

//         //!important: Even though the user is allowed one entry of each product, some people might want to miss with the site and send multiple entries of the same product. So we want check for any duplicates. This is done becasue we are checking for the stock availablity once for each sold product rather than grouping them.
//         productSoldIds.forEach((id) => {
//           const otherIds = productSoldIds.filter((otherIds) => otherIds === id);
//           if (otherIds.length > 1)
//             throw new Error(
//               `You have enter more than one entry of the same product, You can only select the product one and adjust the amount you need sold from it`,
//             );
//         });

//         // 4.3) Insert the data of the sold products
//         const processedProductSold = productsSold.map(
//           (productSold: IProductSold, i: number) => {
//             // 1) Find if the user selected the product more than once that matchs the same price and discount

//             const product = dbProducts.find(
//               (product) => product._id === productSold._id,
//             ) as IProduct;

//             return {
//               ...productSold,
//               service: serviceId,
//               originalPricePerUnit: product.listPrice,
//               originalDiscountPerUnit: product.listPrice - product.salePrice,
//               totalPriceAfterDiscount:
//                 (productSold.pricePerUnit - productSold.discountPerUnit) *
//                 productSold.count,
//             };
//           },
//         );

//         createdProductsSold = await ProductSold.create(processedProductSold, {
//           session,
//         });
//       }

//       // 5) Insert Service Fees
//       if (serviceFees?.length) {
//         // Pass the session to the options
//         const servArr = serviceFees.map((fee) => {
//           return { ...fee, service: serviceId };
//         });
//         createdServiceFees = await ServiceFee.create(servArr, { session });
//       }

//       // 6) BULK UPDATE: Decrement stock from the Products collection
//       const bulkOps = productsSold.map((item) => ({
//         updateOne: {
//           filter: { _id: item.product },
//           update: { $inc: { stock: -item.count } }, // $inc with negative subtracts
//         },
//       }));
//       await Product.bulkWrite(bulkOps, { session });

//       const serviceFeesTotals = createdServiceFees.reduce(
//         (acc, curr) => {
//           acc.totalPrice += curr.price;
//           acc.totalDiscount += curr.discount;
//           return acc;
//         },
//         {
//           totalPrice: 0,
//           totalDiscount: 0,
//         },
//       );

//       const productSoldTotals = createdProductsSold.reduce(
//         (acc, curr) => {
//           acc.totalPrice += curr.pricePerUnit * curr.count;
//           acc.totalDiscount += curr.discountPerUnit * curr.count;
//           return acc;
//         },
//         {
//           totalPrice: 0,
//           totalDiscount: 0,
//         },
//       );

//       const subTotal =
//         serviceFeesTotals.totalPrice + productSoldTotals.totalPrice;
//       const taxAmount = subTotal + 12; // Shouldn't we have passed the tax percentage instead of the amount it self since we are calculating things on the backend?
//       const totalDiscount =
//         serviceFeesTotals.totalDiscount + productSoldTotals.totalDiscount;
//       const grandTotal = taxAmount - totalDiscount;

//       const service = await Service.findByIdAndUpdate(
//         serviceId,
//         {
//           ...rest,
//           subTotal,
//           taxAmount,
//           totalDiscount,
//           grandTotal,
//         },
//         { session },
//       );

//       // 5. If everything is successful, commit the changes
//       await session.commitTransaction();

//       res.status(201).json({
//         status: "success",
//         data: {
//           ...service,
//           serviceFees: createdServiceFees,
//           productsSold: createdProductsSold,
//         },
//       });
//     } catch (error) {
//       // 6. If ANYTHING fails, abort the transaction.
//       // This undoes every insert made during this session automatically!
//       await session.abortTransaction();
//       return next(error);
//     } finally {
//       // 7. Always close the session
//       session.endSession();
//     }
//   },
// );

export const updateService = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { serviceFees, productsSold, ...rest } = req.body;

    // 1. Start a Session
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      let serviceFees: IServiceFee[] = [];
      let productsSold: IProductSold[] = [];

      // 2. Insert Service Fees
      if (serviceFees?.length) {
        // Pass the session to the options
        serviceFees = await ServiceFee.create(serviceFees, { session });
      }

      // 3. Insert Products Sold
      if (productsSold?.length) {
        productsSold = await ProductSold.create(productsSold, {
          session,
        });
      }

      // 4. Create the Main Service record (Optional - if you have one)
      const service = await Service.create(rest);

      // const newService = await Service.create([{ ...rest, serviceFees: ..., productsSold: ... }], { session });

      // 5. If everything is successful, commit the changes
      await session.commitTransaction();

      res.status(201).json({
        status: "success",
        data: { ...service, serviceFees, productsSold },
      });
    } catch (error) {
      // 6. If ANYTHING fails, abort the transaction.
      // This undoes every insert made during this session automatically!
      await session.abortTransaction();
      return next(error);
    } finally {
      // 7. Always close the session
      session.endSession();
    }
  },
);

//     export const createService = catchAsync(
//     async (req: Request, res: Response, next: NextFunction) => {
//         const { serviceFees, productsSold, ...rest } = req.body;

//         let serviceFees = [] as IServiceFee[];
//         let createdProductsSold = [];
//         if (serviceFees && serviceFees.length) {
//         createdServiceFees = await ServiceFee.insertMany(serviceFees, {
//             rawResult: true,
//             ordered: true,
//         });

//         if (!createdServiceFees)
//             return next(
//             new AppError(
//                 "Failed to create service fees, Try to re-create the order",
//                 500,
//             ),
//             );
//         }

//         if (productsSold && productsSold.length) {
//         createdProductsSold = await ProductSold.insertMany(productsSold, {
//             rawResult: true,
//             ordered: true,
//         });

//         if (!createdProductsSold) {
//             const serviceFeesToDelete = createdServiceFees.map((s) => s.id);

//             await ServiceFee.deleteMany({ _id: { $in: serviceFeesToDelete } });
//         }
//         }

//     const createdService = await Service.create(rest);

//     if (!createdService) {
//       const serviceFeesToDelete = createdServiceFees.map((s) => s.id);
//       const productsSoldToDelete = createdProductsSold.map((p) => p.id);
//       await ServiceFee.deleteMany({ _id: { $in: serviceFeesToDelete } });
//       await ProductSold.deleteMany({ _id: { $in: productsSoldToDelete } });

//       return next(
//         new AppError(
//           "Failed to create service, Try to Re-create the order again ",
//           500,
//         ),
//       );
//     }

//     res.status(200).json({
//       status: "success",
//       data: createdService,
//     });
//   },
// );

export const deleteService = deleteOne(ProductSold);
