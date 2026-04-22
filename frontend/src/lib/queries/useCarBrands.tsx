import useDebounce from "@hooks/use-debounce";
import { getAllCarBrands } from "@lib/services/car-maker-services";
import { useQuery } from "@tanstack/react-query";

export default function useCarBrands(searchTerm: string) {
  const debouncedValue = useDebounce(searchTerm, 300);
  const {
    data: carBrands,
    error,
    isLoading,
  } = useQuery({
    queryFn: () => getAllCarBrands(debouncedValue),
    queryKey: ["allCarBrands", debouncedValue],
  });
  return { carBrands, error, isLoading };
}
