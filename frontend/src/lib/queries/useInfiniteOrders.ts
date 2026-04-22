import {
  GetInfiniteOrderAction,
  getInfiniteOrdersAction,
} from "@lib/actions/orderActions";
import { useInfiniteQuery } from "@tanstack/react-query";

export default function useInfiniteOrders(
  filters: Omit<GetInfiniteOrderAction, "pageParam">,
) {
  // Ensure we return the result of the hook!
  return useInfiniteQuery({
    // Using a spread of filters ensures React Query tracks each change individually
    queryKey: ["orders", { ...filters }],
    queryFn: async ({ pageParam = 0 }) => {
      // Explicitly pass pageParam and ensure it's a number
      const result = await getInfiniteOrdersAction({
        pageParam: pageParam as number,
        ...filters,
      });

      if (result.error) throw new Error(result.error);

      return result;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
