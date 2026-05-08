import { getCars as getCarsApi, type GetCarsProps } from "@/services/carApi"
import { useQuery } from "@tanstack/react-query"

export default function useCars(filters?: GetCarsProps) {
  return useQuery({
    queryFn: () => getCarsApi(filters),
    queryKey: ["cars", filters],
  })
}
