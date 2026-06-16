import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { getAll, getOne, updateOne } from "../utils/controllerFactory";
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

export const updateMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;
    const user = req.user;
    const imageName =
      file && `${file.destination.split("public/")[1]}/${file.filename}`;

    if (!user)
      return next(
        new AppError(`Unauthorized action, you are not logged in`, 403),
      );

    if (imageName) req.body.picture = imageName;

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

export const deleteMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return next(new AppError("You are not logged in", 403));

    const deletedUser = await User.findByIdAndUpdate(user.id, {
      isDeleteed: true,
      deletedAt: Date.now(),
    });

    if (!deletedUser) return next(new AppError("Failed to delete user", 500));
    res.status(204).json({
      status: "success",
      data: null,
    });
  },
);

export const getUsers = getAll(User, null, { showDelete: true });

export const getUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const loggedInUser = req.user;

    if (!id) return next(new AppError(`Invaild id: ${id}`, 404));
    if (!loggedInUser)
      return next(
        new AppError(
          `Unauthorized action, Please make sure you are logged in`,
          404,
        ),
      );

    // Check if the current logged in user is and admin if the ids don't match
    if (id !== loggedInUser.id && loggedInUser.role !== "admin")
      return next(
        new AppError(
          `Unauthorized action, You are trying to receive other user's data`,
          403,
        ),
      );

    const user = await User.findById(id).populate("cars");

    if (!user) return next(new AppError("Failed to get user", 500));

    res.status(200).json({
      status: "success",
      data: {
        data: user,
      },
    });
  },
);

export const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newImage = req.file?.originalname;
    const { id } = req.params;

    if (!id) return next(new AppError("Invaild id, can't delete user", 400));

    const user = await User.findById(id);

    if (!user) return next(new AppError("User doesn't exist", 404));

    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      runValidators: true,
      new: true,
    });

    if (!updatedUser) {
      if (newImage) await deleteFiles([newImage]);
      return next(new AppError("Failed to update user's data", 500));
    }

    if (user.picture) await deleteFiles([user.picture]);

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  },
);

export const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!id) return next(new AppError("Invaild id, can't delete user", 400));

    const user = await User.findByIdAndDelete(id);

    if (!user) return next(new AppError("Failed to delete user", 500));

    if (user.picture) await deleteFiles([user.picture]);

    res.status(200).json({
      status: "success",
      data: null,
    });
  },
);
