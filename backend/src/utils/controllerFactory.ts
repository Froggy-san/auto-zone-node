import { model, Model } from "mongoose";
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

export const getOne = (
  Model: Model<any>,
  populateOptions?: any,
  shouldFetchNextPrev: boolean = false,
) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let query = Model.findById(req.params.id);

    if (populateOptions) query = query.populate(populateOptions);

    const doc = await query;
    if (!doc) return next(new AppError(`No document found with that ID`, 404));

    const queryObj = { ...req.query };

    delete queryObj.page;
    delete queryObj.limit;

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    const filterObj = JSON.parse(queryStr);

    Object.keys(filterObj).forEach((key) => {
      if (
        (typeof filterObj[key] === "string" && filterObj[key] !== "true") ||
        filterObj[key] !== "false"
      ) {
        filterObj[key] = { $regex: filterObj[key], $options: "i" };
      }
    });

    let nextDoc = null;
    let prevDoc = null;

    if (shouldFetchNextPrev) {
      nextDoc = await Model.findOne({ ...filterObj, _id: { $gt: doc._id } })
        .sort({ _id: 1 })
        .select("_id");

      prevDoc = await Model.findOne({ ...filterObj, _id: { $lt: doc._id } })
        .sort({ _id: -1 })
        .select("_id");
    }
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
        nextId: nextDoc?._id || null,
        prevId: prevDoc?._id || null,
      },
    });
  });

export const getAll = (
  Model: Model<any>,
  populateOptions?: any,
  options?: Record<string, any>,
) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.query, "QUERY");
    console.log(req.params, "PARAMs");
    // 1. Initialize the base query with options
    let baseQuery = Model.find();
    if (options) baseQuery = baseQuery.setOptions(options);

    // 2. Build features based on that base query
    const features = new APIFeatures(baseQuery, req.query)
      .filter()
      .limitFields()
      .sort()
      .paginate();

    // 3. IMPORTANT: Apply options to the Count too!
    // We create a count query and apply the same options
    const countQuery = Model.countDocuments(features.filtersObj);
    if (options) countQuery.setOptions(options);
    const totalCount = await countQuery;

    // 4. Fix the radix (the 100 and 1 you had earlier)
    const limit = parseInt(req.query.limit as string, 10) || 100;
    const page = parseInt(req.query.page as string, 10) || 1;
    const totalPages = Math.ceil(totalCount / limit);

    // 5. Finalize the document query
    let query = features.query;
    if (populateOptions) query = query.populate(populateOptions);

    const doc = await query;

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
