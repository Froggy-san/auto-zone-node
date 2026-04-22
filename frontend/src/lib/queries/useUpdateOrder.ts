import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrderOrderStatusAction } from "@lib/actions/orderActions";
import { z } from "zod";
import { Order, OrderStatusSchema } from "@lib/types";
import { revalidateOrdersCache } from "@lib/services/orders";

export default function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  // Define types clearly to help TS find the right overload
  const { mutateAsync: updateOrder, isPending } = useMutation({
    // Explicitly type the variables passed to the function (orderId and updates)
    mutationFn: async ({
      id,
      updates,
    }: {
      id: number;
      updates: z.infer<typeof OrderStatusSchema>;
    }) => {
      const result = await updateOrderOrderStatusAction(id, updates);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (updatedData: Order | null) => {
      if (updatedData) revalidateOrdersCache(updatedData, queryClient);
    },
    onError: (error: any) => {
      console.error("Order update error:", error.message);
    },
  });

  return { updateOrder, isPending };
}
