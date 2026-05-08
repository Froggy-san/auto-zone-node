import mongoose, { Document, Query, Schema, model } from "mongoose";
import { Provider, Role } from "../@types";
import { NextFunction } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { ICar } from "./carModel";
export interface IUser extends Document {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  username: string;
  email: string;
  password?: string;
  passwordConfirm?: string;
  picture: string;
  provider: Provider;
  isDeleted?: boolean;
  deletedAt?: Date; // Optional because it's only set on delete
  cars?: ICar[];
  phones: string[];
  role: Role;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  isCorrectPassword(
    enteredPassword: string,
    passwordInDb: string,
  ): Promise<boolean>;
  isPassChangedAfterJWT: (JWTTimeStamp: number) => boolean;
  createPasswordResetToken: () => string;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Please provide a name for the user"],
      trim: true,
      minlength: [4, "Name must be at least 4 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      unique: true,
      lowercase: true, // Corrects 'lowerCase' typo
      trim: true,
      required: [true, "Please provide an email"],
    },
    password: {
      type: String,
      required: [
        function (this: any) {
          return this.provider === "email";
        },
        "Please provide a password",
      ],
      minlength: [8, "Password is too short"],
      select: false, // DO NOT leak this to the frontend
    },
    picture: {
      type: String,
      default: "",
    },
    provider: {
      type: String,
      enum: {
        values: ["email", "google"],
        message: "{VALUE} is not a supported provider",
      },
      default: "email",
    },
    role: {
      type: String,
      enum: {
        values: ["admin", "user"],
        message: "Role must be either admin or user",
      },
      default: "user",
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false, // Professional tip: Hide this from normal queries
    },
    phones: [String],
    deletedAt: Date, // Match JS naming convention (deletedAt vs deleted_at)
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.virtual("cars", {
  ref: "cars",
  foreignField: "user",
  localField: "_id",
});
// 1. We specify { query: true } in the options object

// userSchema.pre(/^find/, {  query: true }, function (this: Query<any, IUser>, next: NextFunction) {
//   this.find({ isDeleted: { $ne: false } });
//   next();
// });

//! Here the middleware won't just work for the find method but also for the count method as well.
userSchema.pre(/^find|^count/, function (
  this: Query<any, IUser>,
  next: NextFunction,
) {
  if (this.getOptions().showDelete) return;
  this.where({ active: { $ne: false } });
} as any); // The 'as any' here only applies to the hook registration, not your logic

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password as string, 12);
  }
});

userSchema.pre("save", async function () {
  if (!this.isModified("password") || this.isNew) return;

  this.passwordChangedAt = new Date(Date.now() - 1000);
});
userSchema.methods.isPassChangedAfterJWT = function (
  JWTTimeStamp: number,
): boolean {
  if (this.passwordChangedAt) {
    // Use Math.floor to get the integer part of the seconds
    const changedTimeStamp = Math.floor(
      this.passwordChangedAt.getTime() / 1000,
    );

    // If the time the password changed is greater than the time the token was issued
    // it means the password was changed AFTER the token was created.

    return JWTTimeStamp < changedTimeStamp;
  }

  // False means NOT changed (password is still valid)
  return false;
};

userSchema.methods.isCorrectPassword = async (
  endteredPassword: string,
  passwordInDb: string,
): Promise<boolean> => {
  return await bcrypt.compare(endteredPassword, passwordInDb);
};

userSchema.methods.createPasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sh256")
    .update(token)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return token;
};

export const User = model<IUser>("users", userSchema);
