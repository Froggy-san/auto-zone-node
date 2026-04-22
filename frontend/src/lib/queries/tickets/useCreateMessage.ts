import { createMessage as createMessageService } from "@lib/services/ticket";
import { Message } from "@lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useCreateMessage() {
  const queryClient = useQueryClient();
  const { mutateAsync: createMessage, isPending } = useMutation({
    mutationFn: createMessageService,
    onSuccess: (newMessage: Message | null) => {
      if (!newMessage) return;

      // 1. Get the relevant ticket ID
      const ticketId = newMessage.ticket_id;

      // 2. Use setQueryData to update the existing message list for that ticket

      queryClient.setQueryData(
        ["message", `${ticketId}`],
        (oldMessages: any) => {
          // If the old data doesn't exist, just return the new message as an array
          if (!oldMessages.messages.length) {
            return { ...oldMessages, messages: [newMessage] };
          }

          // 3. Append the new message to the existing list
          // Note: The optimistic update already added it, but this step ensures
          // the *real* message (with the correct ID) is used in the cache.

          // **CRITICAL STEP:** Remove the optimistic message (with the temp ID)
          // and replace it with the real message.
          // Assuming your 'succeed' dispatch handles this, the key for caching is usually
          // simply appending the new message if your query is a single list.

          // Since you are using a separate optimistic reducer (dispatchOptimistic)
          // that handles the temporary message, the simplest clean update is:

          // Find and replace the temporary message if it was optimistically added,
          // or just append the new one if the optimistic state is handled elsewhere.

          // A common robust pattern is to find the temporary message and replace it:

          // If your server action returns the *real* data, and you know the real ID
          // (newMessage.id) you can merge it:

          const oldmesasgesArr = oldMessages.messages.filter(
            (msg: Message) => msg.id !== newMessage.id
          );
          return {
            ...oldMessages,
            messages: [...oldmesasgesArr, newMessage].sort(
              (a, b) => a.id - b.id
            ),
          };
        }
      );
    },
    onError: (error: any) => {
      console.log("Message creation error:", error);
      throw new Error(error);
    },
  });

  return { createMessage, isLoading: isPending };
}
