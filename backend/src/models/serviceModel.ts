import mongoose, { model, Schema } from "mongoose";

export interface IService {
  id: string;

  user: mongoose.Types.ObjectId; // The Client/Owner
  car: mongoose.Types.ObjectId;
  serviceStatus: mongoose.Types.ObjectId;
  technician: mongoose.Types.ObjectId[]; // The Worker

  odometer: string;

  // Financials
  subTotal: number; // Sum of all items/fees before discounts/tax
  taxAmount: number; // VAT/Sales tax
  totalDiscount: number; // Total amount subtracted
  grandTotal: number; // The final amount the customer sees (subTotal - discount + tax)
  amountReceived: number; // How much the customer has actually paid so far

  // Times
  serviceDate: Date; // The "Business Date" (can be backdated)
  laborTime: number; // Total minutes spent on the job
  completedAt?: Date; // Only set when status becomes 'finished'

  // Status & Metadata
  paymentStatus: "unpaid" | "partially-paid" | "paid" | "refunded";
  priority: "low" | "medium" | "high";
  note: string;

  // System handled
  createdAt: Date;
  updatedAt: Date;
}

const SerivceSchema = new Schema<IService>(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      required: true,
    },

    car: {
      type: mongoose.Types.ObjectId,
      ref: "cars",
      required: true,
    },
    serviceStatus: {
      type: mongoose.Types.ObjectId,
      ref: "serviceStatuses",
      required: true,
    },
    odometer: {
      type: String,
      required: true,
    },
    technician: [mongoose.Types.ObjectId],
    subTotal: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    totalDiscount: {
      type: Number,
      defualt: 0,
    },
    grandTotal: {
      type: Number,
      defualt: 0,
    },

    amountReceived: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partially-paid", "paid", "refunded"],
      default: "unpaid",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      message: "Role must be either low, medium, or high",
      default: "low",
    },
    serviceDate: {
      type: Date,
      default: Date.now,
    },
    laborTime: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    note: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export const Service = model<IService>("services", SerivceSchema);
