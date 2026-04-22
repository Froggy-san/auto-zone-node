import { getTicketHistory } from "@lib/services/ticket-history";
import { TicketHistoryAction } from "@lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { z } from "zod";
interface Filters {
  id?: number | undefined;
  action?: z.infer<typeof TicketHistoryAction>;
  created_at?: string;
  clinetName?: string;
  clinetId?: string;
  admin_assigned_to?: string;
  ticketCategory_id?: number;
  ticketPriority_id?: number;
  ticketStatus_id?: number;
  ticketId?: number;
  dateFrom?: Date;
  dateTo?: Date;
}
export default function useInfinteTicketHistoryById(ticketId?: number) {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    enabled: !!ticketId,
    queryKey: ["ticketHistoryById", { ticketId }],

    queryFn: ({ queryKey, pageParam }) =>
      getTicketHistory({
        pageParam: pageParam as number,
        queryKey: queryKey as [string, Filters],
      }),

    getNextPageParam: (lastPage) => {
      return lastPage.nextPageParam;
    },
  });

  return {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  };
}
