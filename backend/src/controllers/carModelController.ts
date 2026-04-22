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

import { Model } from "../models/modelModel";

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/carModels");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `carModel-${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (
    file.mimetype.startsWith("image") ||
    file.mimetype === "application/coctet-stream"
  ) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};
export const upload = multer({
  storage: multerStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 10 }, // 10MB limit
});

export const createCarModel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.file) req.body.image = req.file.filename;

    const createdCarModel = await Model.create(req.body);
    if (!createdCarModel) {
      if (req.file) deleteFiles([req.file.filename]);
      return next(new AppError("Failed to create car model", 500));
    }
    res.status(201).json({
      status: "success",
      data: createdCarModel,
    });
  },
);

export const getCarModels = getAll(Model);

export const getCarModel = getOne(Model);

export const updateCarModel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const previousData = await Model.findById(req.params.id);

    if (!previousData)
      return next(
        new AppError("Faild to find related product type to update", 500),
      );

    const previousImage = previousData.image;

    if (req.file) req.body.image = req.file.filename;

    const updatedCarModel = await Model.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!updatedCarModel) {
      if (req.file) deleteFiles([req.file.filename]);
      return next(new AppError("Failed to create category", 500));
    }

    if (req.file && previousImage) deleteFiles([previousImage]);
    res.status(201).json({
      status: "success",
      data: updatedCarModel,
    });
  },
);
export const deleteCarModel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const carModelToDelete = await Model.findById(req.params.id);

    if (!carModelToDelete)
      return next(
        new AppError("Faild to find related product type to delete", 500),
      );

    const imageToDelete = carModelToDelete.image;

    const deletedCarModel = await Model.findByIdAndDelete(req.params.id);
    if (req.file && imageToDelete) deleteFiles([imageToDelete]);
    if (!deletedCarModel)
      return next(new AppError("Failed to delete car model", 500));
    res.status(204).json({
      status: "success",
      data: null,
    });
  },
);
