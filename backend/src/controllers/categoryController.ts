import { Request, Response, NextFunction } from "express";

import { catchAsync } from "../utils/catchAsync";
import { ProductBrand } from "../models/productBrand";
import { Category } from "../models/category";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "../utils/controllerFactory";
import multer from "multer";
import path from "path";
import { AppError } from "../utils/appError";
import { deleteFiles } from "../utils/helper";

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/categories");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `category-${file.fieldname}-${uniqueSuffix}${ext}`);
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

export const createCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.file) req.body.image = req.file.filename;

    const createdCategory = await Category.create(req.body);
    if (!createdCategory) {
      if (req.file) await deleteFiles([req.file.filename]);
      return next(new AppError("Failed to create category", 500));
    }
    res.status(201).json({
      status: "success",
      data: createdCategory,
    });
  },
);

export const getCategories = getAll(Category);

export const getCategory = getOne(Category);

export const updateCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const previousData = await Category.findById(req.params.id);

    if (!previousData)
      return next(new AppError("Faild to find related product to update", 500));

    const previousImage = previousData.image;

    if (req.file) req.body.image = req.file.filename;

    const createdCategory = await Category.findByIdAndUpdate(
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
export const deleteCategroy = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const categoryToDelete = await Category.findById(req.params.id);
    if (!categoryToDelete)
      return next(new AppError("Faild to find related product to delete", 500));
    const imageToDelete = categoryToDelete.image;
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (imageToDelete) deleteFiles([imageToDelete]);
    if (!deletedCategory)
      return next(new AppError("Failed to delete category", 500));
    res.status(204).json({
      status: "success",
      data: null,
    });
  },
);
