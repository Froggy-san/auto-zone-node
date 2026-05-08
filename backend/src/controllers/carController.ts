import multer from "multer";
import { AppError } from "../utils/appError";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import sharp from "sharp";
import { CarModel } from "../models/carModel";
import { deleteFiles } from "../utils/helper";
import { CarImage } from "../@types/cars";
import { getAll, getOne } from "../utils/controllerFactory";
import { stripTypeScriptTypes } from "node:module";
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
  if (
    file.mimetype.startsWith("image") ||
    file.mimetype === "application/octet-stream"
  ) {
    cb(null, true);
  } else {
    cb(
      cb(new AppError("Not an image! Please upload only images.", 400), false),
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const uploadCarImages = upload.array("carImages", 30);

export const processCarImages = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as Express.Multer.File[];
    if (!files || !files.length) return next();

    req.body.carImages = [];
    for (const file of files) {
      const imageName = `car-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpeg`;

      await sharp(file.buffer)
        // .resize(800, 800) // Recommended to keep  your garage catalog looking uniform
        .toFormat("jpeg")
        // .jpeg({ quality: 90 })
        .toFile(`public/uploads/cars/${imageName}`);

      // 3. Robust isMain logic
      // It's main if: it matches the name OR if it's the first image and no name was provided
      let isMain = file.originalname === req.body.mainImageName;

      req.body.carImages.push({
        imagePath: `/uploads/cars/${imageName}`,
        filename: file.originalname,
        isMain: isMain,
      });
    }

    next();
  },
);

export const createCar = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const carImages = (req.body.carImages || []) as CarImage[];
    try {
      const car = await CarModel.create(req.body);

      if (!car && carImages.length) {
        const imagesToDelete = carImages.map((m) => m.imagePath);
        deleteFiles(imagesToDelete);
        res.status(500).json({
          status: "error",
          message: "Failed to create the car data",
        });
        return;
      }

      res.status(201).json({
        status: "success",
        data: {
          data: car,
        },
      });
    } catch (error: any) {
      const imagesToDelete = carImages.map((m) => m.imagePath);
      deleteFiles(imagesToDelete);
      console.log("ERRORRRR", imagesToDelete);
      throw new Error(error.message || "Failed to create a new car");
    }
  },
);

export const getCars = getAll(CarModel);

export const getCar = getOne(CarModel);

export const updateCar = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const newImages = (req.body.carImages || []) as CarImage[];
    const imagesToDelete = (req.body.imagesToDelete || []) as string[];

    const previousData = await CarModel.findById(id);

    if (!previousData) {
      if (newImages.length) {
        deleteFiles(newImages.map((m) => m.imagePath));
      }

      return next(
        new AppError(
          "Faild to get the related car you are trying to update, Please try again",
          404,
        ),
      );
    }

    const remainingImages = previousData.carImages.filter(
      (image) => !imagesToDelete.includes(image.imagePath),
    );

    req.body.carImages = [...remainingImages, ...newImages];

    const updatedCar = await CarModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedCar) {
      if (newImages.length) deleteFiles(newImages.map((m) => m.imagePath));
      return next(new AppError(`Failed to update car data`, 500));
    }

    if (imagesToDelete.length) deleteFiles(imagesToDelete);

    res.status(200).json({
      status: "success",
      data: { data: updatedCar },
    });
  },
);

export const deleteCar = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    const carToDelete = await CarModel.findById(id);

    if (!carToDelete) {
      return next(new AppError("No car found with that ID", 404));
    }
    const car = await CarModel.findByIdAndDelete(id);

    if (car && car.carImages.length) {
      const imagesToDelete = car.carImages.map((m) => m.imagePath);
      deleteFiles(imagesToDelete);
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  },
);
