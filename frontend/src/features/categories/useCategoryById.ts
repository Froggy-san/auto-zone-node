import { getCategoryById } from "@/services/categoryApi"
import { useQuery } from "@tanstack/react-query"

export function useCategoryById(id: string) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategoryById(id),
  })

  return {
    data,
    isLoading,
    isError,
  }
}
