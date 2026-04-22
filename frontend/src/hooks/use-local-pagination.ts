import { useMemo } from "react";

interface UseLocalPaginationProps<T> {
  pageSize?: number;
  currPage: number;
  arr: T[];
}

export default function useLocalPagination<T>({
  pageSize = 12,
  currPage,
  arr,
}: UseLocalPaginationProps<T>) {
  const totalItems = arr.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const result = useMemo(() => {
    const pageFrom = pageSize * (currPage - 1);
    return arr.slice(pageFrom, pageFrom + pageSize);
  }, [pageSize, currPage, arr]);

  return {
    result,
    totalPages,
    totalItems,
  };
}
