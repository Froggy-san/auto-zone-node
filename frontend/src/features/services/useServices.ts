import { getServices } from "@/services/servicesApi"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo } from "react"

interface Filters {
  page?: number
  limit?: number

  dateFrom?: string
  dateTo?: string
  clientId?: string
  carId?: string
  serviceStatusId?: string
  minPrice?: string
  maxPrice?: string
  amountReceived?: string
  serviceDate?: string
  technician?: string
}

export default function useServices(filters?: Filters) {
  const queryClient = useQueryClient()

  const appliedFilters = useMemo(() => {
    if (!filters) return {}
    const filterObj: Record<string, any> = {
      page: filters.page,
      limit: filters.limit,
      user: filters.clientId,
      car: filters.carId,
      serviceStatus: filters.serviceStatusId,
      amountReceived: filters.amountReceived,
      serviceDate: filters.serviceDate,
      technician: filters.technician,
    }
    if (filters.dateFrom) filterObj.createdAt = { $gte: filters.dateFrom }
    if (filters.dateTo) filterObj.createdAt = { $lte: filters.dateTo }
    if (filters.minPrice || filters.maxPrice)
      filterObj.grandTotal = {
        $gte: filters.minPrice ? Number(filters.minPrice) : undefined,
        $lte: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      }
    // if (filters.maxPrice)
    //   filterObj.grandTotal = { $lte: Number(filters.maxPrice) }

    return Object.fromEntries(
      Object.entries(filterObj).filter(
        ([_, v]) => v !== undefined && v !== "" && v !== null
      )
    )
  }, [filters])

  console.log(appliedFilters, "APPLIED FILTERS")
  const { data, error, isLoading, isError } = useQuery({
    queryFn: () => getServices(appliedFilters),
    queryKey: ["services", appliedFilters],
  })

  useEffect(() => {
    const totalPages = data?.pagination?.totalPages || 1

    // Prefetch Next
    if (filters?.page && filters.page < totalPages) {
      const nextFilters = { ...filters, page: filters.page + 1 }
      queryClient.prefetchQuery({
        queryKey: ["products", nextFilters],
        queryFn: () => getServices(nextFilters),
      })
    }

    // Prefetch Previous
    if (filters?.page && filters.page > 1) {
      const prevFilters = { ...filters, page: filters.page - 1 }
      queryClient.prefetchQuery({
        queryKey: ["products", prevFilters],
        queryFn: () => getServices(prevFilters),
      })
    }
  }, [data, filters, queryClient])

  return { data, isLoading, error, isError }
}
