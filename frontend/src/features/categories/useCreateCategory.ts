import { createCategory } from "@/services/categoryApi"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export default function useCreateCategory() {
  const queryClient = useQueryClient()

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })
  return { mutate, isPending, isError, error }
}
