import { Document, Schema, model } from "mongoose";
import { Provider, Role } from "../@types";

export interface IUser extends Document {
  createdAt: Date;
  updatedAt: Date;
  name: string;
  email: string;
  password?: string;
  passwordConfirm?: string;
  picture: string;
  provider: Provider;
  isDeleted: boolean;
  deletedAt?: Date; // Optional because it's only set on delete
  role: Role;
}

export const clientSchema = new Schema<IUser>(
  {
    name: {
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
    deletedAt: Date, // Match JS naming convention (deletedAt vs deleted_at)
  },
  { timestamps: true },
);

export const Client = model<IUser>("users", clientSchema);
