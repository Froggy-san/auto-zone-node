import { updateProductType } from "@/services/productTypeApi"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export default function useUpdateProductType() {
  const queryClient = useQueryClient()

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      updateProductType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productTypes"] })
    },
  })
  return { mutate, isPending, isError, error }
}
