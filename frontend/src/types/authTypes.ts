import type { Car } from "./carTypes"

export type Provider = "email" | "google"
export type Role = "admin" | "user"

export interface User {
  _id: string
  id: string
  createdAt: Date
  updatedAt: Date
  username: string
  email: string
  password?: string
  passwordConfirm?: string
  picture: string
  provider: Provider
  isDeleted?: boolean
  deletedAt?: Date // Optional because it's only set on delete
  role: Role
  passwordChangedAt?: Date
  passwordResetToken?: string
  passwordResetExpires?: Date
  cars?: Car[]
  phones: string[]
}
