import { updateProductBrand } from "@/services/productBrandApi"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export default function useUpdateProductBrand() {
  const queryClient = useQueryClient()

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) =>
      updateProductBrand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productBrands"] })
    },
  })
  return { mutate, isPending, isError, error }
}
