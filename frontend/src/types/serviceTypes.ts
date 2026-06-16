import type { User } from "./authTypes"
import type { Car } from "./carTypes"
import type { ProductSold } from "./productSoldTypes"
import type { ServiceFee } from "./serviceFeesTypes"
import type { ServiceStatus } from "./serviceStatusTypes"

export interface Service {
  id: string
  _id: string
  user: User // The Client/Owner
  car: Car
  serviceStatus: ServiceStatus
  technician: User[] // The Worker

  odometer: string

  // Financials
  taxRate: number
  subTotal: number // Sum of all items/fees before discounts/tax
  taxAmount: number // VAT/Sales tax
  totalDiscount: number // Total amount subtracted
  grandTotal: number // The final amount the customer sees (subTotal - discount + tax)
  amountReceived: number // How much the customer has actually paid so far

  // Times
  serviceDate: Date // The "Business Date" (can be backdated)
  laborTime: number // Total minutes spent on the job
  completedAt?: Date // Only set when status becomes 'finished'

  // Status & Metadata
  paymentStatus: "unpaid" | "partially-paid" | "paid" | "refunded"
  priority: "low" | "medium" | "high"
  note: string

  serviceFees: ServiceFee[]
  productsSold: ProductSold[]
  // System handled
  createdAt: Date
  updatedAt: Date
  isReturned: boolean
}

export interface ServiceStats {
  grossProfit: number
  grandLossFromFeesReturnedOrCancelled: number
  grandLossFromProductsReturnedOrCancelled: number
  lostRevenueCancelled: number
  lostRevenueReturned: number
  pendingCustomerDebt: number
  servicesCanceledOrReturned: number
  totalAmountReceived: number
  totalCashRefunded: number
  totalDiscount: number
  totalGlobalFeesDiscount: number
  totalGlobalFeesGrossPrice: number
  totalGlobalProductSoldDiscount: number
  totalGlobalProductSoldGrossPrice: number
  totalGrand: number
  grandProductsSold: number
  grandFees: number
  totalNetFees: number
  totalNetProductsSold: number
  totalTax: number
}
