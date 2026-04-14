import mongoose, { Document, model, Schema } from "mongoose";

interface IProductType extends Document {
  name: string;
  category: mongoose.Types.ObjectId;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

const productTypeSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      minLength: [2, "Product type is too short"],
      maxLength: [50, "Prodcut type is too long"],
      required: [true, "Prodcut Type is required"],
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "categories",
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

export const ProductType = model<IProductType>(
  "productTypes",
  productTypeSchema,
);
