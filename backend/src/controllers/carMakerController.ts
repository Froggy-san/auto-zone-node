import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { CarMaker } from "../models/carMaker";

export const getCarMakers = catchAsync(async (req: Request, res: Response) => {
  const query = CarMaker.find();

  const carMakers = await query;

  res.status(200).json({
    status: "success",
    data: {
      carMakers,
    },
  });
});

export const createMaker = catchAsync(async (req: Request, res: Response) => {
  console.log(req.body, "BODY OF MAKER ");
  const createdMaker = await CarMaker.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      carMaker: createdMaker,
    },
  });
});
