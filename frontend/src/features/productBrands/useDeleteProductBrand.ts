import { deleteProductBrand } from "@/services/productBrandApi"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export default function useDeleteProductBrand() {
  const queryClient = useQueryClient()

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: deleteProductBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productBrands"] })
    },
  })
  return { mutate, isPending, isError, error }
}
