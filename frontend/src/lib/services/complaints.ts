// import { revalidateTickets } from "@lib/actions/tickets-actions";
// import {
//   Client,
//   ClientById,
//   CreateTicket,
//   TicektHistoryDetials,
//   Ticket,
//   TicketHistoryAction,
//   TicketStatus,
//   User,
// } from "@lib/types";
// import { createClient } from "@utils/supabase/client";
// import { getTicketStatuses } from "./ticket-statuses";
// import { z } from "zod";

// const supabase = createClient();

// export async function getTickets(userId?: string): Promise<{
//   tickets: Ticket[] | null;
//   error: any; // Use a more specific Supabase error type if available
//   count: number | null;
//   status: number;
//   statusText: string;
// }> {
//   let query = supabase
//     .from("tickets")
//     .select(
//       "*,ticketPriority_id(*),ticketPriority_id(*),ticketCategory_id(*)",
//       { count: "exact" }
//     );

//   if (userId) query = query.eq("user_id", userId);

//   const { data: tickets, error, status, statusText, count } = await query;

//   return { tickets, count, status, statusText, error };
// }

// interface CreateProps extends CreateTicket {
//   user_id: string;
//   updated_at: string;
//   admin_assigned_to: string;
// }

// export async function createTicket(data: CreateProps) {
//   const { error } = await supabase.from("tickets").insert([data]);

//   if (error) throw new Error(error.message);
// }

// type Reason =
//   | "Initial review complete; starting investigation."
//   | "Awaiting client's response"
//   | "Ticket has been successfully addressed"
//   | "Ticket has been closed"
//   | "Client responeded, and awaiting admin's response";

// interface EditProps {
//   id: number;
//   subject?: string;
//   description?: string;
//   client_id?: number;
//   updated_at?: string;
//   admin_assigned_to?: number | null;
//   ticketStatus_id?: number;
//   ticketPriority_id?: number;
//   ticketCategory_id?: number;
// }

// export async function editTicket({
//   newTicketData,
//   oldTicketData,
//   currentUser,
//   currentClient,
//   ticketStatuses,
//   messageId,
// }: {
//   newTicketData: EditProps;
//   oldTicketData: Ticket;
//   currentUser: User;
//   currentClient: Client;
//   ticketStatuses?: TicketStatus[];
//   messageId?: number;
// }) {
//   try {
//     let ticketStatusesData: TicketStatus[] = ticketStatuses || [];
//     if (!ticketStatuses) {
//       const { ticketStatus, error } = await getTicketStatuses();
//       if (error) throw new Error(error.message);
//       if (!ticketStatus)
//         throw new Error(
//           "Something went wrong while grabbing the ticket statueses data."
//         );
//       ticketStatusesData = ticketStatus;
//     }

//     const dateNow = new Date();
//     const userRole = currentUser.user_metadata?.role.toLowerCase() || "user";
//     const previousStatus = ticketStatusesData.find(
//       (status) => status.id === oldTicketData.ticketStatus_id.id
//     ) as TicketStatus;
//     const newStatus = ticketStatusesData.find(
//       (status) => status.id === newTicketData.ticketStatus_id
//     ) as TicketStatus;

//     let action: z.infer<typeof TicketHistoryAction> | null = null;
//     let detials: z.infer<typeof TicektHistoryDetials> | null = null;
//     const reason: Reason | null = null;
//     console.log(action, userRole, detials, reason);
//     let firstResponseTime = oldTicketData.firstResponseTime;
//     let resolveTime = oldTicketData.resolveTime;
//     // Check if the status has changed.
//     if (previousStatus.id !== newStatus.id) {
//       action = "Status Changed";

//       detials = {
//         old_status: { id: previousStatus.id, name: previousStatus.name },
//         new_status: { id: newStatus.id, name: newStatus.name },
//       };

//       // Check if the ticket wasn't assigned or got assigned to another admin.
//       if (userRole === "admin" && !oldTicketData.admin_assigned_to) {
//         action = "Admin Assigned";
//         detials = {
//           new_admin_id: newTicketData.admin_assigned_to,
//           old_admin_id: oldTicketData.admin_assigned_to,
//         };
//       } else if (
//         userRole === "admin" &&
//         newTicketData.admin_assigned_to !== oldTicketData.admin_assigned_to?.id
//       ) {
//         action = "Assigned To a different admin";
//         detials = {
//           new_admin_id: newTicketData.admin_assigned_to,
//           old_admin_id: oldTicketData.admin_assigned_to?.id,
//         };
//       }
//     }
//     if (
//       userRole === "admin" &&
//       newStatus.name.toLowerCase() === "solved" &&
//       !resolveTime
//     )
//       resolveTime = dateNow.toISOString();
//     if (userRole === "admin" && !firstResponseTime)
//       firstResponseTime = dateNow.toISOString();

//     if (messageId) {
//       action =
//         userRole === "admin" ? "Admin Message Added" : "Customer Message Added";
//       detials = {
//         message_id: messageId,
//       };
//     }
//     const { error } = await supabase
//       .from("tickets")
//       .update({ ...newTicketData, resolveTime, firstResponseTime })
//       .eq("id", newTicketData.id);

//     if (error) {
//       console.log(error.message);
//       throw new Error(error.message);
//     }
//     await revalidateTickets();

//     if (!action || !detials) return;
//     await logTicketAction(newTicketData.id, currentClient.id, action, detials);
//   } catch (error: any) {
//     throw new Error(error.message);
//   }
// }

// export async function deleteTicket(id: number) {
//   const { error } = await supabase.from("tickets").delete().eq("id", id);

//   if (error) throw new Error(error.message);
// }

// export async function logTicketAction(
//   ticket_id: number,
//   actor_id: number,
//   action: string,
//   details: object
// ) {
//   const { error } = await supabase.from("ticketHistory").insert({
//     ticket_id,
//     actor_id,
//     action,
//     details, // The JSONB object
//   });

//   if (error) {
//     // IMPORTANT: Log this error to your monitoring system, but usually
//     // don't throw it, as the main action (editTicket) already succeeded.
//     console.error("Failed to log ticket history:", error);
//     throw new Error(error.message);
//   }
// }
