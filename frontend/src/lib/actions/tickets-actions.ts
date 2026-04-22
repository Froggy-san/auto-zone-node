"use server";

import { PAGE_SIZE } from "@lib/constants";
import {
  CreateTicket,
  CreateTicketProps,
  CreateTicketSchema,
  CreateTicketStatus,
  Ticket,
  TicketStatus,
} from "@lib/types";
import { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@utils/supabase/server";

import { revalidateTag, unstable_cache } from "next/cache";
import { z } from "zod";

export async function revalidateTickets() {
  revalidateTag("tickets");
}

interface GetTickets {
  pageNumber: string;
  sort?: string;
  name?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  clientId?: number;
}

async function getTickets(
  {
    pageNumber,
    sort = "asc",
    name,
    dateFrom,
    dateTo,
    status,
    clientId,
  }: GetTickets,
  supabase: SupabaseClient
): Promise<{
  tickets: Ticket[] | null;
  count: number | null;
  error: PostgrestError | null;
}> {
  const from = (Number(pageNumber) - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const sortBy = sort ? sort === "asc" : false;

  let query = supabase
    .from("tickets")
    .select(
      "*,admin_assigned_to(*),client:client_id!inner(*),ticketStatus_id(*),ticketPriority_id(*),ticketCategory_id(*)",
      { count: "exact" }
    );

  if (name) query = query.ilike("client_id.name", `%${name}%`);
  if (status) query = query.eq("ticketStatus_id", status);
  if (dateFrom) query = query.gte("created_at", dateFrom);
  if (dateTo) query = query.lte("created_at", dateTo);
  if (clientId) query = query.eq("client_id", clientId);

  const {
    data: tickets,
    count,
    error,
  } = await query.order("id", { ascending: sortBy }).range(from, to);

  return { tickets, count, error };
}

export const getTicketsAction = unstable_cache(getTickets, ["tickets"], {
  tags: ["tickets"],
});
interface TicketLogData {
  ticket_id: number;
  actor_id: number; // Assuming actor_id is a string/UUID based on previous discussion
  action: string;
  details: object;
  message_id?: number | null;
  created_at?: string; // We'll set this automatically
}
export async function logTicketActions(
  supabase: SupabaseClient,
  logs: TicketLogData[]
) {
  // Pre-process the logs to ensure created_at is set if missing
  // const logsWithTimestamp = logs.map(log => ({
  //   ...log,
  //   created_at: log.created_at || new Date().toISOString(),
  // }));

  // Perform a single bulk insert
  const { error } = await supabase.from("ticketHistory").insert(logs);

  if (error) {
    // IMPORTANT: Only log the critical error. Do not throw, as the main ticket update succeeded.
    console.error(
      "CRITICAL HISTORY ERROR: Failed to bulk log ticket history:",
      error
    );
    // You might integrate with a monitoring tool like Sentry here.
  }
}
export async function createTicketAction(
  insert: z.infer<typeof CreateTicketSchema>
) {
  try {
    const supabase = await createClient();
    const { data: createdTicket, error } = await supabase
      .from("tickets")
      .insert(insert)
      .select("*,ticketStatus_id(*)");

    if (error) {
      throw new Error(error.message);
    }
    revalidateTag("tickets");
    if (!createdTicket || createdTicket.length === 0)
      throw new Error("Could not create ticket");
    console.log("Created Ticket:", createdTicket[0]);
    console.log(createdTicket[0].ticketStatus_id, "AYYOO");
    await logTicketActions(supabase, [
      {
        ticket_id: createdTicket[0].id,
        actor_id: insert.client_id,
        action: "created",
        details: {
          ticket_id: createdTicket[0].id,
          reason: "New ticket created",
          ticket_subject: insert.subject,
          ticket_category: insert.ticketCategory_id,
          ticket_priority: insert.ticketPriority_id,
          ticket_status: createdTicket[0].ticketStatus_id,
          ticket_assigned_to: insert.admin_assigned_to,
          ticket_cotent: insert.description,
        },
      },
    ]);

    return { data: createdTicket, error: "" };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

interface EditProps {
  id: number;
  subject?: string;
  description?: string;
  client_id?: number;
  updated_at?: string;
  admin_assigned_to?: string | null;
  ticketStatus_id?: number;
  ticketPriority_id?: number;
  ticketCategory_id?: number;
}
export async function editTicketAction(data: EditProps) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("tickets")
      .update(data)
      .eq("id", data.id);

    if (error) throw new Error(error.message);
    revalidateTag("tickets");

    return { error: "" };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteTicketAction(id: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("tickets").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidateTag("tickets");
  return { error: "" };
}
