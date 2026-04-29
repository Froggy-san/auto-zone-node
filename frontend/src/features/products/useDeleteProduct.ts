import { deleteProduct as deleteProductApi } from "@/services/productApi"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export default function useDeleteProduct() {
  const queryClient = useQueryClient()
  const {
    mutateAsync: deleteProduct,
    isError,
    error,
    isPending,
  } = useMutation({
    mutationFn: deleteProductApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })

  return { deleteProduct, isError, error, isPending }
}
