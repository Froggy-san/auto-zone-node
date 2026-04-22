import { deleteCarGenerations } from "@lib/services/car-generations";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useDeleteCarGenerations() {
  const queryClient = useQueryClient();

  const { mutate: deleteGeneration, isLoading: isDeleting } = useMutation({
    mutationFn: deleteCarGenerations,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carMakers"] });
    },
    onError: (error: any) => {
      throw new Error(error);
    },
  });
  return { deleteGeneration, isDeleting };
}
