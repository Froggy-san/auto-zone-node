import type { ServiceFeeSchema } from "@/schemas/serviceFee.schema"
import type { Product, ServiceFee } from "@/types"
import qs from "qs"
import type z from "zod"

const BASE_URL = import.meta.env.VITE_API_URL

// Update your Filters type definition if you have one, or use Record<string, any>
export async function getServiceFees(filters?: Record<string, any>): Promise<{
  serviceFees: ServiceFee[]
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

  const query = `${BASE_URL}/api/v1/serviceFees?${queryString}`

  const response = await fetch(query, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })

  if (!response.ok) {
    const error = await response.json()
    console.error("Error fetching service fees:", error || response.statusText)
    throw new Error(error.message || "Failed to get service fees    ")
  }

  const resBody = await response.json()

  return resBody.data
}

export async function createServiceFee(
  data: z.infer<typeof ServiceFeeSchema>
): Promise<ServiceFee> {
  const res = await fetch(`${BASE_URL}/api/v1/serviceFees`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to create Product")
  }

  const createdProduct = await res.json()
  console.log("Created Product:", createdProduct.data)
  return createdProduct.data
}

export async function updateServiceFee(
  serviceFee: ServiceFee
): Promise<ServiceFee> {
  const res = await fetch(`${BASE_URL}/api/v1/serviceFees/${serviceFee._id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(serviceFee),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to update service fee")
  }

  const updatedProduct = await res.json()

  return updatedProduct.data
}

export async function getServiceFeeById(id: string): Promise<ServiceFee> {
  const url = `${BASE_URL}/api/v1/serviceFees/${id}`
  const res = await fetch(url, {
    credentials: "include",
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to get service fee")
  }

  const parsedRes = await res.json()

  const data = parsedRes.data

  return data.data
}

export async function deleteServiceFee(id: string) {
  const res = await fetch(`${BASE_URL}/api/v1/serviceFees/${id}`, {
    credentials: "include",
    method: "DELETE",
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(
      error.message || "Something went wrong while deleting a service fee"
    )
  }

  return res.status === 204 ? null : await res.json()
}

export const deleteMultipleServiceFees = async (ids: string[]) => {
  const response = await fetch(
    `${BASE_URL}/api/v1/serviceFees/delete-multiple`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      // CRITICAL: This is the fetch version of axios's "withCredentials"
      credentials: "include",
      body: JSON.stringify({ ids }),
    }
  )

  // Fetch doesn't throw on 404/500, so we handle it manually
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to delete products")
  }

  // 204 No Content doesn't have a body, so we check the status
  return response.status === 204 ? null : await response.json()
}
