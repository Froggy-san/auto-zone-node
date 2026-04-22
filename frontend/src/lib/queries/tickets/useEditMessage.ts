import { editMessages as editMessageApi } from "@lib/services/ticket";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useEditMessage(ticketId: number | undefined) {
  const queryClient = useQueryClient();

  const { mutateAsync: editMessage, isPending } = useMutation({
    mutationFn: editMessageApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message", `${ticketId}`] });
    },
  });

  return { editMessage, isLoading: isPending };
}
