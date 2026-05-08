import { getUserById as getUserByIdApi } from "@/services/authApi"
import { useQuery } from "@tanstack/react-query"

export default function useUserById(id?: string) {
  const {
    data: userById,
    error,
    isError,
    isLoading,
    ...rest
  } = useQuery({
    queryFn: () => getUserByIdApi(id || ""),
    queryKey: ["userById", id],
    enabled: !!id,
  })
  return {
    userById,
    error,
    isError,
    isLoading,
    ...rest,
  }
}
