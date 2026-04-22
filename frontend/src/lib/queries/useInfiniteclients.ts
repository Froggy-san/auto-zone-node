import { getInfiniteClients } from "@lib/services/client";
import { useInfiniteQuery } from "@tanstack/react-query";

interface GetInfiniteClientsProps {
  name?: string;
}
export default function useInfiniteClients(filters: GetInfiniteClientsProps) {
  const {
    isFetched,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    error,
    data,
    status,
  } = useInfiniteQuery({
    queryKey: ["infiniteClients", filters],
    queryFn: ({ queryKey, pageParam = 1 }) =>
      getInfiniteClients({ pageParam, queryKey } as {
        pageParam?: number;
        queryKey: [string, GetInfiniteClientsProps];
      }),

    getNextPageParam: (lastPage) => {
      return lastPage.nextPageParam;
    },
  });

  return {
    isFetched,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    error,
    fetchNextPage,
    data,
    status,
  };
}
