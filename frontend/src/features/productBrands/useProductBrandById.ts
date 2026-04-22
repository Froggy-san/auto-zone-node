import { getProductBrandById } from "@/services/productBrandApi"
import { useQuery } from "@tanstack/react-query"

export function useProductBrandById(id: string) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["productBrand", id],
    queryFn: () => getProductBrandById(id),
  })

  return {
    data,
    isLoading,
    isError,
  }
}
