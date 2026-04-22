import type { ProductType } from "@/types/product"

const BASE_URL = import.meta.env.VITE_API_URL

interface Filters {
  name?: string
  page?: number
  limit?: number
}

export async function getProductTypes(filters?: Filters): Promise<{
  data: ProductType[]
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

  const query = `${BASE_URL}/productTypes?${searchParams.toString()}`

  const response = await fetch(query, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to get product types")
  }

  const data = await response.json()
  console.log("Fetched Product Types:", data.data)
  return data.data
}

export async function createProductType(data: FormData): Promise<ProductType> {
  const res = await fetch(`${BASE_URL}/productTypes`, {
    method: "POST",
    credentials: "include",
    body: data,
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to create product type")
  }

  const createdProductType = await res.json()
  console.log("Created Product Type:", createdProductType.data)
  return createdProductType.data
}

export async function updateProductType(
  id: string,
  data: FormData
): Promise<ProductType> {
  const res = await fetch(`${BASE_URL}/productTypes/${id}`, {
    method: "PATCH",
    credentials: "include",
    body: data,
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to update product type")
  }

  const updatedProductType = await res.json()
  console.log("Updated Product Type:", updatedProductType.data)
  return updatedProductType.data
}

export async function getProductTypeById(id: string): Promise<ProductType> {
  const res = await fetch(`${BASE_URL}/productTypes/${id}`, {
    credentials: "include",
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to get product type")
  }

  const productType = await res.json()
  console.log("Product Type:", productType.data)
  return productType.data
}

export async function deleteProductType(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/productTypes/${id}`, {
    method: "DELETE",
    credentials: "include",
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to delete product type")
  }
}
