import { updateProductSold } from "@/services/prodcutSoldApi"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export default function useUpdateProSold() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateProductSold,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
      queryClient.invalidateQueries({ queryKey: ["services-stats"] })
      queryClient.invalidateQueries({ queryKey: ["infiniteProducts"] })
    },
    onError: (err) => {
      console.log(err.message)
    },
  })
}
