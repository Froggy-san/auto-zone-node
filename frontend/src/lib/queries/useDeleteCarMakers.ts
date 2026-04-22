"use client";
import { useToast } from "@hooks/use-toast";
import { deleteCarMaker } from "@lib/services/car-maker-services";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useDeleteCarMaker() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { isLoading, mutateAsync: deleteMaker } = useMutation({
    mutationFn: deleteCarMaker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carMakers"] });
    },

    onError: (error: any) => {
      console.log(error);
      throw new Error(error.message);
    },
  });
  return {
    isLoading,
    deleteMaker,
  };
}
