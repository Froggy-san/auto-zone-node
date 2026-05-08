import { createProduct as createProductApi } from "@/services/productApi"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export default function useCreateProduct() {
  const queryClient = useQueryClient()

  const {
    mutateAsync: createProduct,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: createProductApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
  return { createProduct, isPending, isError, error }
}
