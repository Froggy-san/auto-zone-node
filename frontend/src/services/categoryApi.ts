import type { Category } from "@/types/category"
import type { Product } from "@/types/product"

const BASE_URL = import.meta.env.VITE_API_URL

interface Filters {
  name?: string
  page?: number
  limit?: number
}

export async function getCategories(filters?: Filters): Promise<{
  data: Category[]
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

  const query = `${BASE_URL}/api/v1/categories?${searchParams.toString()}`

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
    throw new Error(error.message || "Failed to get categories")
  }

  const data = await response.json()

  return data.data
}

export async function createCategory(data: FormData): Promise<Category> {
  const res = await fetch(`${BASE_URL}/api/v1/categories`, {
    method: "POST",
    credentials: "include",
    body: data,
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to create Category")
  }

  const createdCategory = await res.json()
  console.log("Created Category:", createdCategory.data)
  return createdCategory.data
}

export async function updateCategory(
  id: string,
  data: FormData
): Promise<Category> {
  const res = await fetch(`${BASE_URL}/api/v1/categories/${id}`, {
    method: "PATCH",
    credentials: "include",
    body: data,
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to update category")
  }

  const updatedCategory = await res.json()
  console.log("Updated Category:", updatedCategory.data)
  return updatedCategory.data
}

export async function getCategoryById(id: string): Promise<Category> {
  const res = await fetch(`${BASE_URL}/api/v1/categories/${id}`, {
    credentials: "include",
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to get category")
  }

  const category = await res.json()
  console.log("Category:", category.data)
  return category.data
}

export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/v1/categories/${id}`, {
    method: "DELETE",
    credentials: "include",
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to delete category")
  }
}
