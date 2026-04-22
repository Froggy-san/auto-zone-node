import type { Category } from "./category"

export interface ProductType {
  _id: string
  name: string
  category: Category
  image: string
  createdAt: string
  updatedAt: string
}
