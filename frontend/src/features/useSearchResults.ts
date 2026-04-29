import { searchBarResults } from "@/services/searchBarApi"
import { useQuery } from "@tanstack/react-query"

export default function useSearchResults(searchTerm: string) {
  const {
    data: { categories, products, productTypes } = {},
    error,
    isError,
    isLoading,
  } = useQuery({
    queryFn: () => searchBarResults(searchTerm),
    queryKey: ["searchResults", searchTerm],
  })

  return { categories, products, productTypes, error, isError, isLoading }
}
