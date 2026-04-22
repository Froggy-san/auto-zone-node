import { getProductById } from "@/services/productApi"
import { useQuery } from "@tanstack/react-query"

export function useProductById(id: string) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
  })

  return {
    data,
    isLoading,
    isError,
  }
}
