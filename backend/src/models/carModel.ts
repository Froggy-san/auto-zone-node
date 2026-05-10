import mongoose, { Schema, model, Document, Query } from "mongoose";
import { CarImage } from "../@types/cars";
import { IUser } from "./userModel";

const CarImageSchema = new Schema({
  imagePath: {
    type: String,

    requried: true,
  },
  filebane: {
    type: String,
    default: "",
  },
  isMain: {
    type: Boolean,
    default: "",
  },
});

export interface ICar extends Document {
  id: string;
  plateNumber: string;
  chassisNumber: string;
  motorNumber: string;
  color?: string;
  odometer?: string; // Sticking to string as per your SQL 'character varying'
  notes?: string;
  user: mongoose.Types.ObjectId;
  client?: IUser;
  carGeneration: mongoose.Types.ObjectId;
  mainImageName: string;
  carImages: CarImage[];
  createdAt: Date;
  updatedAt: Date;
}

const carSchema = new Schema<ICar>(
  {
    plateNumber: {
      type: String,
      required: [true, "Plate number is required"],
      trim: true,
      uppercase: true,
    },
    chassisNumber: {
      type: String,
      required: [true, "Chassis number is required"],
      unique: true, // Unique constraint for vehicle identification
      trim: true,
    },
    motorNumber: {
      type: String,
      required: [true, "Motor number is required"],
      trim: true,
    },
    color: {
      type: String,
      trim: true,
    },
    odometer: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      default: "",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: [true, "A car must belong to a client"],
    },
    carGeneration: {
      type: Schema.Types.ObjectId,
      ref: "carGenerations",
      required: [true, "A car must have a specific generation/model"],
    },
    mainImageName: {
      type: String,
      default: "",
    },
    carImages: [CarImageSchema],
  },
  {
    virtuals: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true, // This automatically creates 'createdAt' and 'updatedAt'
  },
);

// carSchema.pre(/^find/, function (this: Query<any, any>) {
//   this.populate([
//     {
//       path: "carGeneration",
//       // select: "name image"x, // 👈 Only get what you need for the UI
//       populate: {
//         path: "carModel",
//         model: "carModels",
//         // select: "name",
//         populate: {
//           path: "carMaker",
//           model: "carMakers",
//           // select: "name logo",
//         },
//       },
//     },
//     {
//       path: "user",
//       // select: "username picture", // 👈 Crucial: Don't fetch email/password here
//     },
//   ]);
// });

export const Car = model<ICar>("cars", carSchema);
