import { getProductSoldById } from "@/services/prodcutSoldApi"

import { useQuery } from "@tanstack/react-query"

export default function useProductSoldById(id?: string) {
  return useQuery({
    queryFn: () => getProductSoldById(id || ""),
    queryKey: ["productSold", id],
    enabled: !!id,
  })
}
