import mongoose, { Document, model, Schema } from "mongoose";

interface ICarGeneration extends Document {
  name: string;
  notes: string;
  image: string;
  carModel: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const carGenerationSchema = new Schema(
  {
    name: {
      type: String,
      minLength: [2, "Car generation name must be longer than 2 characters"],
      maxLength: [50, "Car generation name must be less than 50 characters"],
      required: [true, "car generation must have a name"],
    },
    notes: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    carModel: {
      type: mongoose.Types.ObjectId,
      ref: "carModels",
    },
  },
  {
    timestamps: true, // This automatically creates 'createdAt' and 'updatedAt'
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export const CarGeneration = model<ICarGeneration>(
  "carGenerations",
  carGenerationSchema,
);
