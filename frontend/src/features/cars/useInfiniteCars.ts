import { getCars } from "@/services/carApi"
import { useInfiniteQuery } from "@tanstack/react-query"

export default function useInfiniteCars(searchTerm?: string) {
  return useInfiniteQuery({
    queryKey: ["infiniteCars", searchTerm],
    queryFn: ({ pageParam = 1 }) => {
      // We override the 'page' from filters with the 'pageParam' from React Query
      return getCars({
        // name: searchTerm,
        page: String(pageParam),
        limit: "12",
        plateNumber: searchTerm,
      })
    },
    initialPageParam: 1,
    // Logic to determine the next page number
    getNextPageParam: (lastPage, allPages) => {
      // If the last fetch returned fewer items than the limit,
      // we've probably reached the end.
      const limit = 12
      if (lastPage.data.length < limit) return undefined

      // Otherwise, return the next page number
      return allPages.length + 1
    },
  })
}
