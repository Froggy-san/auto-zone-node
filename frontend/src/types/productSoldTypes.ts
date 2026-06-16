import type { Product } from "./product"

export interface ProductSold {
  _id: string
  id: string
  createdAt: Date
  updatedAt: Date
  product: Product
  service: string
  originalPricePerUnit: number
  originalDiscountPerUnit: number
  pricePerUnit: number
  discountPerUnit: number
  totalPriceAfterDiscount: number
  count: number
  isReturned: boolean
  note: string
}
