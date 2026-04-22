import { createProductType } from "@/services/productTypeApi"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export default function useCreateProductType() {
  const queryClient = useQueryClient()

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: createProductType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productTypes"] })
    },
  })
  return { mutate, isPending, isError, error }
}
