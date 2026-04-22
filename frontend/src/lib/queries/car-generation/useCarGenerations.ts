"use client";

import { PILL_SIZE } from "@lib/constants";
import { getCarGenerations } from "@lib/services/car-generations";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function useCarGenerations(page: number) {
  const queryClient = useQueryClient();
  const {
    data: { carGenerations, count } = {},
    isLoading,
    error,
  } = useQuery({
    queryFn: () => getCarGenerations(page),
    queryKey: ["carGenerations", page],
    enabled: !!page,
  });

  const pageCount = count ? Math.ceil(count / PILL_SIZE) : 0;

  if (page < pageCount) {
    queryClient.prefetchQuery({
      queryFn: () => getCarGenerations(page + 1),
      queryKey: ["carGenerations", page + 1],
    });
  }

  if (page > pageCount) {
    queryClient.prefetchQuery({
      queryFn: () => getCarGenerations(page - 1),
      queryKey: ["carGenerations", page - 1],
    });
  }
  return { carGenerations, pageCount, isLoading, error };
}
