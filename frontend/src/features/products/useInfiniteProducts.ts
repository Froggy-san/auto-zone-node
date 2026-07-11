import { getProducts } from "@/services/productApi"
import { useInfiniteQuery } from "@tanstack/react-query"

export default function useInfiniteProducts(searchTerm: string) {
  // const filters: Record<string, string> = searchTerm
  //   ? {
  //       "name[or]": `${searchTerm}`,
  //       "description[or]": `${searchTerm}`,
  //       // "phones[or]": `phones[or]=${searchTerm}`,
  //     }
  //   : {}

  const baseFilters = {
    fields:
      "_id,id,productImages,name,stock,weightedAverageCost,unitOfMeasurement,listPrice,salePrice,description,isAvailable",
  }
  const filters = searchTerm
    ? {
        ...baseFilters,
        $or: [
          { name: { $regex: searchTerm, $options: "i" } },
          { desciption: { $regex: searchTerm, $options: "i" } },
        ],
      }
    : baseFilters

  return useInfiniteQuery({
    queryKey: ["infiniteProducts", searchTerm],
    queryFn: ({ pageParam = 1 }) => {
      // We override the 'page' from filters with the 'pageParam' from React Query
      return getProducts({
        // name: searchTerm,
        page: pageParam,
        limit: 12,
        ...filters,
      })
    },
    initialPageParam: 1,
    // Logic to determine the next page number
    getNextPageParam: (lastPage, allPages) => {
      // If the last fetch returned fewer items than the limit,
      // we've probably reached the end.
      const limit = 12
      if (lastPage.products.length < limit) return undefined

      // Otherwise, return the next page number
      return allPages.length + 1
    },
  })
}
