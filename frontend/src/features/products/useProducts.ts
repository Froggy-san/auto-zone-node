import useDebounce from "@/hooks/useDebounce"
import { getProducts } from "@/services/productApi"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo } from "react"
import { useSearchParams } from "react-router"

interface Filters {
  priceFrom?: string
  priceTo?: string
  carMaker?: string
  carBrand?: string
  carModel?: string
  generations?: string
  category?: string
  productType?: string
  productBrand?: string
  isAvailable?: string
  name?: string
  page?: string
  limit?: string
}

export default function useProducts(props?: Filters) {
  // const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const page = Number(props?.page) || 1

  const filters = useMemo(() => {
    const queryObj: Record<string, any> = {
      page,
      limit: Number(props?.limit) || undefined,
      carBrand: props?.carBrand,
      carMaker: props?.carMaker,
      carModel: props?.carModel,
      generations: props?.generations,
      category: props?.category,
      productType: props?.productType,
      productBrand: props?.productBrand,
      isAvailable:
        props?.isAvailable === "true"
          ? true
          : props?.isAvailable === "false"
            ? false
            : undefined,
    }

    if (props?.name && props.name.trim() !== "") {
      queryObj.$or = [
        { name: { $regex: props.name, $options: "i" } },
        { description: { $regex: props.name, $options: "i" } },
      ]
    }
    if (props?.priceFrom) queryObj.listPrice = { $gte: Number(props.priceFrom) }
    if (props?.priceTo) queryObj.listPrice = { $lte: Number(props.priceTo) }

    console.log(queryObj, "QUERY")
    // Clean out undefined parameters completely so they don't pollute the URL string
    return Object.fromEntries(
      Object.entries(queryObj).filter(
        ([_, v]) => v !== undefined && v !== "" && v !== null
      )
    )
  }, [props])
  console.log(filters, "FILTERS")

  const { data, isLoading, isError, error, ...rest } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => getProducts(filters),
    retry: false,
  })

  // 4. Move Prefetching into a useEffect
  useEffect(() => {
    const totalPages = data?.pagination?.totalPages || 1

    // Prefetch Next
    if (page < totalPages) {
      const nextFilters = { ...filters, page: page + 1 }
      queryClient.prefetchQuery({
        queryKey: ["products", nextFilters],
        queryFn: () => getProducts(nextFilters),
      })
    }

    // Prefetch Previous
    if (page > 1) {
      const prevFilters = { ...filters, page: page - 1 }
      queryClient.prefetchQuery({
        queryKey: ["products", prevFilters],
        queryFn: () => getProducts(prevFilters),
      })
    }
  }, [data, page, filters, queryClient]) // Only run when these change

  return {
    products: data?.products || [],
    pagination: data?.pagination,
    isLoading,
    isError,
    error,
    ...rest,
  }
}
