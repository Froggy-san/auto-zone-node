import { NextFunction, Request, Response } from "express";
import { ProductSold } from "../models/productSoldModel";
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

export const getAllsServices = getAll(Service);

export const getService = getOne(Service);

import mongoose from "mongoose";

export const createService = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { serviceFees, productsSold, ...rest } = req.body;

    // 1. Start a Session
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      let createdServiceFees = [];
      let createdProductsSold = [];

      // 2. Insert Service Fees
      if (serviceFees?.length) {
        // Pass the session to the options
        createdServiceFees = await ServiceFee.create(serviceFees, { session });
      }

      // 3. Insert Products Sold
      if (productsSold?.length) {
        createdProductsSold = await ProductSold.create(productsSold, {
          session,
        });
      }

      // 4. Create the Main Service record (Optional - if you have one)
      // const newService = await Service.create([{ ...rest, serviceFees: ..., productsSold: ... }], { session });

      // 5. If everything is successful, commit the changes
      await session.commitTransaction();

      res.status(201).json({
        status: "success",
        data: { createdServiceFees, createdProductsSold },
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

//         let createdServiceFees = [] as IServiceFee[];
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

export const updateProductSold = updateOne(ProductSold);
export const deleteProductSold = deleteOne(ProductSold);
