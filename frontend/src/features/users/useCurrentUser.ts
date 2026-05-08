import { getCurrentUser } from "@/services/authApi"
import { useQuery } from "@tanstack/react-query"

export default function useCurrentUser() {
  const {
    data: user,
    isLoading,
    error,
    isError,
    ...rest
  } = useQuery({
    queryFn: getCurrentUser,
    queryKey: ["user"],
    retry: false,
  })

  return {
    user,
    isLoading,
    error,
    isError,
    ...rest,
  }
}
