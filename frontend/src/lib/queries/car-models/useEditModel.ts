import {
  createModel,
  editModel as editModelService,
} from "@lib/services/car-model-services";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useEditModel() {
  // carMakers
  const queryClient = useQueryClient();

  const { isLoading: isEditing, mutateAsync: editModel } = useMutation({
    mutationFn: editModelService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carMakers"] });
    },
    onError: (error: any) => {
      console.log(error);
      throw new Error(error);
    },
  });
  return { isEditing, editModel };
}
