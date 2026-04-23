import type { CarMaker } from "./carMaker"
import type { Category } from "./category"
import type { ProductType } from "./productTypes"

export interface MoreDetail {
  _id: string
  title: string
  description: string
  table: { title: string; description: string }[]
}

export interface ProductImage {
  _id: string
  imageUrl: string
  filename: string
  isMain: boolean
}

export interface CarGeneration {
  _id: string
  name: string
  notes: string
  image: string
  carMaker: CarMaker
  createdAt: string
  updatedAt: string
}

export interface ProductBrand {
  _id: string
  name: string
  createdAt?: string
  updatedAt?: string
}

export interface CarModel {
  _id: string
  name: string
  notes: string
  image: string
  carMaker: CarMaker
  carGenerations: CarGeneration[]
  createdAt: string
  updatedAt: string
}
// 1. Define the small look-up types
// export interface Category {
//   _id: string
//   name: string
//   image: string
//   createdAt: string
//   updatedAt: string
// }

export interface Brand {
  _id: string
  name: string
  logoUrl?: string
}

// 2. Update your main Product interface
export interface ProductWithDetails {
  _id: string
  name: string
  description: string
  listPrice: number
  salePrice: number
  stock: number
  isAvailable: boolean
  generations: CarGeneration[]
  moreDetails: MoreDetail[]
  category: Category
  productType: ProductType
  productBrand: ProductBrand
  carMaker: CarMaker
  carModel: CarModel
  productImages: ProductImage[]
  mainImageName?: string // This is only used during creation, not stored in DB
  createdAt: string
  updatedAt: string
}

export type Product = Omit<
  ProductWithDetails,
  "category" | "productType" | "productBrand" | "carMaker" | "carModel"
> & {
  category: string // Just the name or ID, depending on what you prefer
  productType: string
  productBrand: string
  carMaker: string
  carModel: string
}
