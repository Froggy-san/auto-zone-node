import { getClinetById } from "@lib/services/client";
import { useQuery } from "@tanstack/react-query";

type GetBy = "id" | "user_id";
export default function useClientById({
  id,
  getBy = "id",
}: {
  id?: number | string;
  getBy?: GetBy;
}) {
  const { data: { clientById, error } = {}, isLoading } = useQuery({
    queryFn: () => getClinetById({ id, getBy }),
    queryKey: ["clientById", id, getBy],
    enabled: !!id,
  });

  return { clientById, error, isLoading };
}
