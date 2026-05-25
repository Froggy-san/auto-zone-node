import type { ServiceFeeSchema } from "@/schemas/serviceFee.schema"
import type z from "zod"
import type { Category } from "./category"

export interface ServiceFee extends Omit<
  z.infer<typeof ServiceFeeSchema>,
  "category"
> {
  id: string
  _id: string
  category: Category
  service: string
  totalPriceAfterDiscount: number
  createdAt: Date
  updatedAt: Date
}
