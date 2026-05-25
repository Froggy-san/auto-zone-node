import multer from "multer";
import { AppError } from "../utils/appError";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import sharp from "sharp";
import { Car } from "../models/carModel";
import { deleteFiles } from "../utils/helper";
import { CarImage } from "../@types/cars";
import { getAll, getOne } from "../utils/controllerFactory";
import { stripTypeScriptTypes } from "node:module";
import { CarMaker } from "../models/carMaker";
import { CarGeneration } from "../models/carGeneration";
import { Model } from "../models/modelModel";
import { Types } from "mongoose";
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
        isMain,
      });
    }

    next();
  },
);

export const createCar = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const carImages = (req.body.carImages || []) as CarImage[];

    try {
      const car = await Car.create(req.body);

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

      throw new Error(error.message || "Failed to create a new car");
    }
  },
);
export const handleCarFilters = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1. Create a shallow copy so we can manipulate it safely
    Object.defineProperty(req, "query", {
      value: { ...req.query },
      writable: true,
      configurable: true,
      enumerable: true,
    });
    const queryObj = { ...req.query };
    const { carMaker, carModel, carGeneration } = queryObj;

    if (carGeneration && (carGeneration as string).trim() !== "") return next();

    if (carMaker && !carModel) {
      const models = await Model.find({ carMaker: carMaker as string }).select(
        "_id",
      );
      const modelIds = models.map((m) => m._id);

      const generations = await CarGeneration.find({
        carModel: { $in: modelIds },
      }).select("_id");

      const generationIds = generations.map((g) => g._id);

      // 2. Update our local copy

      if (generationIds) {
        queryObj.carGeneration = { in: generationIds } as any;
      } else {
        queryObj.carGeneration = { in: [] }; //! if there are no generation, put an invaild value so it returns an empty array
      }
    } else if (carModel) {
      const generations = await CarGeneration.find({
        carModel: carModel as string,
      }).select("_id");
      const generationIds = generations.map((g) => g._id);

      if (generationIds.length > 0) {
        queryObj.carGeneration = { in: generationIds } as any;
      } else {
        queryObj.carGeneration = { in: [] }; //! if there are no generation, put an invaild value so it returns an empty array
      }
    }

    delete queryObj.carModel;
    delete queryObj.carMaker;
    // 3. CRITICAL: Replace the entire req.query object
    req.query = queryObj;

    console.log("FINAL REQ.QUERY:", req.query);
    next();
  },
);
// export const handleCarFilters =catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {

//     const {carMaker,carModel, carGeneration} = req.query

//     if(carGeneration) return next()
//     if(carMaker && carModel === undefined) {
//       const models = await Car.find({carMaker})
//       const generation = await CarGeneration.find({$in:models})
//       req.query.carGeneration = `[in]=${generation}`
//       delete req.query.carMaker
//     } else {
//       const generations = await CarGeneration.find({carModel})
// req.query.carGeneration = `[in]=${generations}`
// delete req.query.carModel

//     }

//     next()
//   })
export const getCars = getAll(Car, [
  {
    path: "carGeneration",
    select: "name image",
    populate: {
      path: "carModel",
      model: "carModels",
      select: "name image",
      populate: {
        path: "carMaker",
        model: "carMakers",
        select: "name logo",
      },
    },
  },
  {
    path: "user",
    select: "id _id username picture", // 👈 Crucial: Don't fetch email/password here
  },
]);

export const getCarAndRelated = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { carId } = req.query;
    const { userId } = req.params;

    const generationPopOpts = {
      path: "carGeneration",
      model: "carGenerations",
      populate: {
        path: "carModel",
        model: "carModels",
        populate: {
          path: "carMaker",
          model: "carMakers",
        },
      },
    };

    if (!carId) return next(new AppError(`Invaild carId: ${carId}`, 400));
    if (!userId) return next(new AppError(`Invaild userId: ${userId}`, 400));

    const car = await Car.findById(carId)
      .populate([
        generationPopOpts,
        {
          path: "user",
          select: "-password -role -passwordChangedAt -updatedAt -createdAt",
        },
      ])
      .lean();

    if (!car) return next(new AppError(`Failed to find car data`, 500));

    if (!car) return next(new AppError(`No car found`, 404));

    const relatedCars = await Car.find({ _id: { $ne: car._id } }).populate({
      path: "carGeneration",
      model: "carGenerations",
      select: "name image",
      populate: {
        path: "carModel",
        model: "carModels",
        select: "name image",
        populate: {
          path: "carMaker",
          model: "carMakers",
          select: "logo name",
        },
      },
    });

    if (!relatedCars)
      console.error(
        `Failed to find the related cars to a car with the ID:${car.id}`,
      );

    const data = { ...car, relatedCars };

    // const car = {
    //   ...selectedCar,
    //   relatedCars: cars.filter((c) => c.id !== selectedCar.id),
    // };

    res.status(200).json({
      status: "success",
      data,
    });
  },
);

export const getCar = getOne(Car);

export const updateCar = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    const newImages = (req.body.carImages || []) as CarImage[];
    const imagesToDelete = (req.body.imagesToDelete || []) as string[];

    try {
      const previousData = await Car.findById(id);

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
      console.log(imagesToDelete, "-----------------");
      const updatedCar = await Car.findByIdAndUpdate(id, req.body, {
        returnDocument: "after",
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
    } catch (error: any) {
      deleteFiles(newImages.map((m) => m.imagePath));
      throw new Error(error.message);
    }
  },
);

export const deleteCar = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    const carToDelete = await Car.findById(id);

    if (!carToDelete) {
      return next(new AppError("No car found with that ID", 404));
    }
    const car = await Car.findByIdAndDelete(id);

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
