import { Request, Response, NextFunction } from "express";

import { catchAsync } from "../utils/catchAsync";
import { ProductBrand } from "../models/productBrand";
import { Category } from "../models/category";

export const getCategories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const productsQuery = await ProductBrand.find();

    res.status(200).json({
      status: "success",
      data: { data: productsQuery },
    });
  },
);

export const createCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const createdProduct = await Category.create(req.body);
    console.log(createdProduct, "PRODUCT CREATED");
    res.status(201).json({
      status: "success",
      data: {
        product: createdProduct,
      },
    });
  },
);
