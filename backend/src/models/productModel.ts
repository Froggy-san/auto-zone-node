import mongoose, { Schema, model, Document } from "mongoose";
import { MoreDetail } from "../@types";

export interface IProduct extends Document {
  name: string;
  description: string;
  listPrice: number;
  salePrice: number;
  stock: number;
  isAvailable: boolean;
  generations: mongoose.Types.ObjectId[];
  moreDetails: MoreDetail[];
  category: mongoose.Types.ObjectId;
  productType: mongoose.Types.ObjectId;
  productBrand: mongoose.Types.ObjectId;
  maker: mongoose.Types.ObjectId;
  carModel: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const moreDetailSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    table: [
      {
        title: String,
        description: String,
      },
    ],
  },
  { _id: false },
); // <--- IMPORTANT: Prevents Mongoose from giving every detail a random ID

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true, // Professional touch: removes accidental whitespace
      maxlength: [100, "Name cannot exceed 100 characters"],
      minlength: [3, "Name must be at least 3 characters"],
    },
    description: {
      type: String,
      default: "",
    },
    listPrice: {
      type: Number,
      required: [true, "List price is required"],
    },
    salePrice: {
      type: Number,
      required: [true, "Sale price is required"],
      validate: {
        // This only works on .create() and .save()
        validator: function (this: any, val: number) {
          return val <= this.listPrice;
        },
        message:
          "Sale price ({VALUE}) must be lower than or equal to list price",
      },
    },
    stock: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    generations: [
      {
        type: Schema.Types.ObjectId,
        ref: "carGenerations", // Ensure this matches your Generation model name
      },
    ],

    moreDetails: [moreDetailSchema],
    // Relationships (SQL Foreign Keys -> MongoDB References)
    category: {
      type: Schema.Types.ObjectId,
      ref: "categories",
    },
    productType: {
      type: Schema.Types.ObjectId,
      ref: "productType",
    },
    productBrand: {
      type: Schema.Types.ObjectId,
      ref: "productBrands",
    },
    maker: {
      type: Schema.Types.ObjectId,
      ref: "carMakers",
    },
    carModel: {
      type: Schema.Types.ObjectId,
      ref: "carModels",
    },
  },
  {
    timestamps: true, // This automatically creates 'createdAt' and 'updatedAt'
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export const Product = model<IProduct>("products", productSchema);
