import useDebounce from "@hooks/use-debounce";
import { searchCategories } from "@lib/services/categories";
import { useQuery } from "@tanstack/react-query";

export default function useSearchCategories(searchTerm: string) {
  const value = useDebounce(searchTerm, 350);
  const {
    data: { categories, products, productTypes, error } = {},
    isLoading,
  } = useQuery({
    queryFn: () => searchCategories(searchTerm),
    queryKey: ["categories", value],
    // enabled: !!value
  });
  return { categories, products, productTypes, error, isLoading };
}
