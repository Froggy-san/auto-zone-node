import { revalidateTicketStatuses } from "@lib/actions/ticket-status-actions";
import { CreateTicketStatus, TicketStatus } from "@lib/types";
import { PostgrestError } from "@supabase/supabase-js";
import supabase from "@utils/supabase";

export async function getTicketStatuses(): Promise<{
  ticketStatus: TicketStatus[] | null;
  error: PostgrestError | null;
}> {
  const { data: ticketStatus, error } = await supabase
    .from("ticketStatus")
    .select("*");

  return { ticketStatus, error };
}

export async function createTicketStatus(insert: CreateTicketStatus) {
  try {
    const { data, error } = await supabase
      .from("ticketStatus")
      .insert([insert])
      .select();

    if (error) throw new Error(error.message);
    await revalidateTicketStatuses();

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
    const { error } = await supabase
      .from("ticketStatus")
      .update(data)
      .eq("id", data.id);

    if (error) throw new Error(error.message);
    await revalidateTicketStatuses();

    return { error: "" };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteTicketStatusAction(id: number) {
  const { error } = await supabase.from("ticketStatus").delete().eq("id", id);

  if (error) return { error: error.message };

  await revalidateTicketStatuses();
  return { error: "" };
}
