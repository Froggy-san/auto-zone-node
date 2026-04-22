import { getParam } from "@/lib/getParam"
import { getCarMakers } from "@/services/carMakersApi"
import { useQuery } from "@tanstack/react-query"

import { useEffect } from "react"
import { useSearchParams } from "react-router"

export default function useCarMakers() {
  const [searchParams] = useSearchParams()
  const name = getParam(searchParams, "name", "")
  const pageNumber = getParam(searchParams, "page", 1)
  const limit = getParam(searchParams, "limit", 0)
  const id = getParam(searchParams, "id", "")

  const {
    data: carMakersData,
    error: carMakersError,
    isLoading: carMakersLoading,
  } = useQuery({
    queryKey: ["carMakers", name, pageNumber, limit, id],
    queryFn: () => getCarMakers(),
  })

  return {
    carMakers: carMakersData?.data || [],
    pagination: carMakersData?.pagination,
  }
}
