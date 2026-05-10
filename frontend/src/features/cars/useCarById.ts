import { getCarById } from "@/services/carApi"
import { useQuery } from "@tanstack/react-query"

export default function useCarById(id?: string, carId?: string) {
  return useQuery({
    queryFn: () => getCarById(id || "", carId || ""),
    queryKey: ["carById", id, carId],
  })
}
