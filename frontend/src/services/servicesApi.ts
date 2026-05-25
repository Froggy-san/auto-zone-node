import { BASE_URL } from "@/lib/constants"
import { CreateServiceSchema } from "@/schemas/service.schema"
import type { Service } from "@/types"
import type z from "zod"
import qs from "qs"
export async function getServices(filters?: Record<string, any>): Promise<{
  data: Service[]
  pagination: {
    totalCount: number
    totalPages: number
    currentPage: number
    limit: number
  }
}> {
  // const queryString = new URLSearchParams(
  //   filters as Record<string, string>
  // ).toString()
  const queryString = qs.stringify(filters || {}, {
    arrayFormat: "indices", // Explicitly forces clean [0], [1] formatting
    skipNulls: true,
    encode: true,
  })
  const query = `${BASE_URL}/api/v1/services?${queryString}`
  const response = await fetch(query, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
  if (!response.ok) {
    const error = (await response.json()).message || "Failed to get services"
    throw new Error(error)
  }

  const result = await response.json()
  return result.data
}

// type Service = z.infer<typeof CreateServiceSchema> & {
//   // subTotal: number;
//   // totalDiscount: number;
//   // grandTotal: number;

//   technician: string[] // Array of technician IDs
//   taxAmount: number
//   taxRate: number
// }

type CreateSerivce = z.infer<typeof CreateServiceSchema> & {
  taxRate: number
  taxAmount: number
}
export async function createService(service: CreateSerivce) {
  console.log("Creating service with data:", service)
  const response = await fetch(`${BASE_URL}/api/v1/services`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(service),
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error("Error creating service:", errorData)
    throw new Error(errorData.message || "Failed to create service")
  }

  return response.json()
}

const UpdateSchema = CreateServiceSchema.partial()
export async function updateService(
  service: z.infer<typeof UpdateSchema>,
  id: string
) {
  const response = await fetch(`${BASE_URL}/api/v1/services/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(service),
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error("Error updating service:", errorData)
    throw new Error(errorData.message || "Failed to update service")
  }

  return response.json()
}
