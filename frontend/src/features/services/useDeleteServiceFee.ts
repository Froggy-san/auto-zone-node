import { deleteServiceFee } from "@/services/serviceFeesApi"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export default function useDeleteServiceFee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteServiceFee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
      queryClient.invalidateQueries({ queryKey: ["services-stats"] })
      toast.success("Service fee deleted")
    },
    onError: (err) => {
      console.log(err.message)
      toast.error(err.message)
    },
  })
}
