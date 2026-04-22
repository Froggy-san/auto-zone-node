import { updateCategory } from "@/services/categoryApi"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export default function useUpdateCategory() {
  const queryClient = useQueryClient()

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })
  return { mutate, isPending, isError, error }
}
