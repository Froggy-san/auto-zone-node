import { getServiceStatuses } from "@/services/serviceStatusApi"
import { useQuery } from "@tanstack/react-query"

export default function useServiceStatuses(filters?: Record<string, any>) {
  return useQuery({
    queryKey: ["serviceStatuses", filters],
    queryFn: () => getServiceStatuses(filters),
  })
}
