import { getStats } from "@lib/services/dashboard/home";
import { useQuery } from "@tanstack/react-query";

type Params = {
  dateFrom?: string;
  dateTo?: string;
  clientId?: string;
  carId?: string;
  serviceStatusId?: string;
  minPrice?: string;
  maxPrice?: string;
};
export default function useServicesStats(filters: Params) {
  const { data, isLoading, error } = useQuery({
    queryFn: () => getStats(filters),
    queryKey: ["servicesStats"],
  });

  return { data, isLoading, error };
}
