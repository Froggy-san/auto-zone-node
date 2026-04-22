import { deleteModel as deleteModelService } from "@lib/services/car-model-services";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useDeleteModel() {
  // carMakers
  const queryClient = useQueryClient();

  const { isLoading, mutateAsync: deleteModel } = useMutation({
    mutationFn: deleteModelService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carMakers"] });
    },
    onError: (error: any) => {
      console.log(error);
      throw new Error(error);
    },
  });
  return { isLoading, deleteModel };
}
