export type Provider = "email" | "google"
export type Role = "admin" | "user"

export interface IUser extends Document {
  createdAt: Date
  updatedAt: Date
  name: string
  email: string
  password?: string
  passwordConfirm?: string
  picture: string
  provider: Provider
  isDeleted: boolean
  deletedAt?: Date // Optional because it's only set on delete
  role: Role
}
