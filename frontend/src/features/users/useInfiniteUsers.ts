import { getUsers, type GetUsersProps } from "@/services/userApi"
import { useInfiniteQuery } from "@tanstack/react-query"

// We make the filters partial so we don't have to provide every single string
// when calling the hook from a component.
export default function useInfiniteUsers(searchTerm: string) {
  const filters = searchTerm
    ? {
        username: `username[or]=${searchTerm}`,
        email: `email[or]=${searchTerm}`,
        phones: `phones[or]=${searchTerm}`,
      }
    : {}
  return useInfiniteQuery({
    queryKey: ["users", searchTerm],
    queryFn: ({ pageParam = 1 }) => {
      // We override the 'page' from filters with the 'pageParam' from React Query
      return getUsers({
        ...filters,
        page: pageParam.toString(),
        limit: "12",
      } as GetUsersProps)
    },
    initialPageParam: 1,
    // Logic to determine the next page number
    getNextPageParam: (lastPage, allPages) => {
      // If the last fetch returned fewer items than the limit,
      // we've probably reached the end.
      const limit = 12
      if (lastPage.data.length && lastPage.data.length < limit) return undefined

      // Otherwise, return the next page number
      return allPages.length + 1
    },
  })
}
