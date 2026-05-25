import { getServiceFeeById } from "@/services/serviceFees"
import { useQuery } from "@tanstack/react-query"

export default function useServiceFeeById(id?: string) {
  return useQuery({
    queryFn: () => getServiceFeeById(id || ""),
    queryKey: ["serviceFee", id],
    enabled: !!id,
  })
}
