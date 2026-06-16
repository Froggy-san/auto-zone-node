import useDebounce from "@/hooks/useDebounce"
import { getUsers, type GetUsersProps } from "@/services/userApi"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useMemo } from "react"

// We make the filters partial so we don't have to provide every single string
// when calling the hook from a component.
export default function useInfiniteUsers({
  searchTerm,
  adminOnly = false,
}: {
  searchTerm: string
  adminOnly?: boolean
}) {
  const debouncedValue = useDebounce(searchTerm, 500)

  const filters = useMemo(() => {
    if (!debouncedValue && !adminOnly) return {}

    const appliedFilters: Record<string, any> = {}

    // 1. Place the $or block directly at the root layer
    if (debouncedValue) {
      appliedFilters.$or = [
        { username: { $regex: debouncedValue, $options: "i" } },
        { email: { $regex: debouncedValue, $options: "i" } },
        { phones: { $regex: debouncedValue, $options: "i" } },
        { role: { $regex: debouncedValue, $options: "i" } },
      ]
    }

    // 2. Place standard field filters right alongside it at the root layer
    if (adminOnly) {
      appliedFilters.role = "admin"
    }

    return appliedFilters
  }, [debouncedValue, adminOnly])
  // const filters: Record<string, string> = searchTerm
  //   ? {
  //       username: `username[or]=${searchTerm}`,
  //       email: `email[or]=${searchTerm}`,
  //       phones: `phones[or]=${searchTerm}`,
  //     }
  //   : {}

  // if (adminOnly) {
  //   filters["role"] = "admin"
  // }
  return useInfiniteQuery({
    queryKey: ["users", debouncedValue, adminOnly],
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
      if (lastPage.data.length < limit) return undefined

      // Otherwise, return the next page number
      return allPages.length + 1
    },
  })
}
