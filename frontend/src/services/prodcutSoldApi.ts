import type { productSoldSchema } from "@/schemas/productSold.schema"
import type { ProductSold } from "@/types"
import qs from "qs"
import type z from "zod"
const BASE_URL = import.meta.env.VITE_API_URL

export async function getProductsSold(filters?: Record<string, any>): Promise<{
  serviceFees: ProductSold[]
  pagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    limit: number
  }
}> {
  const queryString = qs.stringify(filters || {}, {
    arrayFormat: "indices", // Explicitly forces clean [0], [1] formatting
    skipNulls: true,
    encode: true,
  })

  const query = `${BASE_URL}/api/v1/productSold?${queryString}`

  const response = await fetch(query, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })

  if (!response.ok) {
    const error = await response.json()
    console.error("Error fetching products sold:", error || response.statusText)
    throw new Error(error.message || "Failed to get products sold    ")
  }

  const resBody = await response.json()

  return resBody.data
}

type CreateServiceFee = z.infer<typeof productSoldSchema> & {
  service: string
}

export async function createProductSold(
  data: CreateServiceFee
): Promise<ProductSold> {
  const res = await fetch(`${BASE_URL}/api/v1/productSold`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to create product sold entry")
  }

  const createdProduct = await res.json()

  return createdProduct.data
}

export async function updateProductSold(
  productSold: CreateServiceFee & { _id: string }
): Promise<ProductSold> {
  const res = await fetch(`${BASE_URL}/api/v1/productSold/${productSold._id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(productSold),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to update product sold entry")
  }

  const updatedProduct = await res.json()

  return updatedProduct.data
}

export async function getProductSoldById(id: string): Promise<ProductSold> {
  const url = `${BASE_URL}/api/v1/productSold/${id}`
  const res = await fetch(url, {
    credentials: "include",
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to get product sold")
  }

  const parsedRes = await res.json()

  const data = parsedRes.data

  return data.data
}

export async function deleteProductSold({
  id,
  shouldRestock = true,
}: {
  id: string
  shouldRestock: boolean
}) {
  const res = await fetch(`${BASE_URL}/api/v1/productSold/${id}`, {
    credentials: "include",
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      shouldRestock,
    }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(
      error.message || "Something went wrong while deleting a product sold"
    )
  }

  return res.status === 204 ? null : await res.json()
}
