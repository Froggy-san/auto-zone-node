import { createProductBrand } from "@/services/productBrandApi"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export default function useCreateProductBrand() {
  const queryClient = useQueryClient()

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: createProductBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productBrands"] })
    },
  })
  return { mutate, isPending, isError, error }
}
