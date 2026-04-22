import { getMessages } from "@lib/services/ticket";
import { useQuery } from "@tanstack/react-query";

export default function useMessages(id?: string) {
  const { data: { messages, error } = {}, isLoading: isMessagesLoading } =
    useQuery({
      queryFn: () => getMessages(id || ""),
      queryKey: ["message", id],
      // staleTime: undefined,

      //!IMPORTANT -----------------------------------------------------
      // refetchOnWindowFocus: false,   // uncmmenting this part will fix the issue of fetching messages that are still pending in the upload process, IMORTANT TO NOTE: that we kinda fixed this issue inside the 'useCreateMessage' hook, by filtering the 'half ready' messages that are displayed in the UI once the creation process is done.  in order to see how this fixs the fetching problem uncomment that part and remove the filtering on the "useCreateMessage" hook, but doing that will prevent 'use query' from fetching data when the user changes window foucs. so in another words pick your poison.

      enabled: !!id?.length,
    });
  return { messages, error, isMessagesLoading };
}
