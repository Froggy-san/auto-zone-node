import { PAGE_SIZE } from "@lib/constants";
import {
  Ticket,
  TicketHistory,
  TicketHistoryAction,
  TicketHistorySchemaStrict,
} from "@lib/types";
import { PostgrestError } from "@supabase/supabase-js";
import supabase from "@utils/supabase";
import { filter } from "lodash";
import { z } from "zod";
// :Promise<{ticketHistory:TicketHistory[] | null:error:}> error: PostgrestError | null

interface GetTicketProps {
  id?: number | undefined;
  action?: z.infer<typeof TicketHistoryAction>;
  created_at?: string;
  clientName?: string;
  clientId?: number;
  admin_assigned_to?: string;
  ticketCategory_id?: number;
  ticketPriority_id?: number;
  ticketStatus_id?: number;
  ticketId?: number;
  dateFrom?: Date;
  dateTo?: Date;
  sort?: "asc" | "desc" | string;
  searchterm?: {
    term: string;
    type:
      | "default"
      | "actor_id"
      | "ticket_id.client_id"
      | "id"
      | "ticket_id"
      | "actor_id"
      | "admin";
  };
}

// Assuming PAGE_SIZE is defined elsewhere

export async function getTicketHistory({
  pageParam = 1,
  queryKey,
}: {
  pageParam?: number;
  queryKey: [string, GetTicketProps];
}): Promise<{
  items: TicketHistory[];
  nextPageParam: number | null;
  count: number | null;
}> {
  // Note: The table name is likely 'ticket_history', not 'tickeHistory'
  let query = supabase
    .from("ticketHistory")
    // Use an alias if the constraint name is different from 'ticket_id'
    .select(
      "*,actor:actor_id!inner(*),ticket:ticket_id!inner(id, ticketCategory_id(*), ticketPriority_id(*), ticketStatus_id, admin_assigned_to,client:client_id!inner(*))",
      { count: "exact" }
    );

  const [_, filters] = queryKey;
  // 1. Direct Filters on 'ticket_history'
  if (filters.searchterm && filters.searchterm.term.length > 0) {
    // Use dot notation to filter the inner-joined tables
    const term = filters.searchterm.term;
    if (
      filters.searchterm.type === "ticket_id.client_id" ||
      filters.searchterm.type === "actor_id"
    ) {
      query = query.or(`name.ilike.%${term}%,email.ilike.%${term}%`, {
        foreignTable: filters.searchterm.type,
      });
    } else
      query = query.or(
        `action.ilike.%${term}%,details->>reason.ilike.%${term}%,details->>message_content.ilike.%${term}%,details->>message_content.ilike.%${term}%,details->>old_message_content.ilike.%${term}%,details->>new_status.ilike.%${term}%,details->>old_status.ilike.%${term}%`
      );
  }
  if (filters.id) query = query.eq("id", filters.id);
  if (filters.action) query = query.ilike("action", `%${filters.action}%`);
  if (filters.ticketId) query = query.eq("ticket_id", filters.ticketId);

  // 2. Nested Filters on the joined 'tickets' table (via ticket_id relationship)
  // Syntax: .eq('{relationship_name}.{column_name}', value)
  if (filters.ticketCategory_id)
    query = query.eq("ticket_id.ticketCategory_id", filters.ticketCategory_id);

  if (filters.ticketPriority_id)
    query = query.eq("ticket_id.ticketPriority_id", filters.ticketPriority_id);

  if (filters.ticketStatus_id)
    query = query.eq("ticket_id.ticketStatus_id", filters.ticketStatus_id);

  if (filters.admin_assigned_to)
    query = query.eq("ticket_id.admin_assigned_to", filters.admin_assigned_to);

  if (filters.admin_assigned_to)
    query = query.eq("ticket_id.", filters.admin_assigned_to);

  // Filter by Client ID (Exact Match)
  if (filters.clientId) {
    // Relationship 1: ticket_id (from history to tickets)
    // Relationship 2: client_id (from tickets to clients)
    // Column: id (in the clients table)
    query = query.eq("ticket_id.client_id.id", filters.clientId);
  }

  // Filter by Client Name (Partial Match/Case Insensitive)
  if (filters.clientName) {
    // We use .ilike() for case-insensitive partial matching on the name
    query = query.ilike("ticket_id.client_id.name", `%${filters.clientName}%`);
  }
  // 3. Date Filters
  if (filters.dateFrom) {
    // Use the ISO string for consistent comparison
    query = query.gte("created_at", filters.dateFrom.toISOString());
  }
  if (filters.dateTo) {
    // Ensure the date includes the end of the day
    const endOfDay = new Date(filters.dateTo);
    endOfDay.setHours(23, 59, 59, 999);
    query = query.lte("created_at", endOfDay.toISOString());
  }

  // 4. Pagination

  const page = Number(pageParam);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const sortBy = filters.sort ? filters.sort === "asc" : true;

  query = query.range(from, to);

  const {
    data: ticketHistory,
    count,
    error,
  } = await query
    .order("created_at", { ascending: sortBy })
    .order("id", { ascending: sortBy }); // Secondary sort for stable order;
  if (error) {
    // throw the error so useInfiniteQuery can catch it
    throw new Error(error.message);
  }

  // Calculate next page logic
  const totalItems = count || 0;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  // If the current page is less than the total pages, the next parameter is current + 1
  const nextPageParam = page < totalPages ? page + 1 : null;

  // RETURN THE REQUIRED STRUCTURE
  return {
    items: ticketHistory || [], // Ensure it's an array, not null
    count,
    nextPageParam: nextPageParam,
  };
}

export async function createTicketHistory(
  data: z.infer<typeof TicketHistorySchemaStrict>
): Promise<TicketHistory[] | null> {
  const { data: createdHistory, error } = await supabase
    .from("ticketHistory")
    .insert([data])
    .select();
  if (error) throw new Error(error.message);

  return createdHistory;
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
  const { error } = await supabase.from("ticketHistory").delete().in("id", ids);

  if (error) throw new Error(error.message);
}
