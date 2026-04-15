import { Request, Response, NextFunction } from "express";

import { catchAsync } from "../utils/catchAsync";
import { ProductType } from "../models/productType";

export const getProducts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const productsQuery = await ProductType.find();

    res.status(200).json({
      status: "success",
      data: { data: productsQuery },
    });
  },
);

export const createProductType = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const createdProduct = await ProductType.create(req.body);
    console.log(createdProduct, "PRODUCT CREATED");
    res.status(201).json({
      status: "success",
      data: {
        product: createdProduct,
      },
    });
  },
);
