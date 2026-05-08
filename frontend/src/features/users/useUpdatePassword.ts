import { updatePassword as updatePasswordApi } from "@/services/authApi"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams } from "react-router"
import { toast } from "sonner"

export default function useUpdatePassword() {
  const queryClient = useQueryClient()
  const { userId } = useParams()
  const { mutate: updatePassword, isPending: isLoading } = useMutation({
    mutationFn: updatePasswordApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] })
      queryClient.invalidateQueries({ queryKey: ["userById", userId] })

      toast.success("Password has been updated, Try to re-loggin")
    },
    onError: (error) => {
      toast.error(`Failed to update password: ${error.message}`)
    },
  })

  return { updatePassword, isLoading }
}
