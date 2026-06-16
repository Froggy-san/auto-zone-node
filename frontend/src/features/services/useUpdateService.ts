import { deleteService, updateService } from "@/services/servicesApi"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export default function useUpdateService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
      queryClient.invalidateQueries({ queryKey: ["services-stats"] })
    },
  })
}
