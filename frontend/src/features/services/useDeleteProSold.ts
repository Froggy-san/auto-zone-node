import { deleteProductSold } from "@/services/prodcutSoldApi"
import { deleteService } from "@/services/servicesApi"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export default function useDeleteProSold() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProductSold,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
      queryClient.invalidateQueries({ queryKey: ["services-stats"] })
      toast.success("Product sold entry has been deleted!")
    },
    onError: (err) => {
      console.log(err.message)
      toast.error(err.message)
    },
  })
}
