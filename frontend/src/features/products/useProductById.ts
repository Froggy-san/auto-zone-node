import { getProductById } from "@/services/productApi"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "react-router"

export function useProductById(id: string) {
  const [searchParams] = useSearchParams()
  const {
    data: { product, nextProductId, prevProductId } = {},
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id, searchParams),
  })

  return {
    product,
    nextProductId: nextProductId || null,
    prevProductId: prevProductId || null,
    isLoading,
    isError,
    error,
  }
}
