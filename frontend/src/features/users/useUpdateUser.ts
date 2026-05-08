import { updateUser as updateUserApi } from "@/services/authApi"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export default function useUpdateUser() {
  const queryClient = useQueryClient()
  const { mutate: updateUser, isPending: isLoading } = useMutation({
    mutationFn: updateUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] })
      queryClient.invalidateQueries({ queryKey: ["userById"] })
      toast.success("User's data has been updated.")
    },
    onError: (error) => {
      toast.error(`Failed to update user's data: ${error.message}`)
    },
  })

  return { updateUser, isLoading }
}
