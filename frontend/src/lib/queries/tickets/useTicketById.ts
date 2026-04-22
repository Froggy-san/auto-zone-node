import { getTicketById } from "@lib/services/ticket";
import { useQuery } from "@tanstack/react-query";

export default function useTicketById(id?: string) {
  const { data: { ticket, error } = {}, isLoading } = useQuery({
    queryFn: () => getTicketById(id || ""),
    queryKey: ["ticketById", id],
    enabled: !!id?.length,
  });
  return { ticket, error, isLoading };
}
