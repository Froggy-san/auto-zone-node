"use client";

import useDebounce from "@hooks/use-debounce";
import { MAKER_PAGE_SIZE } from "@lib/constants";
import { getCarMakers } from "@lib/services/car-maker-services";
import { useQuery } from "@tanstack/react-query";

export default function useCarMakers(page: number, searchTerm: string) {
  const value = useDebounce(searchTerm, 300);
  const {
    data: { data, count } = {},
    isLoading,
    error,
  } = useQuery({
    queryFn: () => getCarMakers(page, searchTerm),
    queryKey: ["carMakers", page, value],
    enabled: !!page,
  });

  const pageCount = count ? Math.ceil(Number(count) / MAKER_PAGE_SIZE) : 0;

  return { data, pageCount, isLoading, error };
}
