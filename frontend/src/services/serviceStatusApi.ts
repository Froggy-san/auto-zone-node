import { BASE_URL } from "@/lib/constants"
import type { ServiceStatus } from "@/types"

export async function getServiceStatuses(
  filters?: Record<string, any>
): Promise<{
  data: ServiceStatus[]
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

  const query = `${BASE_URL}/api/v1/serviceStatuses?${searchParams.toString()}`

  const response = await fetch(query, {
    credentials: "include",
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to get service statuses")
  }

  const data = await response.json()

  return data.data
}
