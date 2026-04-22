import useDebounce from "@hooks/use-debounce";
import { searchProductTypes } from "@lib/services/product-types";
import { useQuery } from "@tanstack/react-query";

export default function useProductTypes(searchTerm: string) {
  const value = useDebounce(searchTerm, 350);
  const { data: { productTypes, error } = {}, isLoading } = useQuery({
    queryFn: () => searchProductTypes(value),
    queryKey: ["productTypes", value],
  });
  return { productTypes, error, isLoading };
}
