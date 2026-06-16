import { getParam } from "@/lib/getParam"
import { getServiceStats } from "@/services/servicesApi"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { useSearchParams } from "react-router"

export default function useServicesStats() {
  const [searchParams] = useSearchParams()
  const dateFrom = getParam(searchParams, "dateFrom", "")
  const dateTo = getParam(searchParams, "dateTo", "")
  const clientId = getParam(searchParams, "clientId", "")
  const serviceStatusId = getParam(searchParams, "serviceStatusId", "")
  const amountReceived = getParam(searchParams, "receivedAmount", "")
  const technician = getParam(searchParams, "technician", "")
  const carId = getParam(searchParams, "carId", "")
  const minPrice = getParam(searchParams, "minPrice", "")
  const maxPrice = getParam(searchParams, "maxPrice", "")

  const appliedFilters = useMemo(() => {
    const filterObj: Record<string, any> = {
      user: clientId,
      car: carId,
      serviceStatus: serviceStatusId,
      amountReceived: amountReceived,
      technician: technician,
    }
    if (dateFrom) {
      const fromDate = new Date(dateFrom)
      filterObj.serviceDate = { $gte: fromDate }
      if (dateTo) {
        const toDate = new Date(dateTo)
        toDate.setHours(23, 59, 59, 999)
        filterObj.serviceDate.$lte = toDate
      }
    }
    // if (dateTo) filterObj.serviceDate = { $lte: dateTo }
    if (minPrice || maxPrice)
      filterObj.grandTotal = {
        $gte: minPrice ? Number(minPrice) : undefined,
        $lte: maxPrice ? Number(maxPrice) : undefined,
      }
    // if (filters.maxPrice)
    //   filterObj.grandTotal = { $lte: Number(filters.maxPrice) }

    return Object.fromEntries(
      Object.entries(filterObj).filter(
        ([_, v]) => v !== undefined && v !== "" && v !== null
      )
    )
  }, [searchParams])

  const { data, error, isLoading } = useQuery({
    queryKey: ["services-stats", appliedFilters],
    queryFn: () => getServiceStats(appliedFilters),
  })

  return { data, error, isLoading }
}
