import { Model } from "mongoose";
import { catchAsync } from "./catchAsync";
import { NextFunction, Request, Response } from "express";
import { AppError } from "./appError";
import APIFeatures from "./apiFeatures";
export const deleteOne = (Model: Model<any>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document)
      return next(
        new AppError(`No document found with that ID ${req.params.id}`, 404),
      );

    res.status(204).json({ status: "success", data: null });
  });

export const updateOne = (Model: Model<any>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const document = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!document)
      return next(
        new AppError(`Failed to update document ${req.params.id}`, 500),
      );

    res.status(200).json({
      status: "success",
      data: {
        data: document,
      },
    });
  });

export const createOne = (Model: Model<any>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const document = await Model.create(req.body);

    if (!document)
      return next(
        new AppError(`Failed to create document ${req.params.id}`, 500),
      );

    res.status(201).json({
      status: "success",
      data: {
        data: document,
      },
    });
  });

export const getOne = (Model: Model<any>, populateOptions?: any) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let query = Model.findById(req.params.id);

    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;
    if (!doc) return next(new AppError(`No document found with that ID`, 404));
    res.status(200).json({
      status: "success",
      data: { data: doc },
    });
  });

export const getAll = (Model: Model<any>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .limitFields()
      .sort()
      .paginate();

    const totalCount = await Model.countDocuments(features.filtersObj);

    const limit = parseInt(req.query.limit as string, 100) || 100;
    const page = parseInt(req.query.page as string, 1) || 1;

    const totalPages = Math.ceil(totalCount / limit);

    const doc = await features.query;

    if (!doc)
      return next(
        new AppError(
          `Failed to get a hold of the data you requested, Please try again later`,
          500,
        ),
      );
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
        },
      },
    });
  });
