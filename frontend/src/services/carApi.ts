import { BASE_URL } from "@/lib/constants"
import type { Car, CarList } from "@/types"

export interface GetCarsProps {
  page: string
  limit: string
  color?: string
  plateNumber?: string
  chassisNumber?: string
  motorNumber?: string
  user?: string
  carGeneration?: string
  pageNumber?: string
  carMaker?: string
  carModel?: string
}

export async function getCars(filters?: GetCarsProps): Promise<{
  data: CarList[]
  pagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    limit: number
  }
}> {
  const searchParams = new URLSearchParams()

  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value.toString())
    }
  })

  const res = await fetch(`${BASE_URL}/api/v1/cars?${searchParams.toString()}`)

  if (!res.ok) {
    const error = await res.json()

    console.error("Error fetching users:", error || res.statusText)
    throw new Error(error.message || "Failed to get users")
  }

  const result = await res.json()

  return result.data
}

export async function createCar(data: FormData): Promise<Car> {
  const res = await fetch(`${BASE_URL}/api/v1/cars`, {
    method: "POST",
    credentials: "include",
    body: data,
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to create car")
  }

  const createdProduct = await res.json()

  return createdProduct.data
}

export async function updateCar({
  id,
  data,
}: {
  id: string
  data: FormData
}): Promise<Car> {
  const res = await fetch(`${BASE_URL}/api/v1/cars/${id}`, {
    method: "PATCH",
    credentials: "include",
    body: data,
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to update car's data")
  }

  const updatedProduct = await res.json()

  return updatedProduct.data
}

export async function getCarById(userId: string, carId: string): Promise<Car> {
  const url = `${BASE_URL}/api/v1/cars/getCarAndRelated/${userId}?carId=${carId}`
  const res = await fetch(url, {
    credentials: "include",
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to get car's data")
  }

  const result = await res.json()

  const data = result.data

  return data
}

export async function deleteCar(id: string) {
  const res = await fetch(`${BASE_URL}/api/v1/cars/${id}`, {
    credentials: "include",
    method: "DELETE",
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to delete car")
  }

  return res.status === 204 ? null : await res.json()
}

export const deleteMultipleProducts = async (ids: string[]) => {
  const response = await fetch(`${BASE_URL}/api/v1/products/delete-multiple`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    // CRITICAL: This is the fetch version of axios's "withCredentials"
    credentials: "include",
    body: JSON.stringify({ ids }),
  })

  // Fetch doesn't throw on 404/500, so we handle it manually
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to delete products")
  }

  // 204 No Content doesn't have a body, so we check the status
  return response.status === 204 ? null : await response.json()
}
