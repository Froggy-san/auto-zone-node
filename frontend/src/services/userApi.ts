import { BASE_URL } from "@/lib/constants"
import type { Car, Provider, Role, User } from "@/types"

export interface GetUsersProps {
  id: string
  page: string
  limit: string
  createdAt: string
  updatedAt: string
  username: string
  email: string
  password?: string
  passwordConfirm?: string
  picture: string
  provider: Provider
  isDeleted?: string
  deletedAt?: string // Optional because it's only set on delete
  cars?: string
  phones?: string
  role?: Role
  passwordChangedAt?: string
  passwordResetToken?: string
  passwordResetExpires?: string
}

export async function getUsers(filters: GetUsersProps): Promise<{
  data: User[]
  pagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    limit: number
  }
}> {
  const searchParams = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value.toString())
    }
  })

  const res = await fetch(
    `${BASE_URL}/api/v1/users?${searchParams.toString()}`,
    {
      method: "GET",
      credentials: "include",
    }
  )
  if (!res.ok) {
    const error = await res.json()

    console.error("Error fetching users:", error || res.statusText)
    throw new Error(error.message || "Failed to get users")
  }

  const result = await res.json()

  return result.data
}

export async function getUser(id: string): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/v1/users/${id}`, {
    credentials: "include",
  })
  if (!res.ok) {
    const error = await res.json()

    console.error(
      `Error fetching user with the id: ${id}`,
      error || res.statusText
    )
    throw new Error(error.message || "Failed to get users")
  }

  const result = await res.json()

  return result.data
}
