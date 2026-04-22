import useCurrUser from "@lib/queries/useCurrUser";
import { getClinetById } from "@lib/services/client";
import { useQuery } from "@tanstack/react-query";

export default function useCurrentClient() {
  const { user } = useCurrUser();

  const { data: { clientById, error } = {}, isLoading } = useQuery({
    queryKey: ["currentClient", user?.id],
    queryFn: () => getClinetById({ id: user?.id, getBy: "user_id" }),
    enabled: !!user,
  });
  return { clientById, error, isLoading };
}
