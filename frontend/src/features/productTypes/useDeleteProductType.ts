import { deleteProductType } from "@/services/productTypeApi"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export default function useDeleteProductType() {
  const queryClient = useQueryClient()

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: deleteProductType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productTypes"] })
    },
  })
  return { mutate, isPending, isError, error }
}
