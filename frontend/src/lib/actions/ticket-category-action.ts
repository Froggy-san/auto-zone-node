"use server";

import { PAGE_SIZE } from "@lib/constants";
import { CreateTicketStatus, TicketCategory, TicketStatus } from "@lib/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@utils/supabase/server";

import { revalidateTag, unstable_cache } from "next/cache";

export async function revalidateTicketCategory() {
  revalidateTag("ticketCategory");
}
interface Params {
  pageNumber: string;
}
async function getTicketCategories(supabase: SupabaseClient): Promise<{
  ticketCategories: TicketCategory[] | null;

  error: any;
}> {
  const {
    data: ticketCategories,

    error,
  } = await supabase
    .from("ticketCategories")
    .select("*")
    .order("id", { ascending: true });

  return { ticketCategories, error };
}

export const getTicketCategoriesAction = unstable_cache(
  getTicketCategories,
  ["ticketCategories"],
  {
    tags: ["ticketCategories"],
  }
);

export async function createTicketCategoryAction(insert: { name: string }) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("ticketCategories")
      .insert([insert])
      .select();

    if (error) throw new Error(error.message);
    revalidateTag("ticketCategories");

    return { data, error: "" };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function editTicketCategoryAction(data: {
  id: number;
  name: string;
}) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("ticketCategories")
      .update(data)
      .eq("id", data.id);

    if (error) throw new Error(error.message);
    revalidateTag("ticketCategories");

    return { error: "" };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteTicketCategoryAction(id: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("ticketCategories")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidateTag("ticketCategories");
  return { error: "" };
}
