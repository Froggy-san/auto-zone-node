import mongoose, { Document, model, Schema } from "mongoose";

interface ICarModel extends Document {
  name: string;
  notes: string;
  logo: string;
  carMaker: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const carModelSchema = new Schema(
  {
    name: {
      type: String,
      minLength: [2, "Car model name must be longer than 2 characters"],
      maxLength: [50, "Car model name must be less than 50 characters"],
      required: [true, "car model must have a name"],
    },
    notes: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    carMaker: {
      type: mongoose.Types.ObjectId,
      ref: "carMakers",
    },
  },
  {
    timestamps: true, // This automatically creates 'createdAt' and 'updatedAt'
  },
);

export const CarModel = model<ICarModel>("carModels", carModelSchema);
