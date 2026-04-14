import { Document, model, Schema } from "mongoose";

interface IProductBrand extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export const ProductBrandSchema = new Schema({
  name: {
    type: String,
    minlength: [2, "Product brand name must be longer than 2 characters"],
    maxLength: [50, "Product brand name must be longer than 2 characters"],
    required: [true, "Product brand name is required"],
  },
});

export const ProductBrand = model<IProductBrand>(
  "productBrands",
  ProductBrandSchema,
);
