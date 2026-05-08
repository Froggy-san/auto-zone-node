import type { User } from "./authTypes"
import type { CarMaker } from "./carMaker"
import type { CarModel } from "./product"

export type CarImage = { _id: string; imagePath: string; isMain: boolean }

export interface CarModelWithMaker extends CarModel {
  carMaker: CarMaker
}

export interface CarGeneration {
  id: string
  _id: string
  name: string
  notes: string
  image: string
  carModel: CarModelWithMaker
  createdAt: Date
  updatedAt: Date
}
export interface Car {
  id: string
  _id: string
  plateNumber: string
  chassisNumber: string
  motorNumber: string
  color?: string
  odometer?: string // Sticking to string as per your SQL 'character varying'
  notes?: string
  user: User
  client?: User
  carGeneration: CarGeneration
  mainImageName: string
  carImages: CarImage[]
  createdAt: Date
  updatedAt: Date
}
