import mongoose, { model, Schema } from "mongoose";

export interface IProductSold {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  product: mongoose.Types.ObjectId;
  service: mongoose.Types.ObjectId;
  pricePerUnit: number;
  discountPerUnit: number;
  totalPriceAfterDiscount: number;
  count: number;
  isReturned: boolean;
  note: string;
}

const ProductSoldSchema = new Schema<IProductSold>(
  {
    service: {
      type: mongoose.Types.ObjectId,
      ref: "services",
      required: true,
    },

    product: {
      type: mongoose.Types.ObjectId,
      ref: "products",
      required: true,
    },
    pricePerUnit: {
      type: Number,
      required: true,
    },
    discountPerUnit: {
      type: Number,
      required: true,
    },
    totalPriceAfterDiscount: {
      type: Number,
      required: true,
    },
    count: {
      type: Number,
      required: true,
    },
    isReturned: {
      type: Boolean,
      default: false,
    },
    note: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export const ProductSold = model<IProductSold>(
  "productsSold",
  ProductSoldSchema,
);
