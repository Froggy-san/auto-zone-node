import useDebounce from "@/hooks/useDebounce"
import { getProducts } from "@/services/productApi"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { useSearchParams } from "react-router"

interface Filters {
  priceFrom?: string
  priceTo?: string
  carBrand?: string
  carModel?: string
  carGeneration?: string
  category?: string
  subCategory?: string
  productBrand?: string
  isAvailable?: boolean
  name?: string
  page?: number
  limit?: number
}


export default function useProducts() {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // 1. Better defaults for Numbers
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 12;

  // 2. Simple helper for string params
  const getParam = (key: string) => searchParams.get(key) || undefined;

  const name = getParam("name");
  const debouncedName = useDebounce(name, 500);

  // 3. Construct the filters object
  // We wrap this in useMemo so the queryKey doesn't "change" unless a value changes
  const filters: Filters = {
    page,
    limit,
    name: debouncedName,
    priceFrom: getParam("priceFrom"),
    priceTo: getParam("priceTo"),
    carBrand: getParam("carBrand"),
    carModel: getParam("carModel"),
    carGeneration: getParam("carGeneration"),
    category: getParam("category"),
    subCategory: getParam("subCategory"),
    productBrand: getParam("productBrand"),
    isAvailable: searchParams.get("isAvailable") === "true" ? true : 
                 searchParams.get("isAvailable") === "false" ? false : undefined,
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => getProducts(filters),
  });

  // 4. Move Prefetching into a useEffect
  useEffect(() => {
    const totalPages = data?.pagination?.totalPages || 1;

    // Prefetch Next
    if (page < totalPages) {
      const nextFilters = { ...filters, page: page + 1 };
      queryClient.prefetchQuery({
        queryKey: ["products", nextFilters],
        queryFn: () => getProducts(nextFilters),
      });
    }

    // Prefetch Previous
    if (page > 1) {
      const prevFilters = { ...filters, page: page - 1 };
      queryClient.prefetchQuery({
        queryKey: ["products", prevFilters],
        queryFn: () => getProducts(prevFilters),
      });
    }
  }, [data, page, filters, queryClient]); // Only run when these change

  return {
    products: data?.products,
    pagination: data?.pagination,
    isLoading,
    isError,
  };
}