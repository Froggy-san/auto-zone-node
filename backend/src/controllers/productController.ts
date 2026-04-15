import { Request, Response, NextFunction } from "express";
import { Product } from "../models/productModel";
import { catchAsync } from "../utils/catchAsync";

export const getProducts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const productsQuery = await Product.find();

    res.status(200).json({
      status: "success",
      data: { data: productsQuery },
    });
  },
);

export const createProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const createdProduct = await Product.create(req.body);
    console.log(createdProduct, "PRODUCT CREATED");
    res.status(201).json({
      status: "success",
      data: {
        product: createdProduct,
      },
    });
  },
);
