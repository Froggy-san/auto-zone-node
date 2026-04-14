import { Schema, Document, model } from "mongoose";

interface ICategory extends Document {
  name: string;
  image: string;
}

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: "",
  },
});

export const Category = model<ICategory>("Categories", categorySchema);
