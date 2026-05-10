import mongoose, { model, Schema } from "mongoose";

export interface IService {
  id: string;

  createdAt: Date;
  updatedAt: Date;
  user: mongoose.Types.ObjectId;
  car: mongoose.Types.ObjectId;
  serviceStatus: mongoose.Types.ObjectId;
  odometer: string;
  totalDiscount: number;
  totalPrice: number;
  priority: "low" | "medium" | "high";
  note: string;
}

const SerivceSchema = new Schema<IService>(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      required: true,
    },

    car: {
      type: mongoose.Types.ObjectId,
      ref: "cars",
      required: true,
    },
    serviceStatus: {
      type: mongoose.Types.ObjectId,
      ref: "serviceStatuses",
      required: true,
    },
    odometer: {
      type: String,
      required: true,
    },
    totalPrice: {
      type: Number,
      requried: true,
    },
    totalDiscount: {
      type: Number,
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      message: "Role must be either low, medium, or high",
      default: "low",
    },
    note: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export const Service = model<IService>("services", SerivceSchema);
