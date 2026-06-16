import mongoose, { Schema, Document } from "mongoose";

export interface IInvoiceItem {
  product: mongoose.Types.ObjectId; // Link to your product catalog
  quantity: number; // How many units bought
  costPriceBeforeTax: number; // Raw wholesale cost per unit
  discountPercentage: number; // e.g., 5 for 5% off this specific part line
  taxRatePercentage: number; // e.g., 14 for 14% Egyptian VAT
  netLineTotal: number; // Final calculated cost for this line item
}

export interface ISupplierInvoice extends Document {
  invoiceNumber: string; // Supplier's official bill number
  supplierName: string; // e.g., "El-Tawfik Auto Parts"
  items: IInvoiceItem[];
  subTotal: number; // Sum of all items before invoice-wide adjustments
  totalTax: number; // Total accumulated tax value
  totalDiscount: number; // Total accumulated discount value
  grandTotal: number; // Final amount paid out of the garage wallet
  paymentStatus: "paid" | "partially-paid" | "unpaid";
  notes?: string;
  createdAt: Date;
}

const invoiceItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "products", required: true },
    quantity: { type: Number, required: true, min: 1 },
    costPriceBeforeTax: { type: Number, required: true },
    discountPercentage: { type: Number, default: 0 }, // Individual line discount
    taxRatePercentage: { type: Number, default: 14 }, // Standard local tax rate (e.g., 14% VAT)
    netLineTotal: { type: Number, required: true },
  },
  { _id: false },
);

const supplierInvoiceSchema = new Schema<ISupplierInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true, trim: true },
    supplierName: { type: String, required: true, trim: true },
    items: [invoiceItemSchema],
    subTotal: { type: Number, required: true },
    totalTax: { type: Number, required: true },
    totalDiscount: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["paid", "partially-paid", "unpaid"],
      default: "paid",
    },
    notes: String,
  },
  { timestamps: true },
);

export const SupplierInvoice = mongoose.model<ISupplierInvoice>(
  "supplierInvoices",
  supplierInvoiceSchema,
);
