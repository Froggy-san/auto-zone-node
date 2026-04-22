import { createModel as createModelService } from "@lib/services/car-model-services";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useCreateModel() {
  // carMakers
  const queryClient = useQueryClient();

  const { isLoading: isCreating, mutateAsync: createModel } = useMutation({
    mutationFn: createModelService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carMakers"] });
    },
    onError: (error: any) => {
      console.log(error);
      throw new Error(error);
    },
  });
  return { isCreating, createModel };
}
