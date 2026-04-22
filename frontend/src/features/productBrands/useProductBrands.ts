import useDebounce from "@/hooks/useDebounce"
import { getProductBrands } from "@/services/productBrandApi"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "react-router"

interface Filters {
  name?: string
  page?: number
  limit?: number
}

export default function useProductBrands() {
  const [searchParams] = useSearchParams()

  // 1. Better defaults for Numbers
  const page = Number(searchParams.get("page")) || 1
  const limit = Number(searchParams.get("limit")) || 12

  // 2. Simple helper for string params
  const getParam = (key: string) => searchParams.get(key) || undefined

  const name = getParam("name")
  const debouncedName = useDebounce(name, 500)

  // 3. Construct the filters object
  const filters: Filters = {
    page,
    limit,
    name: debouncedName,
  }

  const { data, isError, isLoading } = useQuery({
    queryKey: ["productBrands", filters],
    queryFn: () => getProductBrands(filters),
  })
  return {
    productBrands: data?.data || [],
    pagination: data?.pagination,
    isError,
    isLoading,
  }
}
