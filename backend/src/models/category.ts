import { Schema, Document, model } from "mongoose";

interface ICategory extends Document {
  name: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // This automatically creates 'createdAt' and 'updatedAt'
  },
);

export const Category = model<ICategory>("categories", categorySchema);
