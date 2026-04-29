import useDebounce from "@/hooks/useDebounce"
import { getCategories } from "@/services/categoryApi"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "react-router"

interface Filters {
  name?: string
  page?: number
  limit?: number
}

export default function useCategories() {
  const [searchParams] = useSearchParams()

  // 1. Better defaults for Numbers
  const page = Number(searchParams.get("page")) || 1
  const limit = Number(searchParams.get("limit")) || 0

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

  const { data, error, isError, isLoading } = useQuery({
    queryKey: ["categories", filters],
    queryFn: () => getCategories(filters),
  })

  return {
    categories: data?.data || [],
    pagination: data?.pagination,
    isError,
    isLoading,
    error,
  }
}
