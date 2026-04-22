import {
  getAllCarModelsAction,
  getCarModelsCountAction,
} from "@lib/actions/carModelsActions";
import { useQuery } from "@tanstack/react-query";

export default function useCarModels(pageNumber: number) {
  const {
    data: { data, error: apiError } = {},
    isLoading,
    error,
  } = useQuery({
    queryFn: async () => {
      const [carModelData, countData] = await Promise.all([
        getAllCarModelsAction(pageNumber),
        getCarModelsCountAction(),
      ]);

      const { data: models, error: modelError } = carModelData;
      const { data: count, error: countError } = countData;
      const error = modelError || countError || "";
      const data = { models, count };
      return { data, error };
    },
    queryKey: ["carModels", pageNumber],
  });
  return { data, isLoading, apiError, error };
}
