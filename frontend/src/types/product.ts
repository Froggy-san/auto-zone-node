import type { CarMaker } from "./carMaker"
import type { CarGeneration } from "./carTypes"
import type { Category } from "./category"
import type { ProductType } from "./productTypes"

export const UNITS_OF_MEASUREMENTS = ["unit", "kg", "liter"]

export type UnitsOfMeasurement = "unit" | "kg" | "liter"

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

// export interface CarGeneration {
//   _id: string
//   name: string
//   notes: string
//   image: string
//   carMaker: CarMaker
//   createdAt: string
//   updatedAt: string
// }

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
  carGeneration: string
  generations?: CarGeneration[]
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
  id: string
  _id: string
  name: string
  description: string
  weightedAverageCost: number
  unitOfMeasurement: UnitsOfMeasurement
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
  "productType" | "productBrand" | "carMaker" | "carModel"
> & {
  productType: string
  productBrand: string
  carMaker: string
  carModel: string
}
export interface CartItem extends ProductWithDetails {
  quantity: number
  totalPrice: number
}
