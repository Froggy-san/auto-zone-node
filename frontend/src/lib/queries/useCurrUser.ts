import { getCurrUser } from "@lib/services/user-servcies";
import { useQuery } from "@tanstack/react-query";

export default function useCurrUser() {
  const {
    data: { user, client } = {},
    isLoading,
    error,
  } = useQuery({
    queryFn: getCurrUser,
    queryKey: ["user"],
    staleTime: 100000 * 60 * 5, // Data is fresh for 5 minutes
    // refetchOnWindowFocus: false,
  });
  return { user, client, isLoading, error };
}
