import { PAGE_SIZE } from "@lib/constants";
import {
  NotificationSchema,
  TicketHistory,
  TicketHistoryAction,
  TicketHistorySchemaStrict,
} from "@lib/types";
import { PostgrestError } from "@supabase/supabase-js";
import { createClient } from "@utils/supabase/server";

import { z } from "zod";
// :Promise<{ticketHistory:TicketHistory[] | null:error:}> error: PostgrestError | null

interface GetTicketProps {
  id: number;
  pageNumber: string;
  message?: string;
  isRead?: boolean;
  ticketId?: number;
  userId?: string;
}

// Assuming PAGE_SIZE is defined elsewhere

export async function getNotifications({
  id,
  pageNumber,
  message,
  isRead,
  ticketId,
  userId,
}: GetTicketProps): Promise<{
  notifications: Notification[] | null;
  count: number | null;
  error: PostgrestError | null;
}> {
  const supabase = await createClient();
  let query = supabase
    .from("notifications")
    // Use an alias if the constraint name is different from 'ticket_id'
    .select("*,ticket_id(*)", { count: "exact" });

  // 1. Direct Filters on 'ticket_history'
  if (id) query = query.eq("id", id);
  if (message) query = query.ilike("message", `%${message}%`);
  if (ticketId) query = query.eq("ticketId", ticketId);

  // 2. Nested Filters on the joined 'tickets' table (via ticket_id relationship)
  // Syntax: .eq('{relationship_name}.{column_name}', value)
  if (isRead) query = query.eq("isRead", isRead);

  if (userId) query = query.eq("userId", userId);

  // 4. Pagination
  if (pageNumber) {
    const page = Number(pageNumber);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);
  }

  const { data: notifications, count, error } = await query;
  return { notifications, count, error };
}

export async function createTicketHistory(
  data: z.infer<typeof NotificationSchema>
): Promise<TicketHistory[] | null> {
  const supabase = await createClient();
  const { data: createdNotification, error } = await supabase
    .from("notifications")
    .insert([data])
    .select();
  if (error) throw new Error(error.message);

  return createdNotification;
}

//! Ticket history shouldn't be editable.

// export async function editTicketHistory(
//   ticketToEdit: TicketHistory
// ): Promise<TicketHistory[] | null> {
//   const { data: ticketHistory, error } = await supabase
//     .from("ticketHistory")
//     .update({ other_column: "otherValue" })
//     .eq("id", ticketToEdit.id)
//     .select();

//   if (error) throw new Error(error.message);

//   return ticketHistory;
// }

export async function deleteTicketHistory(ids: number[]) {
  const supabase = await createClient();
  const { error } = await supabase.from("notifications").delete().in("id", ids);

  if (error) throw new Error(error.message);
}
