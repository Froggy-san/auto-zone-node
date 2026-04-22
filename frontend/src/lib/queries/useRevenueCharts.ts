import { getAllCategoriesAction } from "@lib/actions/categoriesAction";
import { getOrdersStatsAction } from "@lib/actions/orderActions";
import { getServicesAction } from "@lib/actions/serviceActions";
import { useQuery } from "@tanstack/react-query";
import { promise } from "zod";

interface Props {
  dateFrom?: string;
  dateTo?: string;
  clientId?: string;
  carId?: string;
  serviceStatusId?: string;
  minPrice?: string;
  maxPrice?: string;
}
export default function useRevenueCharts(props: Props) {
  const { data, error, isLoading } = useQuery({
    queryFn: async () => {
      const [servicesData, categoriesData, orderStatsData] = await Promise.all([
        getServicesAction({ ...props }),
        getAllCategoriesAction(),
        getOrdersStatsAction({
          dateFrom: props.dateFrom,
          dateTo: props.dateTo,
        }),
      ]);

      // 1. Extract with unique aliases
      const { data: services, error: sError } = servicesData;
      const { data: categories, error: cError } = categoriesData;
      const { data: orderStats, error: oError } = orderStatsData;

      // 2. Aggregate errors
      const firstError = sError || cError || oError;

      // 3. IMPORTANT: Throw so TanStack Query sees the error
      if (firstError) {
        throw new Error(
          firstError.message || firstError || "Failed to fetch dashboard data",
        );
      }

      // 4. Return the combined data
      return {
        services: services?.data,
        categories,
        orderStats,
      };
    },
    queryKey: ["revenueChart", { ...props }],
  });
  return { data, error, isLoading };
}
