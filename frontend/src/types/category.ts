import type { Product } from "./product"
import type { ProductType } from "./productTypes"
export interface Category {
  _id: string
  name: string
  description: string
  image: string
  productTypes: ProductType[]
  createdAt: string
  updatedAt: string
}

export interface categoryResult extends Omit<Category, "productTypes"> {
  products: Product[]
}
