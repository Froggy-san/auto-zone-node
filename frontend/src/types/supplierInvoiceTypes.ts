import type { User } from "./authTypes"
import type { Product } from "./product"
export const FULLFILLMENT_STATUS_VALUES: FulfillmentStatus[] = [
  "pending",
  "partially-received",
  "received",
  "returned",
]
export const SUPPLIER_PAYMENT_STATUS_VALUES = [
  "paid",
  "partially-paid",
  "unpaid",
  "refunded",
]

export type FulfillmentStatus =
  | "pending"
  | "partially-received"
  | "received"
  | "returned"

export type SupplierPaymentStatus =
  | "paid"
  | "partially-paid"
  | "unpaid"
  | "refunded"

export interface InvoiceItem {
  product: Product // Link to your product catalog
  orderedQuantity: number // Total quantity purchased on paper
  quantity: number // Actual quantity currently on your shelves

  costPriceBeforeTax: number // Raw wholesale cost per unit
  discountPercentage: number // e.g., 5 for 5% off this specific part line
  taxRatePercentage: number // e.g., 14 for 14% Egyptian VAT
  netLineTotal: number // Final calculated cost for this line item

  newRetailPrice?: number
  newSalePrice?: number
  isReturned: boolean
}

export interface SupplierInvoice extends Document {
  _id: string
  id: string
  createdBy: User
  invoiceNumber: string // Supplier's official bill number
  supplierName: string // e.g., "El-Tawfik Auto Parts"
  items: InvoiceItem[]
  subTotal: number // Sum of all items before invoice-wide adjustments
  shippingAndFees: number
  totalTax: number // Total accumulated tax value
  totalDiscount: number // Total accumulated discount value
  grandTotal: number // Final amount paid out of the garage wallet
  amountPaid: number
  fulfillmentStatus: FulfillmentStatus
  paymentStatus: SupplierPaymentStatus
  notes?: string
  createdAt: Date
  isReturned: boolean
  fulfilledAt?: Date
}
