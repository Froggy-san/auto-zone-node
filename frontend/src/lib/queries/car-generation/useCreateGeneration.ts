import { createCarGeneration } from "@lib/services/car-generations";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useCreateGeneration() {
  const queryClient = useQueryClient();
  const { isLoading, mutateAsync: createGeneration } = useMutation({
    mutationFn: createCarGeneration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carMakers"] });
    },
    onError: (error: any) => {
      console.log(error);
      throw new Error(error);
    },
  });

  return { isLoading, createGeneration };
}
