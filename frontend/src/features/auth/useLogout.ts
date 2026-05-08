import { logout as logoutApi } from "@/services/authApi"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { toast } from "sonner"

export default function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { mutate: logout, isPending } = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      // 1. Completely remove the user data from the cache
      queryClient.removeQueries({ queryKey: ["user"] })

      // 2. Clear ALL other data (optional but recommended for security)
      queryClient.clear()
      // navigate("/login", { replace: true })
      toast.success("You have been logged out")
    },
  })

  return {
    logout,
    isPending,
  }
}
