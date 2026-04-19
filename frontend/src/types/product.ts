export interface MoreDetail {
  title: string
  description: string
  table: { title: string; description: string }[]
}

export interface ProductImage {
  imageUrl: string
  filename: string
  isMain: boolean
}

export interface CarGeneration {
  name: string
  notes: string
  logo: string
  carMaker: CarMaker
  createdAt: string
  updatedAt: string
}

export interface ProductBrand {
  name: string
  createdAt: string
  updatedAt: string
}

export interface ProductType {
  name: string
  category: Category
  image: string
  createdAt: string
  updatedAt: string
}

export interface CarMaker {
  _id: string
  name: string
  notes: string
  logo: string
  createdAt: string
  updatedAt: string
}

export interface CarModel {
  _id: string
  name: string
  notes: string
  logo: string
  carMaker: CarMaker
  createdAt: string
  updatedAt: string
}
// 1. Define the small look-up types
export interface Category {
  _id: string
  name: string
  image: string
  createdAt: string
  updatedAt: string
}

export interface Brand {
  _id: string
  name: string
  logoUrl?: string
}

// 2. Update your main Product interface
export interface ProductDetails {
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
  ProductDetails,
  "category" | "productType" | "productBrand" | "carMaker" | "carModel"
> & {
  category: string // Just the name or ID, depending on what you prefer
  productType: string
  productBrand: string
  carMaker: string
  carModel: string
}
