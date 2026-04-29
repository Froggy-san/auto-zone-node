import mongoose, { Schema, model, Document, Query } from "mongoose";
import { MoreDetail, ProductImage } from "../@types";
import { NextFunction } from "express";

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
  carMaker: mongoose.Types.ObjectId;
  carModel: mongoose.Types.ObjectId;
  productImages: ProductImage[];
  mainImageName?: string; // This is only used during creation, not stored in DB
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

const productImageSchema = new Schema({
  imageUrl: { type: String, required: true },
  filename: { type: String, required: true },
  isMain: { type: Boolean, default: false },
});

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
      defualt: 0,
      // validate: {
      //   // This only works on .create() and .save()
      //   validator: function (this: any, val: number) {

      //     return val <= this.listPrice;
      //   },
      //   message:
      //     "Sale price ({VALUE}) must be lower than or equal to list price",
      // },
    },
    stock: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },

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
    carMaker: {
      type: Schema.Types.ObjectId,
      ref: "carMakers",
      required: false,
    },
    carModel: {
      type: Schema.Types.ObjectId,
      ref: "carModels",
      required: false,
    },
    generations: [
      {
        type: Schema.Types.ObjectId,
        ref: "carGenerations", // Ensure this matches your Generation model name
      },
    ],
    productImages: [productImageSchema], // This is an array of subdocuments, not references
    mainImageName: {
      type: String,
      select: false, // This field is only used during creation, not stored in DB
    },
  },
  {
    timestamps: true, // This automatically creates 'createdAt' and 'updatedAt'
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// productSchema.pre("findOne", function (this: Query<any, any>, next : NextFunction) {
//   // Get the fields being selected in the query
//   const selectedFields = this.getOptions().projection;

//   // If we are only fetching the _id (like in our neighbor search), don't populate
//   if (
//     selectedFields &&
//     Object.keys(selectedFields).length === 1 &&
//     selectedFields._id
//   ) {
//     return next();
//   }

//   this.populate({ path: "category", model: "categories" })
//     .populate({ path: "productType", model: "productTypes" })
//     .populate({ path: "productBrand", model: "productBrands" })
//     .populate({ path: "carMaker", model: "carMakers" })
//     .populate({ path: "carModel", model: "carModels" })
//     .populate({
//       path: "generations",
//       model: "carGenerations",
//     });
// });

export const Product = model<IProduct>("products", productSchema);
