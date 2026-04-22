import type { ProductBrand } from "@/types/product"

const BASE_URL = import.meta.env.VITE_API_URL

interface Filters {
  name?: string
  page?: number
  limit?: number
}

export async function getProductBrands(filters?: Filters): Promise<{
  data: ProductBrand[]
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

  const query = `${BASE_URL}/productBrands?${searchParams.toString()}`

  const response = await fetch(query, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to get product brands")
  }

  const data = await response.json()
  console.log("Fetched Product Brands:", data.data)
  return data.data
}

export async function createProductBrand(data: {
  name: string
}): Promise<ProductBrand> {
  const res = await fetch(`${BASE_URL}/productBrands`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to create product brand")
  }

  const createdProductBrand = await res.json()
  console.log("Created Product Brand:", createdProductBrand.data)
  return createdProductBrand.data
}

export async function updateProductBrand(
  id: string,
  data: { name: string }
): Promise<ProductBrand> {
  const res = await fetch(`${BASE_URL}/productBrands/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to update product brand")
  }

  const updatedProductBrand = await res.json()
  console.log("Updated Product Brand:", updatedProductBrand.data)
  return updatedProductBrand.data
}

export async function getProductBrandById(id: string): Promise<ProductBrand> {
  const res = await fetch(`${BASE_URL}/productBrands/${id}`, {
    credentials: "include",
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to get product brand")
  }

  const productBrand = await res.json()
  console.log("Product Brand:", productBrand.data)
  return productBrand.data
}

export async function deleteProductBrand(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/productBrands/${id}`, {
    method: "DELETE",
    credentials: "include",
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to delete product brand")
  }
}
