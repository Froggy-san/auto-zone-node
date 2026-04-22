"use server";

import { CreateTicketStatus, TicketCategory, TicketStatus } from "@lib/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@utils/supabase/server";

import { revalidateTag, unstable_cache } from "next/cache";

export async function revalidateTicketCategory() {
  revalidateTag("ticketPriorities");
}

async function getTicketPriorities(supabase: SupabaseClient): Promise<{
  ticketPriorities: TicketCategory[] | null;
  error: any;
}> {
  const { data: ticketPriorities, error } = await supabase
    .from("ticketPriorities")
    .select("*")
    .order("id", { ascending: true });

  return { ticketPriorities, error };
}

export const getTickettPrioritiesAction = unstable_cache(
  getTicketPriorities,
  ["ticketPriorities"],
  {
    tags: ["ticketPriorities"],
  }
);

export async function createTicketPriorityAction(insert: { name: string }) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("ticketPriorities")
      .insert([insert])
      .select();

    if (error) throw new Error(error.message);
    revalidateTag("ticketPriorities");

    return { data, error: "" };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function editTicketPriorityAction(data: {
  id: number;
  name: string;
}) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("ticketPriorities")
      .update(data)
      .eq("id", data.id);

    if (error) throw new Error(error.message);
    revalidateTag("ticketPriorities");

    return { error: "" };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteTicketCategoryAction(id: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("ticketPriorities")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidateTag("ticketPriorities");
  return { error: "" };
}
