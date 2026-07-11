import mongoose, { Schema, model, Document, Query } from "mongoose";
import { MoreDetail, ProductImage } from "../@types";
import { NextFunction } from "express";

export const UNITS_OF_MEASUREMENTS = ["unit", "kg", "liter"];

export type UnitsOfMeasurement = "unit" | "kg" | "liter";
export interface IProduct extends Document {
  name: string;
  description: string;
  listPrice: number;
  salePrice: number;
  minStockLevel: number;
  weightedAverageCost: number; // Tracks current asset value for margin tracking.
  unitOfMeasurement: UnitsOfMeasurement;
  stock: number;
  constPrice: number;
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
      default: 0,
      // validate: {
      //   // This only works on .create() and .save()
      //   validator: function (this: any, val: number) {

      //     return val <= this.listPrice;
      //   },
      //   message:
      //     "Sale price ({VALUE}) must be lower than or equal to list price",
      // },
    },
    minStockLevel: { type: Number, default: 2 },
    constPrice: { type: Number, default: 0 },
    weightedAverageCost: {
      type: Number,
      default: 0,
    },
    unitOfMeasurement: {
      type: String,
      enum: UNITS_OF_MEASUREMENTS,
      default: "unit",
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

productSchema.pre("save", function () {
  if (this.isModified("isAvailable")) return; // if the user explicitly sets the is available on the front end, then use that value.
  if (this.isModified("stock")) {
    this.isAvailable = this.stock > 0;
  }
});

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

/*
ok, i like the idea alot but am forced to put it aside along with the other middlewares where we set the serviceStatus and the isAvailable middleware, becasue currently i have alot to do in the front, but i want you to put those in mind for later, i will diffidently do them later, but for now, i can't seem to access this route router.get(

  "getCarAndRelated/:userId",

  validate(

    z.object({

      params: z.object({ userId: objectIdSchema }),

    }),

  ),

  getCarAndRelated,

);, /api/v1/cars/getCarAndRelated/69f6a2092502128b46337f4a?carId=69fe43efc8a6b5b03a60cc2e 404
*/
