import { Request, Response, NextFunction } from "express";

import { catchAsync } from "../utils/catchAsync";
import { CarModel } from "../models/carCarModel";

export const getCarModels = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const productsQuery = await CarModel.find();

    res.status(200).json({
      status: "success",
      data: { data: productsQuery },
    });
  },
);

export const createCarModel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const createdProduct = await CarModel.create(req.body);
    console.log(createdProduct, "PRODUCT CREATED");
    res.status(201).json({
      status: "success",
      data: {
        product: createdProduct,
      },
    });
  },
);
