import { Request, Response, NextFunction } from "express";

import { catchAsync } from "../utils/catchAsync";

import { getAll, getOne } from "../utils/controllerFactory";
import multer from "multer";
import path from "path";
import { AppError } from "../utils/appError";
import { deleteFiles } from "../utils/helper";
import { ProductType } from "../models/productType";

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/productTypes");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `productType-${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};
export const upload = multer({
  storage: multerStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 10 }, // 5MB limit
});

export const createProductType = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.file) req.body.image = req.file.filename;

    const createdProductType = await ProductType.create(req.body);
    if (!createdProductType) {
      if (req.file) deleteFiles([req.file.filename]);
      return next(new AppError("Failed to create product type", 500));
    }
    res.status(201).json({
      status: "success",
      data: createdProductType,
    });
  },
);

export const getProductTypes = getAll(ProductType);

export const getProductType = getOne(ProductType);

export const updateProductType = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const previousData = await ProductType.findById(req.params.id);

    if (!previousData)
      return next(
        new AppError("Faild to find related product type to update", 500),
      );

    const previousImage = previousData.image;

    if (req.file) req.body.image = req.file.filename;

    const createdCategory = await ProductType.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!createdCategory) {
      if (req.file) deleteFiles([req.file.filename]);
      return next(new AppError("Failed to create category", 500));
    }

    if (req.file && previousImage) deleteFiles([previousImage]);
    res.status(201).json({
      status: "success",
      data: createdCategory,
    });
  },
);
export const deleteProductType = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const productTypeToDelete = await ProductType.findById(req.params.id);

    if (!productTypeToDelete)
      return next(
        new AppError("Faild to find related product type to delete", 500),
      );

    const imageToDelete = productTypeToDelete.image;

    const deletedProductType = await ProductType.findByIdAndDelete(
      req.params.id,
    );
    if (req.file && imageToDelete) deleteFiles([imageToDelete]);
    if (!deletedProductType)
      return next(new AppError("Failed to delete product type", 500));
    res.status(204).json({
      status: "success",
      data: null,
    });
  },
);
