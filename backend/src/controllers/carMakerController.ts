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
import { CarMaker } from "../models/carMaker";

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/carMakers");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `carMaker-${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (file.mimetype.startsWith("logo")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an logo! Please upload only images.", 400), false);
  }
};
export const upload = multer({
  storage: multerStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 10 }, // 5MB limit
});

export const createCarMaker = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.file) req.body.logo = req.file.filename;

    const createdCarMaker = await CarMaker.create(req.body);
    if (!createdCarMaker) {
      if (req.file) deleteFiles([req.file.filename]);
      return next(new AppError("Failed to create car maker", 500));
    }
    res.status(201).json({
      status: "success",
      data: createdCarMaker,
    });
  },
);

export const getCarMakers = getAll(CarMaker, {
  path: "carModels",
  populate: {
    path: "generations",
  },
});

export const getCarMaker = getOne(CarMaker);
export const updateCarMaker = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const previousData = await CarMaker.findById(req.params.id);

    if (!previousData)
      return next(new AppError("Faild to find related product to update", 500));

    const previousImage = previousData.logo;

    if (req.file) req.body.logo = req.file.filename;

    const createdCarMaker = await CarMaker.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!createdCarMaker) {
      if (req.file) deleteFiles([req.file.filename]);
      return next(new AppError("Failed to create car maker", 500));
    }

    if (req.file && previousImage) deleteFiles([previousImage]);
    res.status(201).json({
      status: "success",
      data: createdCarMaker,
    });
  },
);

export const deleteCarMaker = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const carMakerToDelete = await CarMaker.findById(req.params.id);
    if (!carMakerToDelete)
      return next(
        new AppError("Failed to find related car maker to delete", 500),
      );
    const imageToDelete = carMakerToDelete.logo;
    const deletedCarMaker = await CarMaker.findByIdAndDelete(req.params.id);
    if (imageToDelete) deleteFiles([imageToDelete]);
    if (!deletedCarMaker)
      return next(new AppError("Failed to delete car maker", 500));
    res.status(204).json({
      status: "success",
      data: null,
    });
  },
);
