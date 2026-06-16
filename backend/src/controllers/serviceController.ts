import { NextFunction, Request, Response } from "express";
import { IProductSold, ProductSold } from "../models/productSoldModel";
import { PaymentStatus, Service } from "../models/serviceModel";
import { catchAsync } from "../utils/catchAsync";

import {
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "../utils/controllerFactory";
import { IServiceFee, ServiceFee } from "../models/serviceFeeModel";
import { AppError } from "../utils/appError";

export const getAllServices = getAll(Service, [
  {
    path: "serviceFees",
    populate: {
      path: "category",
      select: "name",
    },
  },
  {
    path: "productsSold",
    populate: {
      path: "product",
    },
  },
  { path: "technician", select: "username picture" },
  { path: "serviceStatus" },
  { path: "user" },
  { path: "car" },
]);

export const getService = getOne(Service);

import mongoose, { ObjectId } from "mongoose";
import { IProduct, Product } from "../models/productModel";
import StockLogs, { IStockLog } from "../models/stockLogsModel";
import { updateProductsStock } from "./productController";
import {
  SERVICE_STATUS_CANCELLED_ID,
  SERVICE_STATUS_DONE_ID,
  SERVICE_STATUS_PENDING_ID,
  SERVICE_STATUS_RETURNED_ID,
} from "../constants";

interface UpdateTotalsParams {
  serviceId: string;
  price: number;
  discount: number;
  session?: mongoose.mongo.ClientSession;
}
export async function updateServiceTotals({
  serviceId,
  price,
  discount,
  session,
}: UpdateTotalsParams) {
  try {
    const service = await Service.findById(serviceId)
      .populate([{ path: "serviceFees" }])

      .session(session || null);
    if (!service)
      throw new Error(`Failed to find related service with ID: ${serviceId}`);
    const productSoldCount = await ProductSold.countDocuments({
      service: service._id,
    }).session(session || null);
    const serviceFeeCount = await ServiceFee.countDocuments({
      service: service._id,
    }).session(session || null);

    const amountReceived = service.amountReceived;
    const previousGrandTotal = service.grandTotal;
    const isThereItems = productSoldCount > 0 || serviceFeeCount > 0;

    // Update base metrics
    service.subTotal = service.subTotal + price;
    service.totalDiscount = service.totalDiscount + discount;

    const baseAmount = service.subTotal - service.totalDiscount;

    if (baseAmount <= 0) {
      // Defensive fallback if order becomes entirely empty
      service.subTotal = 0;
      service.totalDiscount = 0;
      service.taxAmount = 0;
      service.grandTotal = 0;
      // If there service fees or products sold count bigger than 0 that means the admin returned every single item
      // But if there are no entries at all and the baseAmount became 0, that means the admin deleted all the items
      // if (service.amountReceived > 0) {
      //   service.paymentStatus = "refunded";
      // } else {
      //   service.paymentStatus = "unpaid";
      // }
      // console.log(isThereItems, "ISTHERE ");
      if (isThereItems) {
        service.serviceStatus = new mongoose.Types.ObjectId(
          SERVICE_STATUS_RETURNED_ID,
        );
      } else {
        service.serviceStatus = new mongoose.Types.ObjectId(
          SERVICE_STATUS_CANCELLED_ID,
        );
      }
    } else {
      // Fallback fallback: Assuming a fixed rate if taxRate isn't a static field on schema
      // const taxRate = service.taxAmount / baseAmount;
      const taxRate = service.taxRate;
      service.taxAmount = Math.ceil(baseAmount * taxRate);
      service.grandTotal = Math.ceil(baseAmount + baseAmount * taxRate);

      if (previousGrandTotal === 0) {
        // if (amountReceived > 0 && amountReceived < service.grandTotal) {
        //   service.paymentStatus = "partially-paid";
        // } else if (amountReceived >= service.grandTotal) {
        //   service.paymentStatus = "paid";
        // } else {
        //   service.paymentStatus = "unpaid";
        // }
        service.serviceStatus = new mongoose.Types.ObjectId(
          SERVICE_STATUS_PENDING_ID,
        );
      }
    }
    const paymentStatus = determinePaymentStatus(
      service.grandTotal,
      amountReceived,
    );
    service.paymentStatus = paymentStatus;
    await service.save({ session });
  } catch (err: any) {
    throw new Error(err.message);
  }
}

export function determinePaymentStatus(
  newGrandTotal: number,
  amountReceived: number,
): PaymentStatus {
  const isFullyPaid = amountReceived >= newGrandTotal;
  const isPartiallyPaid = amountReceived > 0 && amountReceived < newGrandTotal;

  let newPaymentStatus: PaymentStatus = "unpaid";
  if (isFullyPaid) newPaymentStatus = "paid";
  if (isPartiallyPaid) newPaymentStatus = "partially-paid";
  if (newGrandTotal === 0 && amountReceived > 0) newPaymentStatus = "refunded";

  // if (newGrandTotal === 0 && amountReceived > 0) return "refunded";
  // if (isFullyPaid) return "paid";
  // if (isPartiallyPaid) return "partially-paid";
  return newPaymentStatus;
}

export const createService = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("🧾🧾🧾 A New Service Is Being created 🧾🧾🧾");
    const {
      serviceFees: serviceFeesData,
      productsSold: productsSoldData,
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

      console.log("📦📦📦 Searching For Matching Products 📦📦📦");
      const dbProducts = await Product.find({
        _id: { $in: productSoldIds },
      }).session(session);
      console.log(`📦📦📦 Products found: ${dbProducts.join(", ")} 📦📦📦`);

      console.log(`🔎🔎🔎  Checking For Any Duplicates IDS  🔎🔎🔎`);
      //!important: Even though the user is allowed one entry of each product, some people might want to miss with the site and send multiple entries of the same product. So we want check for any duplicates. This is done becasue we are checking for the stock availablity once for each sold product rather than grouping them.

      productSoldIds.forEach((id) => {
        const otherIds = productSoldIds.filter(
          (otherIds) => otherIds.toString() === id.toString(),
        );
        if (otherIds.length > 1) {
          console.log(
            `❗❗❗  Duplicate IDS Were Found: ${otherIds.join(", ")}  ❗❗❗`,
          );
          throw new Error(
            `You have enter more than one entry of the same product, You can only select the product one and adjust the amount you need sold from it`,
          );
        }
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
      const grandTotal = Math.ceil(subTotal - totalDiscount + taxAmount);

      // 3. CREATE EVERYTHING IN ONE GO
      // No need for "12" placeholders anymore!
      console.log(`💉💉💉  Inserting The Service Data  💉💉💉`);

      const amountReceived = rest.amountReceived || 0;
      const isFullyPaid = amountReceived >= grandTotal;
      const isPartiallyPaid = amountReceived > 0 && amountReceived < grandTotal;
      const paymentStatus = isFullyPaid
        ? "paid"
        : isPartiallyPaid
          ? "partially-paid"
          : "unpaid";
      const isCurrStatusIsDone = rest.status === SERVICE_STATUS_DONE_ID;
      const [createdService] = await Service.create(
        [
          {
            ...rest,
            subTotal,
            taxRate,
            taxAmount,
            paymentStatus,
            totalDiscount,
            completedAt: isCurrStatusIsDone ? new Date() : null,
            grandTotal,
          },
        ],
        { session, ordered: true },
      );
      console.log(`💉💉💉  Inserted Service Data: ${createdService}  💉💉💉`);

      if (!createdService)
        throw new AppError(
          "Failed to create a new service, Please re-creating the same serivce",
          500,
        );

      if (processedProducts?.length) {
        console.log(`💲💲💲  Inserting Sold Products  💲💲💲`);
        const productsWithServiceId = processedProducts.map((p: IProduct) => ({
          ...p,
          service: createdService._id,
        }));
        const soldProducts = await ProductSold.create(productsWithServiceId, {
          session,
          ordered: true,
        });

        console.log(`💲💲💲 Inserted Sold Products: ${soldProducts} 💲💲💲`);

        // 4. BULK UPDATE STOCK
        console.log(`📉📉📉 Updating Product Stock 📉📉📉`);

        const newStocks = await updateProductsStock(
          logs.map((l) => ({
            id: l.product,
            change: l.change,
            currentStock: l.currentStock,
          })),
          session,
        );

        // const bulkOps = logs.map((item: any) => ({
        //   updateOne: {
        //     filter: { _id: item.product },
        //     update: {
        //       $inc: { stock: item.change },
        //       $set: { isAvailable: !item.currentStock },
        //     },
        //   },
        // }));
        // const newStocks = await Product.bulkWrite(bulkOps, {
        //   session,
        //   ordered: true,
        // });

        console.log(
          `📉📉📉 Updated Product Stock: ${JSON.stringify(newStocks)} 📉📉📉`,
        );
      }

      if (serviceFeesData?.length) {
        const feesWithServiceId = serviceFeesData.map((f: any) => {
          const total = f.price - f.discount;

          return {
            ...f,
            service: createdService._id,
            totalPriceAfterDiscount: total,
          };
        });
        console.log(`💸💸💸 Inserting Service Fees 💸💸💸`);
        const createdServiceFees = await ServiceFee.create(feesWithServiceId, {
          session,
          ordered: true,
        });
        console.log(
          `💸💸💸 Inserted Service Fees: ${createdServiceFees} 💸💸💸`,
        );
      }

      if (logs.length) {
        console.log(`🧾🧾🧾 Logging Stock Changes 🧾🧾🧾`);
        const stockLogs = logs.map((log) => ({
          ...log,
          referenceId: createdService._id,
        }));
        console.log(
          `🧾🧾🧾 Created Stock Logs: ${JSON.stringify(stockLogs)} 🧾🧾🧾`,
        );
        await StockLogs.create(stockLogs, { session, ordered: true });
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
    const body = req.body;

    const { id } = req.params;

    const user = req.user;

    if (!user) return next(new AppError("Unauthorized action", 401));
    // 1. Start a Session
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const service = await Service.findById(id).session(session);
      if (!service)
        return next(new AppError(`Failed to find service ID:${id}`, 404));

      const currentStatus = service.serviceStatus.toString();
      const targetStatus = body.serviceStatus || service.serviceStatus;
      const isAlreadyCancelledOrRetunred =
        currentStatus === SERVICE_STATUS_CANCELLED_ID ||
        currentStatus === SERVICE_STATUS_RETURNED_ID;

      const isEnteringCancelledOrReturned =
        targetStatus === SERVICE_STATUS_CANCELLED_ID ||
        targetStatus === SERVICE_STATUS_RETURNED_ID;

      const isStatusChanged = body.serviceStatus !== service.serviceStatus;

      if (isStatusChanged) {
        if (
          (isAlreadyCancelledOrRetunred && !isEnteringCancelledOrReturned) ||
          (!isAlreadyCancelledOrRetunred && isEnteringCancelledOrReturned)
        ) {
          // 1. Find all the unreturned prodcuts
          const productsSold = await ProductSold.find({
            service: id,
            isReturned: { $ne: isEnteringCancelledOrReturned },
          }).session(session);

          // 2. Find all the unreturned service fees
          const serviceFees = await ServiceFee.find({
            service: id,
            isReturned: { $ne: isEnteringCancelledOrReturned },
          }).session(session);

          // 3. Calculate all the total to update the service total
          const serviceFeesTotals = serviceFees.reduce(
            (acc, curr) => {
              acc.totalFeesPrice += curr.price;
              acc.totalFeesDiscount += curr.discount;
              return acc;
            },
            {
              totalFeesPrice: 0,
              totalFeesDiscount: 0,
            },
          );
          const productsSoldTotals = productsSold.reduce(
            (acc, curr) => {
              acc.totalSoldPrice += curr.pricePerUnit * curr.count;
              acc.totalSoldDiscount += curr.discountPerUnit * curr.count;

              acc.totalCount += curr.count;
              return acc;
            },
            {
              totalSoldPrice: 0,
              totalSoldDiscount: 0,
              totalCount: 0,
            },
          );

          const totalPrice =
            serviceFeesTotals.totalFeesPrice +
            productsSoldTotals.totalSoldPrice;
          const totalDiscount =
            serviceFeesTotals.totalFeesDiscount +
            productsSoldTotals.totalSoldDiscount;

          // 4. Find all the products inside the service for restocking and stock change logging
          const ids = productsSold.map((p) => p.product);
          const products = await Product.find({ _id: { $in: ids } })
            .select("_id stock")
            .session(session);

          // 5. Process and issue the logs and update the product stocks
          const logs =
            productsSoldTotals.totalCount > 0
              ? productsSold.map((p) => {
                  const dbProduct = products.find(
                    (product) =>
                      product._id.toString() === p.product.toString(),
                  );
                  if (!dbProduct)
                    throw new AppError(
                      `Failed to find product to adjust stocks product ID: ${p.product}`,
                      404,
                    );
                  const stockChange = isEnteringCancelledOrReturned
                    ? p.count
                    : -p.count;
                  return {
                    product: dbProduct._id.toString(),
                    referncedId: id,
                    change: isEnteringCancelledOrReturned ? p.count : -p.count,
                    previousStock: dbProduct.stock,
                    currentStock: dbProduct.stock + stockChange,
                    reason: "return",
                    user: user._id,
                  };
                })
              : [];

          if (logs.length > 0) {
            await StockLogs.create(logs, { ordered: true, session });
            const stockUpdates = logs.map((l) => ({
              id: l.product,
              change: l.change,
              currentStock: l.currentStock,
            }));

            await updateProductsStock(stockUpdates, session);
          }

          // 6. Update service totals

          body.subTotal =
            service.subTotal +
            (isEnteringCancelledOrReturned ? -totalPrice : totalPrice);
          body.totalDiscount =
            service.totalDiscount +
            (isEnteringCancelledOrReturned ? -totalDiscount : totalDiscount);

          const baseAmount = body.subTotal - body.totalDiscount;

          if (baseAmount <= 0) {
            // Defensive fallback if order becomes entirely empty
            body.subTotal = 0;
            body.totalDiscount = 0;
            body.taxAmount = 0;
            body.grandTotal = 0;
            // body.amountReceived = 0;
          } else {
            const taxRate = service.taxRate;
            body.taxAmount = baseAmount * taxRate;
            body.grandTotal = Math.ceil(baseAmount + body.taxAmount);
          }

          // await updateServiceTotals({
          //   serviceId: id as string,
          //   price: isReturned ? -totalPrice : totalPrice,
          //   discount: isReturned ? -totalDiscount : totalDiscount,
          //   session,
          // });

          // 7. Mark all the unreturned product sold and service fees as returned
          await ProductSold.updateMany(
            { service: id },
            { $set: { isReturned: isEnteringCancelledOrReturned } },
          ).session(session);

          await ServiceFee.updateMany(
            { service: id },
            { $set: { isReturned: isEnteringCancelledOrReturned } },
          ).session(session);
        }
      }

      // Make sure you adjust the completedAt field based on the new status
      const isDoneStatus = targetStatus === SERVICE_STATUS_DONE_ID;
      if (isDoneStatus && !service.completedAt) {
        body.completedAt = new Date();
      } else if (!isDoneStatus && service.completedAt) {
        body.completedAt = null;
      }

      console.log(body, "UPDATED SERVICE BODY");
      // Adjust the payment status based on the new grand total and amount received
      const amountReceived =
        typeof body.amountReceived === "number"
          ? body.amountReceived
          : service.amountReceived || 0;

      const newGrandTotal =
        typeof body.grandTotal === "number"
          ? body.grandTotal
          : service.grandTotal;

      const paymentStatus = determinePaymentStatus(
        newGrandTotal,
        amountReceived,
      );

      console.log("NEW PAYMENT STATUS", paymentStatus);
      const updatedService = await Service.findByIdAndUpdate(
        id,
        { ...body, paymentStatus },
        {
          returnDocument: "after",
          runValidators: true,
        },
      ).session(session);

      if (!updatedService)
        return next(
          new AppError(`Failed to find and update service entry: ${id}`, 500),
        );
      await session.commitTransaction();
      res.status(200).json({ message: "success", data: updatedService });
    } catch (error) {
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

export const deleteService = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const shouldRestock = req.body.shouldRestock === true;
    const { id } = req.params;
    const user = req.user;

    if (!user) return next(new AppError(`Unauthorized action`, 401));

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Fetch ALL related sold product records
      const relatedSoldPro = await ProductSold.find({ service: id }).session(
        session,
      );

      // Target ONLY items that haven't been returned yet for database matching
      const activeProductIds = relatedSoldPro
        .filter((p) => !p.isReturned)
        .map((p) => p.product);

      const relatedProducts = await Product.find({
        _id: { $in: activeProductIds },
      }).session(session);

      // 2. Perform Stock Restocking FIRST (If requested)
      // This ensures we have the correct snapshot tracking
      if (shouldRestock && activeProductIds.length > 0) {
        const updatedStockArr = relatedSoldPro
          .filter((p) => !p.isReturned) // Restock ONLY unreturned items
          .map((sold) => {
            const dbProduct = relatedProducts.find((p) =>
              p._id.equals(sold.product),
            );
            if (!dbProduct) {
              throw new AppError(
                `Product matching entry ${sold.product} not found`,
                404,
              );
            }
            return {
              id: dbProduct._id.toString(),
              change: sold.count, // Positive change restores stock level
              currentStock: dbProduct.stock, // Passing snapshot before running calculations
            };
          });

        await updateProductsStock(updatedStockArr, session);
      }

      // 3. Document Stock Logs accurately based on what actually occurred
      const logs: any[] = relatedSoldPro.map((sold) => {
        const dbProduct = relatedProducts.find((p) =>
          p._id.equals(sold.product),
        );

        // If the item was previously returned, database stock didn't alter during this deletion loop
        const prevStock = dbProduct ? dbProduct.stock : 0;
        const netChange = !sold.isReturned && shouldRestock ? sold.count : 0;

        return {
          product: sold.product,
          referenceId: id,
          change: netChange,
          previousStock: prevStock,
          currentStock: prevStock + netChange,
          reason: "service-deleted",
          user: user._id,
        };
      });

      if (logs.length > 0) {
        await StockLogs.create(logs, { session, ordered: true });
      }

      // 4. Correctly Delete Subdocument Records using $in Filter Objects
      await ProductSold.deleteMany({ service: id }, { session });
      await ServiceFee.deleteMany({ service: id }, { session });
      await Service.findByIdAndDelete(id);
      // 5. Commit transaction changes completely
      await session.commitTransaction();
      res.status(204).end(); // 204 No Content doesn't require a JSON body wrapper
    } catch (error) {
      await session.abortTransaction();
      return next(error);
    } finally {
      session.endSession();
    }
  },
);
// export const deleteService = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const shouldRestock = req.body.shouldRestock;
//     const { id } = req.params;
//     const user = req.user;
//     if (!user) return  next( new AppError(`Unauthorized action`, 401))
//     const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//       // 1. Find the related sold products
//       const relatedSoldPro = await ProductSold.find({
//         service: id,
//       })
//         .select("_id,product,pricePerUnit,discountPerUnit,count,isReturned")
//         .session(session);

//       const soldIds = relatedSoldPro.map((p) => p._id);
//       const unReturnedSoldProIds = relatedSoldPro
//         .filter((p) => !p.isReturned)
//         .map((p) => p.product);

//       const relatedProducts = await Product.find({
//         _id: { $in: unReturnedSoldProIds },
//       })
//         .select("_id,stock")
//         .session(session);

//       // 2. Delete related sold products
//       await ProductSold.deleteMany(soldIds, { session });

//       // 3. Delete related fees

//       const relatedFees = await ServiceFee.find({ service: id })
//         .select("_id")
//         .session(session);

//       if (relatedFees.length > 0) {
//         const ids = relatedFees.map((f) => f._id);
//         await ServiceFee.deleteMany(ids, { session });
//       }

//       // 4. Log all changes in stock
//       const logs: any[] = relatedSoldPro.map((sold) => {
//         const dbProduct = relatedProducts.find((p) => p._id === sold.product);
//         if (!dbProduct)
//           throw new Error(
//             `Failed to find the related product to the product sold entry`,
//           );
//         const currentStock = sold.count + dbProduct.stock;

//         return {
//           product: dbProduct._id,
//           referenceId: id,
//           change: sold.count,
//           previousStock: dbProduct.stock,
//           currentStock,
//           reason: "service-deleted",
//           user: user._id,
//         };
//       });

//       if (logs.length > 0) {
//         await StockLogs.create(logs, { session, ordered: true });
//       }
//       // 5. If shouldRestock = true then increase the amount of each returned product
//       if (shouldRestock && logs.length > 0) {
//         const updatedStockArr = logs.map((log) => ({
//           id: log.product.toString(),
//           change: log.change,
//           currentStock: log.currentStock,
//         }));
//         await updateProductsStock(updatedStockArr, session);
//       }

//       // 6. If everything is successful, commit the changes
//       await session.commitTransaction();
//       res.status(204).json({ message: "success" });
//     } catch (error) {
//       await session.abortTransaction();
//       return next(error);
//     } finally {
//       session.endSession();
//     }
//   },
// );

export const getServiceStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const CANCELLED_OBJECT_ID = new mongoose.Types.ObjectId(
      SERVICE_STATUS_CANCELLED_ID,
    );
    const RETURNED_OBJECT_ID = new mongoose.Types.ObjectId(
      SERVICE_STATUS_RETURNED_ID,
    );

    let filterQuery: Record<string, any> = { ...req.query };
    if (filterQuery.serviceStatus)
      filterQuery = {
        ...filterQuery,
        serviceStatus: new mongoose.Types.ObjectId(
          filterQuery.serviceStatus as string,
        ),
      };
    console.log(req.query, "FILTER QUERY");

    const stats = await Service.aggregate([
      // 1. Filter by reliable date boundaries
      {
        $match: filterQuery,
      },

      // 2. Lookup products sold (Verify collection name matches pluralization lowercase)
      {
        $lookup: {
          from: "productssolds",
          localField: "_id",
          foreignField: "service",
          as: "productSoldData",
        },
      },

      // 3. Lookup service fees (Verify collection name matches pluralization lowercase)
      {
        $lookup: {
          from: "servicefees",
          localField: "_id",
          foreignField: "service",
          as: "serviceFeesData",
        },
      },

      // 4. First Pass Project: Compute calculations per child array item
      {
        $project: {
          _id: 1,
          serviceStatus: 1,
          paymentStatus: 1,
          amountReceived: 1,
          taxRate: 1,

          // Active Parts Revenue Math
          productsTotalGross: {
            $sum: {
              $map: {
                input: "$productSoldData",
                as: "sold",
                in: {
                  $cond: {
                    if: { $eq: ["$$sold.isReturned", true] },
                    then: 0,
                    else: {
                      $multiply: ["$$sold.pricePerUnit", "$$sold.count"],
                    },
                  },
                },
              },
            },
          },
          productsTotalDiscount: {
            $sum: {
              $map: {
                input: "$productSoldData",
                as: "sold",
                in: {
                  $cond: {
                    if: { $eq: ["$$sold.isReturned", true] }, // Fixed variable token bug
                    then: 0,
                    else: {
                      $multiply: ["$$sold.discountPerUnit", "$$sold.count"],
                    },
                  },
                },
              },
            },
          },

          // Active Fees Revenue Math
          feesTotalGross: {
            $sum: {
              $map: {
                input: "$serviceFeesData",
                as: "fee",
                in: {
                  $cond: {
                    if: { $eq: ["$$fee.isReturned", true] },
                    then: 0,
                    else: "$$fee.price",
                  },
                },
              },
            },
          },
          feesTotalDiscount: {
            $sum: {
              $map: {
                input: "$serviceFeesData",
                as: "fee",
                in: {
                  $cond: {
                    if: { $eq: ["$$fee.isReturned", true] },
                    then: 0,
                    else: "$$fee.discount",
                  },
                },
              },
            },
          },

          // Financial Losses Metrics (Raw values)
          netTotalReturnedProduct: {
            $sum: {
              $map: {
                input: "$productSoldData",
                as: "returnedSold",
                in: {
                  $cond: {
                    if: { $eq: ["$$returnedSold.isReturned", false] },
                    then: 0,
                    else: {
                      $multiply: [
                        {
                          $subtract: [
                            "$$returnedSold.pricePerUnit",
                            { $ifNull: ["$$returnedSold.discountPerUnit", 0] },
                          ],
                        },
                        "$$returnedSold.count",
                      ],
                    },
                  },
                },
              },
            },
          },
          netTotalReturnedFees: {
            $sum: {
              $map: {
                input: "$serviceFeesData",
                as: "fee",
                in: {
                  $cond: {
                    if: { $eq: ["$$fee.isReturned", false] },
                    then: 0,
                    else: {
                      $subtract: [
                        "$$fee.price",
                        { $ifNull: ["$$fee.discount", 0] },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },

      // 5. Second Pass Project: Compute ultimate document balances
      {
        $project: {
          _id: 1,
          serviceStatus: 1,
          paymentStatus: 1,
          amountReceived: 1,
          productsTotalGross: 1,
          productsTotalDiscount: 1,
          feesTotalGross: 1,
          feesTotalDiscount: 1,
          taxRate: 1,
          // Net loss pools
          netReturnedProductsTotal: "$netTotalReturnedProduct",
          netReturnedFeesTotal: "$netTotalReturnedFees",

          netProductsTotal: {
            $subtract: ["$productsTotalGross", "$productsTotalDiscount"],
          },
          netFeesTotal: {
            $subtract: ["$feesTotalGross", "$feesTotalDiscount"],
          },
          grandProductSold: {
            $ceil: {
              $add: [
                {
                  $subtract: ["$productsTotalGross", "$productsTotalDiscount"],
                },
                {
                  $multiply: [
                    {
                      $subtract: [
                        "$productsTotalGross",
                        "$productsTotalDiscount",
                      ],
                    },
                    "$taxRate",
                  ],
                },
              ],
            },
          },
          grandFees: {
            $ceil: {
              $add: [
                {
                  $subtract: ["$feesTotalGross", "$feesTotalDiscount"],
                },
                {
                  $multiply: [
                    {
                      $subtract: ["$feesTotalGross", "$feesTotalDiscount"],
                    },
                    "$taxRate",
                  ],
                },
              ],
            },
          },
          overAllGross: { $add: ["$productsTotalGross", "$feesTotalGross"] },
          overAllDiscount: {
            $add: ["$productsTotalDiscount", "$feesTotalDiscount"],
          },

          // Temporary inline field declaration to enable calculation steps right below it
          taxAmount: {
            $ceil: {
              $multiply: [
                {
                  $add: [
                    {
                      $subtract: [
                        "$productsTotalGross",
                        "$productsTotalDiscount",
                      ],
                    },
                    { $subtract: ["$feesTotalGross", "$feesTotalDiscount"] },
                  ],
                },
                { $ifNull: ["$taxRate", 0] }, // Fallback to 0 if taxRate is missing
              ],
            },
          },

          grandLossFromProducts: {
            $ceil: {
              $add: [
                "$netTotalReturnedProduct",
                {
                  $multiply: [
                    "$netTotalReturnedProduct",
                    { $ifNull: ["$taxRate", 0] },
                  ],
                },
              ],
            },
          },
          gradLossFromFees: {
            $ceil: {
              $add: [
                "$netTotalReturnedFees",
                {
                  $multiply: [
                    "$netTotalReturnedFees",
                    { $ifNull: ["$taxRate", 0] },
                  ],
                },
              ],
            },
          },
          // 🔴 Final Grand Losses from CANCELLATIONS (Only if status matches Cancelled)
          grandTotalLossFromCancellations: {
            $cond: {
              if: { $eq: ["$serviceStatus", CANCELLED_OBJECT_ID] }, // Replace with your actual Cancelled ID variable/string
              then: {
                $ceil: {
                  $add: [
                    "$netTotalReturnedProduct",
                    "$netTotalReturnedFees",
                    {
                      $multiply: [
                        {
                          $add: [
                            "$netTotalReturnedProduct",
                            "$netTotalReturnedFees",
                          ],
                        },
                        { $ifNull: ["$taxRate", 0] },
                      ],
                    },
                  ],
                },
              },
              else: 0,
            },
          },

          // 🔴 Final Grand Losses from RETURNS (Only if status matches Returned)
          grandTotalLossFromReturns: {
            $cond: {
              if: { $eq: ["$serviceStatus", RETURNED_OBJECT_ID] }, // Replace with your actual Returned ID variable/string
              then: {
                $ceil: {
                  $add: [
                    "$netTotalReturnedProduct",
                    "$netTotalReturnedFees",
                    {
                      $multiply: [
                        {
                          $add: [
                            "$netTotalReturnedProduct",
                            "$netTotalReturnedFees",
                          ],
                        },
                        { $ifNull: ["$taxRate", 0] },
                      ],
                    },
                  ],
                },
              },
              else: 0,
            },
          },

          grandTotal: {
            $ceil: {
              $add: [
                {
                  $subtract: ["$productsTotalGross", "$productsTotalDiscount"],
                },
                { $subtract: ["$feesTotalGross", "$feesTotalDiscount"] },
                {
                  $multiply: [
                    {
                      $add: [
                        {
                          $subtract: [
                            "$productsTotalGross",
                            "$productsTotalDiscount",
                          ],
                        },
                        {
                          $subtract: ["$feesTotalGross", "$feesTotalDiscount"],
                        },
                      ],
                    },
                    { $ifNull: ["$taxRate", 0] },
                  ],
                },
              ],
            },
          },
        },
      },

      { $sort: { _id: -1 } },
    ]);

    const statsSummary = stats.reduce(
      (acc, curr) => {
        const serivceStatus = curr.serviceStatus.toString();
        const isDeadState =
          serivceStatus ===
            new mongoose.Types.ObjectId(SERVICE_STATUS_CANCELLED_ID) ||
          serivceStatus ===
            new mongoose.Types.ObjectId(SERVICE_STATUS_RETURNED_ID);
        acc.grandLossFromProductsReturnedOrCancelled +=
          curr.grandLossFromProducts;
        acc.grandLossFromFeesReturnedOrCancelled += curr.gradLossFromFees;
        if (!isDeadState) {
          acc.totalGlobalProductSoldGrossPrice += curr.productsTotalGross;
          acc.totalGlobalFeesGrossPrice += curr.feesTotalGross;
          acc.totalGlobalProductSoldDiscount += curr.productsTotalDiscount;
          acc.totalGlobalFeesDiscount += curr.feesTotalDiscount;
          acc.totalNetProductsSold += curr.netProductsTotal;
          acc.totalNetFees += curr.netFeesTotal;

          acc.grossProfit += curr.overAllGross;
          acc.totalDiscount += curr.overAllDiscount;
          acc.totalTax += curr.taxAmount;
          acc.grandProductsSold += curr.grandProductSold;
          acc.grandFees += curr.grandFees;
          acc.totalGrand += curr.grandTotal;
          acc.totalAmountReceived += curr.amountReceived;
          acc.pendingCustomerDebt += curr.grandTotal - curr.amountReceived;
        } else {
          // Cancled or refunded
          acc.servicesCanceledOrReturned += 1;
          acc.totalCashRefunded += curr.amountReceived;

          if (serivceStatus === SERVICE_STATUS_CANCELLED_ID) {
            acc.lostRevenueCancelled += curr.grandTotalLossFromCancellations;
          } else {
            acc.lostRevenueReturned += curr.grandTotalLossFromReturns;
          }
        }
        return acc;
      },
      {
        totalGlobalProductSoldGrossPrice: 0,
        totalGlobalFeesGrossPrice: 0,
        totalGlobalProductSoldDiscount: 0,
        totalGlobalFeesDiscount: 0,
        totalNetProductsSold: 0,
        totalNetFees: 0,

        grossProfit: 0,
        totalDiscount: 0,
        totalTax: 0,
        grandProductsSold: 0,
        grandFees: 0,
        totalGrand: 0,
        totalAmountReceived: 0, // Total actual money inside your bank/till right now
        pendingCustomerDebt: 0, // Total money customers still owe you on active cars
        // LOSS
        grandLossFromProductsReturnedOrCancelled: 0,
        grandLossFromFeesReturnedOrCancelled: 0,

        // Those number to track the amount refunded and lost due to cancellations and returns.
        servicesCanceledOrReturned: 0, // The number of services that got cancelled or returned
        totalCashRefunded: 0, // Total hard cash given back to customers
        lostRevenueCancelled: 0, // Total potential invoice value lost mid-job
        lostRevenueReturned: 0, // Total potential invoice value lost post-completion
      },
    );
    res.status(200).json({ status: "success", data: statsSummary });
  },
);
