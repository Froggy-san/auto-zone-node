"use server";

import { CreateTicketStatus, TicketStatus } from "@lib/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@utils/supabase/server";

import { revalidateTag, unstable_cache } from "next/cache";

export async function revalidateTicketStatuses() {
  revalidateTag("ticketStatus");
}

async function getStatuses(supabase: SupabaseClient): Promise<{
  ticketStatus: TicketStatus[] | null;
  error: any;
}> {
  const { data: ticketStatus, error } = await supabase
    .from("ticketStatus")
    .select("*");

  return { ticketStatus, error };
}

export const getTicketStatusesAction = unstable_cache(
  getStatuses,
  ["ticketStatus"],
  {
    tags: ["ticketStatus"],
  }
);

export async function createTicketStatusAction(insert: CreateTicketStatus) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("ticketStatus")
      .insert([insert])
      .select();

    if (error) throw new Error(error.message);
    revalidateTag("ticketStatus");

    return { data, error: "" };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

interface EditProps extends CreateTicketStatus {
  id: number;
}

export async function editTicketStatusAction(data: EditProps) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("ticketStatus")
      .update(data)
      .eq("id", data.id);

    if (error) throw new Error(error.message);
    revalidateTag("ticketStatus");

    return { error: "" };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteTicketStatusAction(id: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("ticketStatus").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidateTag("ticketStatus");
  return { error: "" };
}
