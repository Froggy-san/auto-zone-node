import { createProduct } from "@/services/productApi"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export default function useCreateProduct() {
  const queryClient = useQueryClient()

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
  return { mutate, isPending, isError, error }
}
