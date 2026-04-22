import { editCarGeneration } from "@lib/services/car-generations";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useEditGeneration() {
  const queryClient = useQueryClient();
  const { isLoading, mutateAsync: editGeneration } = useMutation({
    mutationFn: editCarGeneration,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carMakers"] });
    },
    onError: (error: any) => {
      throw new Error(error);
    },
  });
  return { isLoading, editGeneration };
}
