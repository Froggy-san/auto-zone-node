import mongoose, { Schema, Document } from "mongoose";

export type StockChangeReason =
  | "service-sale"
  | "return"
  | "restock"
  | "supplier-return"
  | "supplier-delete"
  | "retail-sale"
  | "adjustment"
  | "manual-correction"
  | "service-deleted"
  | "sale-quantity-updated"
  | "product-sold-deleted";

export interface IStockLog extends Document {
  product: mongoose.Types.ObjectId;
  change: number;
  previousStock: number;
  currentStock: number;
  reason: StockChangeReason;
  referenceId: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const StockLogSchema = new Schema<IStockLog>(
  {
    product: { type: Schema.Types.ObjectId, ref: "products", required: true },
    change: { type: Number, required: true }, // e.g., -2 or +10
    isDeleted: {
      type: Boolean,
      default: false,
    },
    previousStock: { type: Number, required: true },
    currentStock: { type: Number, required: true },
    reason: {
      type: String,
      enum: [
        "service-sale",
        "retail-sale",
        "return",
        "restock",
        "adjustment",
        "supplier-return",
        "supplier-delete",
        "manual-correction",
        "service-deleted",
        "sale-quantity-updated",
        "product-sold-deleted",
      ],
      required: true,
    },
    referenceId: { type: Schema.Types.ObjectId }, // Flexible: could be Service ID or Restock ID
    user: { type: Schema.Types.ObjectId, ref: "users" }, // Who did it?
  },
  { timestamps: true },
);

const StockLogs = mongoose.model<IStockLog>("StockLog", StockLogSchema);

export default StockLogs;
