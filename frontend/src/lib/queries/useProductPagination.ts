import { getProductsCountAction } from "@lib/actions/productsActions";
import { useQuery } from "@tanstack/react-query";
interface ProductsListProps {
  name?: string;
  categoryId?: string;
  productTypeId?: string;
  productBrandId?: string;
  isAvailable?: string;
}
export default function useProductPagination(queries: ProductsListProps) {
  const { data: { data: count, error } = {}, isLoading } = useQuery({
    queryFn: async () => await getProductsCountAction(queries),
    queryKey: ["productCount", queries],
  });
  return { count, error, isLoading };
}
