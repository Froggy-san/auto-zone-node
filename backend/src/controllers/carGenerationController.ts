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

import { CarGeneration } from "../models/carGeneration";

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/carGenerations");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `carGeneration-${file.fieldname}-${uniqueSuffix}${ext}`);
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

export const createCarGeneration = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.file) req.body.image = req.file.filename;

    const createdCarGeneration = await CarGeneration.create(req.body);
    if (!createdCarGeneration) {
      if (req.file) deleteFiles([req.file.filename]);
      return next(new AppError("Failed to create car generation", 500));
    }
    res.status(201).json({
      status: "success",
      data: createdCarGeneration,
    });
  },
);

export const getCarGenerations = getAll(CarGeneration);

export const getCarGeneration = getOne(CarGeneration);

export const updateCarGeneration = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const previousData = await CarGeneration.findById(req.params.id);

    if (!previousData)
      return next(
        new AppError("Faild to find related product type to update", 500),
      );

    const previousImage = previousData.image;

    if (req.file) req.body.image = req.file.filename;

    const updatedCarGeneration = await CarGeneration.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!updatedCarGeneration) {
      if (req.file) deleteFiles([req.file.filename]);
      return next(new AppError("Failed to create category", 500));
    }

    if (req.file && previousImage) deleteFiles([previousImage]);
    res.status(201).json({
      status: "success",
      data: updatedCarGeneration,
    });
  },
);
export const deleteCarGeneration = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const carGenerationToDelete = await CarGeneration.findById(req.params.id);

    if (!carGenerationToDelete)
      return next(
        new AppError("Failed to find related car generation to delete", 500),
      );

    const imageToDelete = carGenerationToDelete.image;

    const deletedCarGeneration = await CarGeneration.findByIdAndDelete(
      req.params.id,
    );
    if (req.file && imageToDelete) deleteFiles([imageToDelete]);
    if (!deletedCarGeneration)
      return next(new AppError("Failed to delete car generation", 500));
    res.status(204).json({
      status: "success",
      data: null,
    });
  },
);
