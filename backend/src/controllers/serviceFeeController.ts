import { NextFunction, Request, Response } from "express";
import { ServiceFee } from "../models/serviceFeeModel";
import { catchAsync } from "../utils/catchAsync";

import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "../utils/controllerFactory";
import mongoose from "mongoose";
import { AppError } from "../utils/appError";
import { Service } from "../models/serviceModel";
import { updateServiceTotals } from "./serviceController";

export const getAllServiceFees = getAll(ServiceFee);

export const getServiceFee = getOne(ServiceFee, {
  path: "category",
  select: "name",
});
export const createServiceFee = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const service = await Service.findById(body.service).session(session);
      if (!service)
        return next(new AppError(`Service not found ID: ${body.service}`, 404));

      await updateServiceTotals({
        serviceId: body.service,
        price: body.price,
        discount: body.discount,
        session,
      });

      const createdFee = await ServiceFee.create(
        [{ ...body, totalPriceAfterDiscount: body.price - body.discount }],
        { session },
      );
      if (!createdFee)
        return next(
          new AppError(`Failed to create and add a new service fee`, 500),
        );

      await session.commitTransaction();

      res.status(200).json({
        message: "success",
        data: createdFee,
      });
    } catch (err) {
      await session.abortTransaction();
      return next(err);
    } finally {
      session.endSession();
    }
  },
);

export const updateServiceFee = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const body = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Get the current snapshot before changes are applied
      const serviceFee = await ServiceFee.findById(id).session(session);
      if (!serviceFee) {
        return next(
          new AppError(
            `Failed to find a service fee entry with the ID: ${id}`,
            404,
          ),
        ); // Fixed to 404!
      }

      // 2. Determine what the values WILL be after the update hits (fallback to current if not provided in body)
      const finalIsReturned =
        typeof body.isReturned === "boolean"
          ? body.isReturned
          : serviceFee.isReturned;
      const finalPrice =
        typeof body.price === "number" ? body.price : serviceFee.price;
      const finalDiscount =
        typeof body.discount === "number" ? body.discount : serviceFee.discount;

      // 3. Calculate financial impact BEFORE the update
      const oldEffectivePrice = serviceFee.isReturned ? 0 : serviceFee.price; //500
      const oldEffectiveDiscount = serviceFee.isReturned
        ? 0
        : serviceFee.discount;

      // 4. Calculate financial impact AFTER the update
      const newEffectivePrice = finalIsReturned ? 0 : finalPrice; //400
      const newEffectiveDiscount = finalIsReturned ? 0 : finalDiscount;

      // 5. The Delta: New State minus Old State
      const priceDelta = newEffectivePrice - oldEffectivePrice;
      const discountDelta = newEffectiveDiscount - oldEffectiveDiscount;

      // 6. If there is any financial net change, adjust the parent service totals
      if (priceDelta !== 0 || discountDelta !== 0) {
        await updateServiceTotals({
          serviceId: serviceFee.service.toString(),
          price: priceDelta,
          discount: discountDelta,
          session,
        });
      }

      // 7. Apply the update safely to the fee itself
      const updatedServiceFee = await ServiceFee.findByIdAndUpdate(
        id,
        { ...body, totalPriceAfterDiscount: finalPrice - finalDiscount },
        {
          new: true,
          runValidators: true,
        },
      ).session(session);

      await session.commitTransaction();
      res.status(200).json({ status: "success", data: updatedServiceFee });
    } catch (err) {
      await session.abortTransaction();
      return next(err);
    } finally {
      session.endSession();
    }
  },
);

export const deleteServiceFee = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const serviceFee = await ServiceFee.findById(id).session(session);
      if (!serviceFee)
        return next(
          new AppError(
            `Failed to get a service fee entry with the ID:${id}`,
            400,
          ),
        );

      // Deduct cost from parent order balance ONLY if it wasn't already returned/voided

      await ServiceFee.findByIdAndDelete(id).session(session);

      if (!serviceFee.isReturned) {
        await updateServiceTotals({
          serviceId: serviceFee.service.toString(),
          price: -serviceFee.price,
          discount: -serviceFee.discount,
          session,
        });
      }

      await session.commitTransaction();
      res.status(204).end(); // 204 No Content is standard for explicit deletions
    } catch (err) {
      await session.abortTransaction();
      return next(err);
    } finally {
      session.endSession();
    }
  },
);
