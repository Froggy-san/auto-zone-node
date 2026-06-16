import { BASE_URL } from "@/lib/constants"
import { CreateServiceSchema } from "@/schemas/service.schema"
import type { Service, ServiceStats } from "@/types"
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

export async function createService(
  service: z.infer<typeof CreateServiceSchema>
) {
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

const UpdateSchema = CreateServiceSchema.omit({
  productsSold: true,
  serviceFees: true,
}).partial()
export async function updateService({
  service,
  id,
}: {
  service: z.infer<typeof UpdateSchema>
  id: string
}) {
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

// This api call shouldn't be used unless the admin wants to completly delete the service entry from the website,
// The admin as a choice to restock the products issued inside that service, or should delete the entry without restocking them.
export async function deleteService({
  id,
  shouldRestock = true,
}: {
  id: string
  shouldRestock?: boolean
}) {
  const response = await fetch(`${BASE_URL}/api/v1/services/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      shouldRestock,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error("Error deleting service:", errorData)
    throw new Error(errorData.message || "Failed to delete service")
  }
}

export async function getServiceStats(
  filters: Record<string, any>
): Promise<ServiceStats> {
  // const url = new URL(`${BASE_URL}/api/v1/services/stats`)
  // if (dateFrom) url.searchParams.append("dateFrom", dateFrom)
  // if (dateTo) url.searchParams.append("dateTo", dateTo)
  const queryString = qs.stringify(filters || {}, {
    arrayFormat: "indices", // Explicitly forces clean [0], [1] formatting
    skipNulls: true,
    encode: true,
  })
  const query = `${BASE_URL}/api/v1/services/stats?${queryString}`
  const response = await fetch(query, {
    method: "GET",
    credentials: "include",
  })

  if (!response.ok) {
    const errorData =
      (await response.json()).message || "Failed to fetch service stats"
    console.error("Error fetching service stats:", errorData)
    throw new Error(errorData)
  }

  const data = await response.json()
  return data.data
}
