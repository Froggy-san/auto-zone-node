import { updateServiceFee } from "@/services/serviceFeesApi"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export default function useUpdateServiceFee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateServiceFee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
      queryClient.invalidateQueries({ queryKey: ["services-stats"] })
    },
  })
}
