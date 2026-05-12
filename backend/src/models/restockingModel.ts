import mongoose, { Schema, Document } from "mongoose";

interface IRestocking extends Document {
  product: mongoose.Types.ObjectId;
  supplier: mongoose.Types.ObjectId;
  unitCost: number;
  discountReceived: number;
  totalPaid: number;
  quantityAdded: number;
  batchNumber?: string;
  restockDate: Date;
  createdBy?: mongoose.Types.ObjectId;
}

const RestockSchema = new Schema<IRestocking>({
  product: { type: Schema.Types.ObjectId, ref: "products", required: true },
  supplier: { type: Schema.Types.ObjectId, ref: "suppliers", required: true },

  // Financials of the buy
  unitCost: { type: Number, required: true }, // Price you paid the supplier
  discountReceived: { type: Number, default: 0 },
  totalPaid: { type: Number, required: true }, // (unitCost * quantity) - discount

  quantityAdded: { type: Number, required: true },
  batchNumber: String, // Useful for expiry dates or warranty
  restockDate: { type: Date, default: Date.now },

  createdBy: { type: Schema.Types.ObjectId, ref: "users" }, // Which manager did the buy?
});

export default mongoose.model<IRestocking>("Restocking", RestockSchema);
