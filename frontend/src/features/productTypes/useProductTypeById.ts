import { getProductTypeById } from "@/services/productTypeApi"
import { useQuery } from "@tanstack/react-query"

export function useProductTypeById(id: string) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["productType", id],
    queryFn: () => getProductTypeById(id),
  })

  return {
    data,
    isLoading,
    isError,
  }
}
