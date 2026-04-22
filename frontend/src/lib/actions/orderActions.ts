"use server";
import {
  Order,
  OrderSchema,
  OrderStatusSchema,
  PaymentMethod,
  PaymentStatusSchema,
} from "@lib/types";
import { createClient } from "@utils/supabase/server";
import { z } from "zod";
import { getCurrentClientAction } from "./clientActions";
import Stripe from "stripe";
import { adjustProductsStockAction } from "./productsActions";
import { PAGE_SIZE } from "@lib/constants";
export interface GetOrdersProps {
  id?: number;
  pageNumber?: number;
  searchTerm?: string;
  clientId?: number;
  paymentStatus?: z.infer<typeof PaymentStatusSchema>;
  orderStatus?: z.infer<typeof OrderStatusSchema>;
  paymentMethod?: string;
  stripePaymentId?: string;
  createdAt?: { from: string; to: string };
  totalAmount?: number;
  pickupDate?: { from: string; to: string };
  orderFulfilledAt?: string;
  sort?: "asc" | "desc" | string;
  isToday?: boolean;
}
export async function getOrdersAction({
  pageNumber,
  clientId,
  searchTerm,
  paymentStatus,
  orderStatus,
  paymentMethod,
  stripePaymentId,
  totalAmount,
  createdAt,
  pickupDate,
  orderFulfilledAt,
  sort,
  isToday = false,
}: GetOrdersProps): Promise<{
  data: Order[] | null;

  error: string | null;
}> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("orders")
      .select("*,client:client_id(*,phoneNumbers:phones(*))")
      .order("created_at", { ascending: sort === "asc" });

    // Apply Filters conditionally
    if (clientId) query = query.eq("client_id", clientId);
    if (paymentStatus) query = query.eq("payment_status", paymentStatus);
    if (orderStatus) query = query.eq("order_status", orderStatus);
    if (paymentMethod) query = query.eq("payment_method", paymentMethod);
    if (stripePaymentId) query = query.eq("stripe_payment_id", stripePaymentId);
    if (totalAmount) query = query.eq("total_amount", totalAmount);
    if (createdAt?.from) {
      // Sets to 00:00 local time
      const d = new Date(createdAt.from);
      d.setHours(0, 0, 0, 0);

      // Format to YYYY-MM-DD HH:mm:ss for Postgres
      const formatted =
        d.toLocaleDateString("en-CA") + " " + d.toLocaleTimeString("en-GB");
      query = query.gte("created_at", formatted);
    }

    if (createdAt?.to) {
      const d = new Date(createdAt.from);
      d.setHours(23, 59, 59, 999);

      // Format to YYYY-MM-DD HH:mm:ss for Postgres
      const formatted =
        d.toLocaleDateString("en-CA") + " " + d.toLocaleTimeString("en-GB");
      query = query.lte("created_at", formatted);
    }

    if (pickupDate?.from) {
      const d = new Date(pickupDate.from);
      d.setHours(0, 0, 0, 0);

      const formatted =
        d.toLocaleDateString("en-CA") + " " + d.toLocaleTimeString("en-GB");
      query = query.gte("pickupDate", formatted);
    }

    if (pickupDate?.to) {
      const d = new Date(pickupDate.to);
      d.setHours(23, 59, 59, 999);

      const formatted =
        d.toLocaleDateString("en-CA") + " " + d.toLocaleTimeString("en-GB");
      query = query.lte("pickupDate", formatted);
    }

    if (searchTerm)
      query = query.or(
        `customer_details->>name.ilike.%${searchTerm}%,customer_details->>email.ilike.%${searchTerm}%,customer_details->>phone.ilike.%${searchTerm}%,payment_status.like.${searchTerm},order_status.ilike.%${searchTerm}%,stripe_payment_id.ilike.%${searchTerm}%`,
      );
    if (orderFulfilledAt)
      query = query.eq("order_fulfilled_at", orderFulfilledAt);

    // For getting the current day activities.
    if (isToday) {
      // Exclude multiple order statuses in one line
      query = query.not("order_status", "in", '("cancelled","returned")');

      // Exclude multiple payment statuses
      query = query.not("payment_status", "in", '("refunded","disputed")');
    }

    if (pageNumber) {
      const from = pageNumber * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;
    if (error) {
      // Instead of throwing, we return an object React Query can check
      throw new Error(error.message);
    }

    return {
      data,
      error: null,
    };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export type GetInfiniteOrderAction = Omit<GetOrdersProps, "pageNumber"> & {
  pageParam?: number;
};

export async function getInfiniteOrdersAction({
  pageParam = 0,
  clientId,
  searchTerm,
  paymentStatus,
  orderStatus,
  paymentMethod,
  stripePaymentId,
  totalAmount,
  createdAt,
  pickupDate,
  orderFulfilledAt,
  sort,
  isToday = false,
}: GetInfiniteOrderAction): Promise<{
  data: Order[];
  nextCursor: number | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const from = pageParam * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    console.log(sort, "SORRT");
    let query = supabase
      .from("orders")
      .select("*,client:client_id(*,phoneNumbers:phones(*))")
      .order("created_at", { ascending: sort === "asc" })
      .range(from, to);

    // Apply Filters conditionally
    if (clientId) query = query.eq("client_id", clientId);
    if (paymentStatus) query = query.eq("payment_status", paymentStatus);
    if (orderStatus) query = query.eq("order_status", orderStatus);
    if (paymentMethod) query = query.eq("payment_method", paymentMethod);
    if (stripePaymentId) query = query.eq("stripe_payment_id", stripePaymentId);
    if (totalAmount) query = query.eq("total_amount", totalAmount);
    if (createdAt?.from) {
      // Sets to 00:00 local time
      const d = new Date(createdAt.from);
      d.setHours(0, 0, 0, 0);

      // Format to YYYY-MM-DD HH:mm:ss for Postgres
      const formatted =
        d.toLocaleDateString("en-CA") + " " + d.toLocaleTimeString("en-GB");
      query = query.gte("created_at", formatted);
    }

    if (createdAt?.to) {
      const d = new Date(createdAt.from);
      d.setHours(23, 59, 59, 999);

      // Format to YYYY-MM-DD HH:mm:ss for Postgres
      const formatted =
        d.toLocaleDateString("en-CA") + " " + d.toLocaleTimeString("en-GB");
      query = query.lte("created_at", formatted);
    }

    if (pickupDate?.from) {
      const d = new Date(pickupDate.from);
      d.setHours(0, 0, 0, 0);

      const formatted =
        d.toLocaleDateString("en-CA") + " " + d.toLocaleTimeString("en-GB");
      query = query.gte("pickupDate", formatted);
    }

    if (pickupDate?.to) {
      const d = new Date(pickupDate.to);
      d.setHours(23, 59, 59, 999);

      const formatted =
        d.toLocaleDateString("en-CA") + " " + d.toLocaleTimeString("en-GB");
      query = query.lte("pickupDate", formatted);
    }

    if (searchTerm)
      query = query.or(
        `customer_details->>name.ilike.%${searchTerm}%,customer_details->>email.ilike.%${searchTerm}%,customer_details->>phone.ilike.%${searchTerm}%,payment_status.like.${searchTerm},order_status.ilike.%${searchTerm}%,stripe_payment_id.ilike.%${searchTerm}%`,
      );
    if (orderFulfilledAt)
      query = query.eq("order_fulfilled_at", orderFulfilledAt);

    // For getting the current day activities.
    if (isToday) {
      // Exclude multiple order statuses in one line
      query = query.not("order_status", "in", '("cancelled","returned")');

      // Exclude multiple payment statuses
      query = query.not("payment_status", "in", '("refunded","disputed")');
    }
    const { data, error } = await query;
    if (error) {
      // Instead of throwing, we return an object React Query can check
      throw new Error(error.message);
    }

    return {
      data: data || [],
      nextCursor: data.length === PAGE_SIZE ? pageParam + 1 : null,
      error: null,
    };
  } catch (error: any) {
    return { data: [], nextCursor: null, error: error.message };
  }
}

