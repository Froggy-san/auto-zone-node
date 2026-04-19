import { getProducts } from "@/services/productApi"
import { useQuery } from "@tanstack/react-query"

export default function useProducts() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  })
  return { products: data, isLoading, isError }
}
