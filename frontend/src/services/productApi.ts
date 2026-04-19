import type { Product } from "@/types/product"

const BASE_URL = import.meta.env.VITE_API_URL

interface Filters {
  priceFrom?: string
  priceTo?: string
  carBrand?: string
  carModel?: string
  carGeneration?: string
  category?: string
  subCategory?: string
  productBrand?: string
  isAvailable?: boolean
  name?: string
  page?: string
  limit?: number
}

export async function getProducts(filters?: Filters): Promise<{
  products: Product[]
  pagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    limit: number
  }
}> {
  // 1. Use URLSearchParams to handle formatting and encoding automatically
  const searchParams = new URLSearchParams()

  // 2. Loop through filters and only append if they have a value
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value.toString())
    }
  })

  const query = `${BASE_URL}/products?${searchParams.toString()}`

  const response = await fetch(query, {
    method: "GET",
    // Note: You don't actually need "Content-Type" for a GET request
    // because there is no body, but keeping it doesn't hurt.
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to get products")
  }

  const data = await response.json()
  return data.data
}
export const deleteMultipleProducts = async (ids: string[]) => {
  const response = await fetch(`${BASE_URL}/products/delete-multiple`, {
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
