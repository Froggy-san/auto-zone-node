import mongoose, { Schema, Document } from "mongoose";
export type FulfillmentStatus =
  | "pending"
  | "partially-received"
  | "received"
  | "returned"
  | "canceled";
export type SupplierPaymentStatus =
  | "paid"
  | "partially-paid"
  | "unpaid"
  | "refunded";
export const FULLFILLMENT_STATUS_VALUES: FulfillmentStatus[] = [
  "pending",
  "partially-received",
  "received",
  "returned",
  "canceled",
];
export const SUPPLIER_PAYMENT_STATUS_VALUES: SupplierPaymentStatus[] = [
  "paid",
  "partially-paid",
  "unpaid",
  "refunded",
];

export interface IInvoiceItem {
  _id: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  orderedQuantity: number;
  receivedQuantity: number;
  costPriceBeforeTax: number;
  discountPercentage: number;
  taxRatePercentage: number;
  netLineTotal: number;

  newRetailPrice?: number;
  newSalePrice?: number;
  isReturned: boolean;
  expiresAt?: Date; // Made optional since not all parts have expiry
}

export type CreateSupplierInvoiceInput = Omit<IInvoiceItem, "_id">;

export interface ISupplierInvoice extends Document {
  createdBy: mongoose.Types.ObjectId;
  invoiceNumber: string; // Supplier's official bill number
  supplierName: string; // e.g., "El-Tawfik Auto Parts"
  items: IInvoiceItem[];
  subTotal: number; // Sum of all items before invoice-wide adjustments
  shippingAndFees: number;
  totalTax: number; // Total accumulated tax value
  totalDiscount: number; // Total accumulated discount value
  grandTotal: number; // Final amount paid out of the garage wallet
  amountPaid: number;
  fulfillmentStatus: FulfillmentStatus;
  paymentStatus: SupplierPaymentStatus;
  notes?: string;
  createdAt: Date;
  fulfilledAt?: Date;
}

const invoiceItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "products", required: true },
    orderedQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
    receivedQuantity: { type: Number, required: true, min: 0, default: 0 },
    costPriceBeforeTax: { type: Number, required: true },
    discountPercentage: { type: Number, default: 0 }, // Individual line discount
    taxRatePercentage: { type: Number, default: 14 }, // Standard local tax rate (e.g., 14% VAT)
    netLineTotal: { type: Number, required: true },
    isReturned: { type: Boolean, default: false },
    expiresAt: { type: Date },
  },
  { _id: true },
);

const supplierInvoiceSchema = new Schema<ISupplierInvoice>(
  {
    createdBy: { type: mongoose.Types.ObjectId, ref: "users", required: true },

    fulfilledAt: {
      type: Date,
    },
    invoiceNumber: { type: String, required: true, unique: true, trim: true },
    supplierName: { type: String, required: true, trim: true },
    items: [invoiceItemSchema],
    subTotal: { type: Number, required: true },
    totalTax: { type: Number, required: true },
    totalDiscount: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    shippingAndFees: {
      type: Number,
      default: 0,
    },
    amountPaid: { type: Number, default: 0 },
    fulfillmentStatus: {
      type: String,
      enum: FULLFILLMENT_STATUS_VALUES,
      default: "received",
    },
    paymentStatus: {
      type: String,
      enum: SUPPLIER_PAYMENT_STATUS_VALUES,
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
