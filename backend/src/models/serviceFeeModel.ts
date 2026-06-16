import mongoose, { model, Schema } from "mongoose";

export interface IServiceFee {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  category: mongoose.Types.ObjectId;
  service: mongoose.Types.ObjectId;
  price: number;
  discount: number;
  totalPriceAfterDiscount: number;
  isReturned: boolean;
  note: string;
}

const ServiceFeesSchema = new Schema<IServiceFee>(
  {
    service: {
      type: mongoose.Types.ObjectId,
      ref: "services",
      required: true,
    },

    category: {
      type: mongoose.Types.ObjectId,
      ref: "categories",
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    totalPriceAfterDiscount: {
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

export const ServiceFee = model<IServiceFee>("serviceFees", ServiceFeesSchema);
