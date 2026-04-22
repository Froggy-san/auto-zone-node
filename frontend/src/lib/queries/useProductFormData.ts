import { getProductFormReleventData } from "@lib/data-service";
import { useQuery } from "@tanstack/react-query";

export default function useProductFormData() {
  const {
    data: { categories, carInfos, carBrands, brandTypes } = {},
    isLoading,
    error,
  } = useQuery({
    queryFn: getProductFormReleventData,
    queryKey: ["ProductFormReleventData"],
  });

  return { categories, carInfos, carBrands, brandTypes, error, isLoading };
}
