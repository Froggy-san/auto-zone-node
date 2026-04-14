import { Document, model, Schema } from "mongoose";

interface ICarMaker extends Document {
  name: string;
  notes: string;
  logo: string;
  createdAt: Date;
  updatedAt: Date;
}

export const carMakerSchema = new Schema(
  {
    name: {
      type: String,
      minLength: [2, "Car maker name must be longer than 2 characters"],
      maxLength: [50, "Car maker name must be less than 50 characters"],
      required: [true, "Car maker must have a name"],
    },
    notes: {
      type: String,
      default: "",
    },
    logo: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // This automatically creates 'createdAt' and 'updatedAt'
  },
);

export const carMaker = model<ICarMaker>("carMakers", carMakerSchema);
