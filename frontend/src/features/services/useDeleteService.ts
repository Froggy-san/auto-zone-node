import { deleteService } from "@/services/servicesApi"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export default function useDeleteService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
      queryClient.invalidateQueries({ queryKey: ["services-stats"] })
    },
  })
}
