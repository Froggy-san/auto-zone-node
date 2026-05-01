import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { getAll, getOne } from "../utils/controllerFactory";
import { User } from "../models/userModel";
import multer from "multer";
import path from "path";
import { AppError } from "../utils/appError";
import { deleteFiles } from "../utils/helper";

export const getCurrentUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  req.params.id = req.user!.id; // Transfer the ID
  next(); // Pass control to getUser
};

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/avatars");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `avatar-${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Enter a vaild image", 400), false);
  }
};

export const uploadAvatar = multer({
  storage: multerStorage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 10 },
});

export const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;
    const user = req.user;

    if (!user)
      return next(
        new AppError(`Unauthorized action, you are not logged in`, 403),
      );

    if (file) req.body.picture = file.filename;

    const updatedUser = await User.findByIdAndUpdate(user.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      if (file) await deleteFiles([file.originalname]);
      return next(new AppError("Failed to update user's data", 500));
    }
    if (file && user.picture) {
      await deleteFiles([user.picture]);
    }

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  },
);

export function getMe(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return next();
  req.params.id = req.user.id;
  next();
}

export const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return next(new AppError("You are not logged in", 403));

    const deletedUser = await User.findByIdAndUpdate(user.id, {
      isDeleteed: true,
      deletedAt: Date.now(),
    });

    if (!deletedUser) return next(new AppError("Failed to delete user", 500));
    res.status(204).json();
  },
);

export const getUsers = getAll(User, null, { showDelete: true });

export const getUser = getOne(User);
