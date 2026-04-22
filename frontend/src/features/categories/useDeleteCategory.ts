import { deleteCategory } from "@/services/categoryApi"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export default function useDeleteCategory() {
  const queryClient = useQueryClient()

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })
  return { mutate, isPending, isError, error }
}
