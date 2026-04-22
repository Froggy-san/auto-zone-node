import { PAGE_SIZE } from "@lib/constants";
import {
  TicketHistory,
  TicketHistoryAction,
  TicketHistorySchemaStrict,
} from "@lib/types";
import { PostgrestError } from "@supabase/supabase-js";
import { createClient } from "@utils/supabase/server";
import { revalidateTag, unstable_cache } from "next/cache";

import { z } from "zod";
// :Promise<{ticketHistory:TicketHistory[] | null:error:}> error: PostgrestError | null

interface GetTicketProps {
  id: number;
  action?: z.infer<typeof TicketHistoryAction>;
  created_at?: string;
  clinetName?: string;
  clinetId?: string;
  admin_assigned_to?: string;
  ticketCategory_id?: number;
  ticketPriority_id?: number;
  ticketStatus_id?: number;
  ticket_id?: number;
  pageNumber: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// Assuming PAGE_SIZE is defined elsewhere

export async function revlidateTicketHistory() {
  revalidateTag("ticketHistroy");
}
async function getTicketHisotry({
  id,
  created_at,
  pageNumber,
  action,
  admin_assigned_to,
  ticketCategory_id,
  ticketPriority_id,
  ticketStatus_id,
  ticket_id,
  clinetId,
  clinetName,
  dateFrom,
  dateTo,
}: GetTicketProps): Promise<{
  ticketHistory: TicketHistory[] | null;
  count: number | null;
  error: PostgrestError | null;
}> {
  const supabase = await createClient();
  // Note: The table name is likely 'ticket_history', not 'tickeHistory'
  let query = supabase
    .from("ticket_history")
    // Use an alias if the constraint name is different from 'ticket_id'
    .select(
      "*,ticket_id(id, ticketCategory_id, ticketPriority_id, ticketStatus_id, admin_assigned_to, client_id(*))",
      { count: "exact" }
    );

  // 1. Direct Filters on 'ticket_history'
  if (id) query = query.eq("id", id);
  if (action) query = query.ilike("action", `%${action}%`);
  if (ticket_id) query = query.eq("ticket_id", ticket_id);

  // 2. Nested Filters on the joined 'tickets' table (via ticket_id relationship)
  // Syntax: .eq('{relationship_name}.{column_name}', value)
  if (ticketCategory_id)
    query = query.eq("ticket_id.ticketCategory_id", ticketCategory_id);

  if (ticketPriority_id)
    query = query.eq("ticket_id.ticketPriority_id", ticketPriority_id);

  if (ticketStatus_id)
    query = query.eq("ticket_id.ticketStatus_id", ticketStatus_id);

  if (admin_assigned_to)
    query = query.eq("ticket_id.admin_assigned_to", admin_assigned_to);

  if (admin_assigned_to) query = query.eq("ticket_id.", admin_assigned_to);

  // Filter by Client ID (Exact Match)
  if (clinetId) {
    // Relationship 1: ticket_id (from history to tickets)
    // Relationship 2: client_id (from tickets to clients)
    // Column: id (in the clients table)
    query = query.eq("ticket_id.client_id.id", clinetId);
  }

  // Filter by Client Name (Partial Match/Case Insensitive)
  if (clinetName) {
    // We use .ilike() for case-insensitive partial matching on the name
    query = query.ilike("ticket_id.client_id.name", `%${clinetName}%`);
  }
  // 3. Date Filters
  if (dateFrom) {
    // Use the ISO string for consistent comparison
    query = query.gte("created_at", dateFrom.toISOString());
  }
  if (dateTo) {
    // Ensure the date includes the end of the day
    const endOfDay = new Date(dateTo);
    endOfDay.setHours(23, 59, 59, 999);
    query = query.lte("created_at", endOfDay.toISOString());
  }

  // 4. Pagination
  if (pageNumber) {
    const page = Number(pageNumber);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);
  }

  const { data: ticketHistory, count, error } = await query;
  return { ticketHistory, count, error };
}

export const getTicketHisotryAction = unstable_cache(
  getTicketHisotry,
  ["ticketHistroy"],
  {
    tags: ["ticketHistroy"],
  }
);

export async function createTicketHistory(
  data: z.infer<typeof TicketHistorySchemaStrict>
): Promise<TicketHistory[] | null> {
  const supabase = await createClient();
  const { data: createdHistory, error } = await supabase
    .from("ticketHistory")
    .insert([data])
    .select();
  if (error) throw new Error(error.message);
  revalidateTag("ticketHistroy");
  return createdHistory;
}

//! Ticket history shouldn't be editable.

// export async function editTicketHistory(
//   ticketToEdit: TicketHistory
// ): Promise<TicketHistory[] | null> {
//   const supabase = await createClient();
//   const { data: ticketHistory, error } = await supabase
//     .from("ticketHistory")
//     .update({ other_column: "otherValue" })
//     .eq("id", ticketToEdit.id)
//     .select();

//   if (error) throw new Error(error.message);
//   revalidateTag("ticketHistroy")
//   return ticketHistory;
// }

export async function deleteTicketHistory(ids: number[]) {
  const supabase = await createClient();
  const { error } = await supabase.from("ticketHistory").delete().in("id", ids);

  if (error) throw new Error(error.message);
  revalidateTag("ticketHistroy");
}
