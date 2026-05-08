import { getCarMakers } from "@/services/carMakersApi"
import { useInfiniteQuery } from "@tanstack/react-query"

export default function useInfiniteCarMakers(searchTerm: string) {
  return useInfiniteQuery({
    queryKey: ["carMakers", searchTerm],
    queryFn: ({ pageParam = 1 }) => {
      // We override the 'page' from filters with the 'pageParam' from React Query
      return getCarMakers({
        name: searchTerm,
        page: pageParam,
        limit: 12,
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