export async function getOrderByIdAction(
  id: number,
): Promise<{ data: Order | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: currentClient, error } = await getCurrentClientAction();

    if (error) throw new Error(error);

    const { data: orderById, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (orderError) throw new Error(orderError.message);
    if (!orderById) throw new Error(`No order found with that id #${id}`);

    const isClientOrder =
      orderById.client_id === currentClient?.id ||
      currentClient?.role === "admin";

    if (!isClientOrder) throw new Error(`Unauthorized action`);

    return { data: orderById, error: null };
  } catch (error: any) {
    console.log(error.message);
    return { data: null, error: error.message };
  }
}

export async function createOrderAction(
  data: z.infer<typeof OrderSchema>,
): Promise<{ data: Order | null; error: string | null }> {
  try {
    const supabase = await createClient();
    // Validate the data on the server!
    const validatedData = OrderSchema.parse(data);
    const { data: createdOrder, error } = await supabase
      .from("orders")
      .insert(validatedData)
      .select()
      .single();

    if (error) {
      console.log(`Failed to create order:${error.message}`);
      throw Error(error.message);
    }
    if (data.payment_method === "cod" && data.items) {
      await adjustProductsStockAction("decrement", data.items.items);
    }
    return { data: createdOrder, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

type UpdateProps = {
  id: number;
  client_id?: number;
  customer_details?: Record<string, any>;
  items?: Record<string, any>;
  total_amount?: number;
  payment_method?: z.infer<typeof PaymentMethod>;
  payment_status?: z.infer<typeof PaymentStatusSchema>;
  order_status?: z.infer<typeof OrderStatusSchema>;
  stripe_payment_id?: string;
  metadata?: Record<string, any>;
  pickupDate?: string;
  order_fulfilled_at?: string;
};

export async function updateOrderAction(
  data: UpdateProps,
): Promise<{ data: Order | null; error: string | null }> {
  try {
    const supabase = await createClient();
    // const validatedData = UpdateOrderActionProps.parse(data);
    const { data: updatedOrder, error } = await supabase
      .from("orders")
      .update(data)
      .eq("id", data.id)
      .select("*,client:client_id(*)")
      .single();

    if (error) {
      console.log(`Failed to create order:${error.message}`);
      throw Error(error.message);
    }
    return { data: updatedOrder, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function updateOrderOrderStatusAction(
  orderId: number,
  orderStatus: z.infer<typeof OrderStatusSchema>,
): Promise<{ data: Order | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: updatedOrder, error } = await supabase
      .from("orders")
      .update({ order_status: orderStatus })
      .eq("id", orderId)
      .select("*,client:client_id(*)")
      .single();

    if (error) {
      console.log(`Failed to update order status:${error.message}`);
      throw Error(error.message);
    }
    return { data: updatedOrder, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

// Helper to keep the code clean
export async function updateOrderStatusAction(
  pi_id: string,
  payment_status: z.infer<typeof PaymentStatusSchema>,
) {
  const decrementKeyWords = ["paid", "pending_arrival"];
  const incrementKeyWords = ["canceled,refunded,disputed"];
  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id,items")
    .eq("stripe_payment_id", pi_id)
    .single();

  if (order) {
    await supabase.from("orders").update({ payment_status }).eq("id", order.id);
    if (order?.items?.items) {
      if (decrementKeyWords.includes(payment_status)) {
        await adjustProductsStockAction("decrement", order.items.items);
      } else if (incrementKeyWords.includes(payment_status)) {
        await adjustProductsStockAction("increment", order.items.items);
      }
    }
  }
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function refundOrderAction(
  orderId: number,
): Promise<{ success: boolean; data: Order | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: currentClient, error } = await getCurrentClientAction();
    if (error) throw new Error(error);

    // 1. Get the order from Supabase to find the Stripe Payment ID
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*,client:client_id(*)")
      .eq("id", orderId)
      .single();

    if (fetchError) throw new Error(fetchError.message);
    if (!order)
      throw new Error(
        `Something went wrong while refunding the order. please retry again later.`,
      );

    // 1. Authorize action

    if (!currentClient)
      throw new Error(
        `We weren't able to verify your ownership of the order please make sure you are logged in before attempting a refund`,
      );

    if (order.client_id !== currentClient.id)
      throw new Error(`Unauthroized action.`);

    if (
      (order.payment_status === "refunded" ||
        order.payment_status === "unpaid") &&
      order.order_status === "cancelled"
    ) {
      throw new Error(`Order already ${order.payment_status}.`);
    }

    const orderStatusToCheck = ["completed", "partially_completed"];

    let retunredData: Order | null = null;
    const newPaymentStatus =
      order.payment_status === "paid" ? "refunded" : "unpaid";
    const newOrderStatus = orderStatusToCheck.includes(order.order_status)
      ? "returned"
      : "cancelled";

    const metadata = order.metadata;

    // Adjust the meta data based on one kind of operation happend
    if (newPaymentStatus === "refunded") {
      if (newOrderStatus === "returned") {
        metadata.refunded_and_returned_at = new Date().toISOString();
        metadata.refunded_and_returned_via =
          order.payment_method === "card"
            ? "stripe_dashboard"
            : order.payment_method;
      } else {
        // The order was not paid for there for the user cancled the order
        metadata.refunded_at = new Date().toISOString();
        metadata.refunded_via =
          order.payment_method === "card"
            ? "stripe_dashboard"
            : order.payment_method;
      }
    } else {
      metadata.cancelled_at = new Date().toISOString();
      metadata.cancelled_via =
        order.payment_method === "card"
          ? "stripe_dashboard"
          : order.payment_method;
    }
    // Card refund.
    if (order.payment_method === "card") {
      if (!order?.stripe_payment_id)
        throw new Error("No payment record found for this order.");

      // 2. Trigger the refund in Stripe
      const refund = await stripe.refunds.create({
        payment_intent: order.stripe_payment_id,
      });

      if (!refund || refund.status === "failed") {
        throw new Error(refund.failure_reason || "Refund failed in Stripe.");
      }

      metadata.refund_id = refund.id;
      // Here we are returning an object right after creating a successful refund request form stripe in order to update the cache inside react query infinite scroll order list becasue the rest of the logic i handled through a webhook.

      retunredData = {
        ...order,
        order_fulfilled_at: new Date().toISOString(),
        payment_status: newPaymentStatus,
        order_status: newOrderStatus,
        metadata,
      };
    } else {
      // Handle refunds for other methods of payment.

      const { data: updatedOrder, error: updateError } = await supabase
        .from("orders")
        .update({
          order_fulfilled_at: new Date().toISOString(),
          payment_status: newPaymentStatus,
          order_status: newOrderStatus,
          metadata,
        })
        .eq("id", orderId)
        .select("*,client:client_id(*)")
        .single();

      if (updateError) throw new Error(updateError.message);
      if (order.items) {
        const { error } = await adjustProductsStockAction(
          "increment",
          order.items.items,
        );
        if (error) throw new Error(error);
      }
      retunredData = updatedOrder;
    }

    return { success: true, data: retunredData, error: null };
  } catch (error: any) {
    return { success: false, data: null, error: error.message };
  }
}

export interface GetOrdersProps {
  id?: number;
  paymentStatus?: z.infer<typeof PaymentStatusSchema>;
  orderStatus?: z.infer<typeof OrderStatusSchema>;
  paymentMethod?: string;
  stripePaymentId?: string;

  dateFrom?: string;
  dateTo?: string;
  totalAmount?: number;
  orderFulfilledAt?: string;
  sort?: "asc" | "desc" | string;
  isToday?: boolean;
}
export async function getOrdersStatsAction({
  paymentStatus,
  orderStatus,
  paymentMethod,
  stripePaymentId,
  totalAmount,
  dateFrom,
  dateTo,
  orderFulfilledAt,
  sort,
  isToday = false,
}: GetOrdersProps): Promise<{
  data: Order[] | null;

  error: string | null;
}> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: sort === "asc" });

    // Apply Filters conditionally

    if (paymentStatus) query = query.eq("payment_status", paymentStatus);
    if (orderStatus) query = query.eq("order_status", orderStatus);
    if (paymentMethod) query = query.eq("payment_method", paymentMethod);
    if (stripePaymentId) query = query.eq("stripe_payment_id", stripePaymentId);
    if (totalAmount) query = query.eq("total_amount", totalAmount);
    if (dateFrom) {
      // Sets to 00:00 local time
      const d = new Date(dateFrom);
      d.setHours(0, 0, 0, 0);

      // Format to YYYY-MM-DD HH:mm:ss for Postgres
      const formatted =
        d.toLocaleDateString("en-CA") + " " + d.toLocaleTimeString("en-GB");
      query = query.gte("created_at", formatted);
    }

    if (dateTo) {
      const d = new Date(dateTo);
      d.setHours(23, 59, 59, 999);

      // Format to YYYY-MM-DD HH:mm:ss for Postgres
      const formatted =
        d.toLocaleDateString("en-CA") + " " + d.toLocaleTimeString("en-GB");
      query = query.lte("created_at", formatted);
    }

    if (orderFulfilledAt)
      query = query.eq("order_fulfilled_at", orderFulfilledAt);

    // For getting the current day activities.
    if (isToday) {
      // Exclude multiple order statuses in one line
      query = query.not("order_status", "in", '("cancelled","returned")');

      // Exclude multiple payment statuses
      query = query.not("payment_status", "in", '("refunded","disputed")');
    }

    const { data, error } = await query;
    if (error) {
      // Instead of throwing, we return an object React Query can check
      throw new Error(error.message);
    }

    return {
      data,
      error: null,
    };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}
