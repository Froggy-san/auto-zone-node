export interface ProductSold {
  id: string
  _id: string
  product: string
  service: string
  pricePerUnit: number
  discountPerUnit: number
  totalPriceAfterDiscount: number
  count: number
  isReturned: boolean
  note: string
  createdAt: Date
  updatedAt: Date
}
