import useDebounce from "@hooks/use-debounce";
import { getTicketHistory } from "@lib/services/ticket-history";
import { TicketHistoryAction } from "@lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { z } from "zod";
interface Filters {
  id?: number | undefined;
  action?: z.infer<typeof TicketHistoryAction>;
  created_at?: string;
  clientName?: string;
  clientId?: number;
  admin_assigned_to?: string;
  ticketCategory_id?: number;
  ticketPriority_id?: number;
  ticketStatus_id?: number;
  ticketId?: number;
  dateFrom?: Date;
  dateTo?: Date;
  searchterm?: {
    term: string;
    type:
      | "default"
      | "actor_id"
      | "ticket_id.client_id"
      | "id"
      | "ticket_id"
      | "actor_id";
  };
  sort?: "asc" | "desc" | string;
}
export default function useInfiniteTicketHistory(filters: Filters) {
  // const searchterm = useDebounce(filters.searchterm, 500);

  // const appliedFilters = { ...filters, searchterm };
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["ticketHistory", filters],
    // 2. queryFn: The function that fetches the data for a page
    queryFn: ({ queryKey, pageParam }) =>
      getTicketHistory({
        pageParam: pageParam as number,
        queryKey: queryKey as [string, Filters],
      }),
    // 3. initialPageParam: The starting page number
    // initialPageParam: 1,

    // 4. getNextPageParam: Crucial—tells Query how to get the next parameter
    getNextPageParam: (lastPage) => {
      // We rely on the `lastPage.nextPageParam` which is `page + 1` or `null`
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
