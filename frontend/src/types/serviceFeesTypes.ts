export interface ServiceFee {
  id: string
  _id: string
  price: number
  discount: number
  totalPriceAfterDiscount: number
  isReturned: boolean
  note: string
  service: string
  category: string
  createdAt: Date
  updatedAt: Date
}
