import { PAGE_SIZE } from "@lib/constants";
import {
  Order,
  OrderStatusSchema,
  PaymentMethod,
  PaymentStatusSchema,
} from "@lib/types";
import { useQueryClient } from "@tanstack/react-query";
import supabase from "@utils/supabase";
import { includes } from "lodash";
import { z } from "zod";

interface GetInfiniteOrdersProps {
  id?: number;
  createdAt?: Date;
  totalAmount?: number;
  paymentMethod?: z.infer<typeof PaymentMethod>;
  paymentStatus?: z.infer<typeof PaymentStatusSchema>;
  orderStatus?: z.infer<typeof OrderStatusSchema>;
  stripePaymentId?: string;
  pickupDate?: Date;
  orderFulfilledAt?: Date;
  sort?: "asc" | "desc" | string;
}

export async function getInfiniteOrders({
  pageParam = 1,
  queryKey,
}: {
  pageParam: number;
  queryKey: [string, GetInfiniteOrdersProps];
}): Promise<{
  items: Order[];
  nextPageParam: number | null;
}> {
  const [_, filters] = queryKey;
  let query = supabase
    .from("orders")
    .select("*,clients(*)", { count: "exact" });

  if (filters.id) query = query.eq("id", filters.id);
  if (filters.createdAt) {
    const date = filters.createdAt.toISOString();
    query = query.eq("created_at", date);
  }
  if (filters.totalAmount)
    query = query.eq("total_amount", filters.totalAmount);
  if (filters.paymentMethod)
    query = query.eq("payment_method", filters.paymentMethod);

  if (filters.paymentStatus)
    query = query.eq("payment_status", filters.paymentStatus);
  if (filters.stripePaymentId)
    query = query.eq("stripe_payment_id", filters.stripePaymentId);

  if (filters.orderStatus)
    query = query.eq("order_status", filters.orderStatus);
  if (filters.pickupDate) {
    const date = filters.pickupDate.toISOString();
    query = query.eq("pickupDate", date);
  }
  if (filters.orderFulfilledAt) {
    const date = filters.orderFulfilledAt.toISOString();
    query = query.eq("order_fulfilled_at", date);
  }
  const sortBy = filters.sort ? filters.sort === "asc" : true;

  const from = (pageParam - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const {
    data: orders,
    error,
    count,
  } = await query.range(from, to).order("created_at", { ascending: sortBy });

  if (error) {
    console.log(`Failed to get orders data: ${error.message}`);
  }
  const totalItems = count || 0;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  const nextPageParam = pageParam < totalPages ? pageParam + 1 : null;

  return {
    items: orders || [],
    nextPageParam,
  };
}

export function revalidateOrdersCache(
  updatedOrder: Order,
  queryClient: ReturnType<typeof useQueryClient>,
  isToday = false,
) {
  // Get all queries currently in the cache

  const orderStatusToCheck = ["cancelled", "returned"];
  const paymentStatusToCheck = ["refunded", "disputed"];
  const cache = queryClient.getQueryCache();

  // Find all keys that start with "orders"
  const orderQueries = cache.findAll({ queryKey: ["orders"] });

  orderQueries.forEach((query) => {
    queryClient.setQueryData(query.queryKey, (oldData: any) => {
      if (!oldData || !oldData.pages || !updateOrder) return oldData;
      //  Check if the cache has the isToday property in order to update the related cache only and not all the cache that starts with the string "orders".
      const queryFilters = query.queryKey[1] as Record<any, any>;
      const isTodayCache = !!queryFilters.isToday;
      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => {
          const dataArr: any = page.data.map((order: any) =>
            order.id === updatedOrder.id ? { ...updatedOrder } : order,
          );
          return {
            ...page,
            data: isTodayCache
              ? dataArr.filter(
                  (item: any) =>
                    !paymentStatusToCheck.includes(item.payment_status) &&
                    !orderStatusToCheck.includes(item.order_status),
                )
              : dataArr,
          };
        }),
      };
    });
  });
}

export async function updateOrder() {}
