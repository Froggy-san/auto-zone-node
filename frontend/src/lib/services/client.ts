import { PAGE_SIZE } from "@lib/constants";
import { Client } from "@lib/types";
import { PostgrestError } from "@supabase/supabase-js";
import supabase from "@utils/supabase";

interface GetInfiniteClientsProps {
  name?: string;
}

export async function getInfiniteClients({
  pageParam,
  queryKey,
}: {
  pageParam?: number;
  queryKey: [string, GetInfiniteClientsProps];
}): Promise<{ clients: Client[]; nextPageParam: number | null }> {
  const [_, { name = "" }] = queryKey;

  let query = supabase
    .from("clients")
    .select("*", { count: "exact" })
    .order("id", { ascending: true });

  if (name && name.length > 0) {
    query = query.or(`name.ilike.%${name}%,email.ilike.%${name}%`);
  }
  if (pageParam && pageParam > 0) {
    const from = (pageParam - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);
  }

  const { data: clients, error, count } = await query;
  const maxPages = count ? Math.ceil(count / PAGE_SIZE) : 0;
  const nextPageParam =
    pageParam && pageParam < maxPages ? pageParam + 1 : null;

  if (error) throw new Error(error.message);
  return { clients: clients || [], nextPageParam };
}

type GetBy = "id" | "user_id";

export async function getClinetById({
  id,
  getBy = "id",
}: {
  id?: number | string;
  getBy?: GetBy;
}): Promise<{ clientById: Client | null; error: PostgrestError | null }> {
  const { data: clientById, error } = await supabase
    .from("clients")
    .select("*,phoneNumbers:phones(number)")
    .eq(getBy, id)
    .single();

  return { clientById, error };
}
