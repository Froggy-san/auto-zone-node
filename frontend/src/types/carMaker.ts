import type { CarModel } from "./product"

export interface CarMaker {
  _id: string
  createtAt: string
  name: string
  notes: string
  logo: string | null
  carModels?: CarModel[]
}
