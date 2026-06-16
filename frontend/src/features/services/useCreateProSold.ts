import { createProductSold } from "@/services/prodcutSoldApi"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export default function useCreateProSold() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProductSold,
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
