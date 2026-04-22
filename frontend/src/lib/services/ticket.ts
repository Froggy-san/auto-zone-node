import { SUPABASE_URL } from "@lib/constants";
import {
  Attachment,
  Client,
  CreateAttachment,
  FileWithPreview,
  Message,
  MessageSchema,
  ClientById,
  CreateTicket,
  TicektHistoryDetials,
  Ticket,
  TicketHistoryAction,
  TicketStatus,
  User,
  TicketPriority,
  EditMessageProps,
} from "@lib/types";
import { PostgrestError } from "@supabase/supabase-js";
import supabase from "@utils/supabase";
import { z } from "zod";
import { deleteImageFromBucket } from "./helper-services";
import { revalidateTickets } from "@lib/actions/tickets-actions";
import { getTicketStatuses } from "./ticket-statuses";

export async function getTickets(userId?: string): Promise<{
  tickets: Ticket[] | null;
  error: PostgrestError | null;
  count: number | null;
  status: number;
  statusText: string;
}> {
  let query = supabase
    .from("tickets")
    .select(
      "*,ticketPriority_id(*),ticketPriority_id(*),ticketCategory_id(*)",
      { count: "exact" }
    );

  if (userId) query = query.eq("user_id", userId);

  const { data: tickets, error, status, statusText, count } = await query;

  return { tickets, count, status, statusText, error };
}

interface CreateProps extends CreateTicket {
  user_id: string;
  updated_at: string;
  admin_assigned_to: string;
}

export async function createTicket(data: CreateProps) {
  const { data: createdTicket, error } = await supabase
    .from("tickets")
    .insert(data)
    .select();

  if (error) throw new Error(error.message);
  if (!createdTicket || createdTicket.length === 0)
    throw new Error("Could not create ticket");
  console.log("Created Ticket:", createdTicket[0]);
  await logTicketActions([
    {
      ticket_id: createdTicket[0].id,
      actor_id: data.client_id,
      action: "created",
      details: {
        ticket_id: createdTicket[0].id,
        reason: "New ticket created",
        ticket_subject: data.subject,
        ticket_category: data.ticketCategory_id,
        ticket_priority: data.ticketPriority_id,
        ticket_status: data.ticketStatus_id,
        ticket_assigned_to: data.admin_assigned_to,
        ticket_cotent: data.description,
      },
    },
  ]);
  return createdTicket[0];
}

type Reason =
  | "Initial review complete; starting investigation."
  | "Message created by the admin"
  | "Message created by the customer"
  | "Admin assigned"
  | "Admin message added"
  | "Customer message added"
  | "Assigned To a different admin"
  | "Status has changed ben changed by the admin"
  | "Awaiting client's response"
  | "Ticket has been successfully addressed"
  | "Ticket has been closed"
  | "Client responeded, and awaiting admin's response";

interface EditProps {
  id: number;
  subject?: string;
  description?: string;
  client_id?: number;
  updated_at?: string;
  admin_assigned_to?: number | null;
  ticketStatus_id?: number;
  ticketPriority_id?: number;
  ticketCategory_id?: number;
}

// Define a type for a single history entry to be generated
interface LogEntry {
  action: z.infer<typeof TicketHistoryAction>;
  details: z.infer<typeof TicektHistoryDetials>;
}

type ActionType = z.infer<typeof TicketHistoryAction>;
// Assume the existing functions like getTicketStatuses, revalidateTickets, and types (EditProps, Ticket, User, TicketStatus, etc.) are available globally.
function generateHistoryLogs(
  oldTicket: Ticket,
  newTicket: EditProps,
  currentUser: User,
  ticketStatuses: TicketStatus[],
  TicketPriorities: TicketPriority[]
): LogEntry[] {
  const logs: LogEntry[] = [];
  const dateNow = new Date().toISOString();
  const userRole = currentUser.user_metadata?.role?.toLowerCase() || "user";

  const previousStatus = ticketStatuses.find(
    (status) => status.id === oldTicket.ticketStatus_id.id
  );
  const newStatus = ticketStatuses.find(
    (status) => status.id === newTicket.ticketStatus_id
  );

  // --- A. Status Change Detection ---
  if (previousStatus && newStatus && previousStatus.id !== newStatus.id) {
    let actionLabel: ActionType;
    const newStatusName = newStatus.name.toLowerCase();
    const oldStatusName = previousStatus.name.toLowerCase();
    switch (newStatusName) {
      case "solved":
        actionLabel = "solved";
        break;
      case "closed":
        actionLabel = "closed";
        break;
      // case "open":
      //   actionLabel = "reopened";
      //   break;
      default:
        // Use a generic label for transitions like 'In Progress' or 'Awaiting Reply'
        actionLabel =
          oldStatusName === "closed" ||
          (oldStatusName === "solved" && newStatusName === "open")
            ? "reopened"
            : "Status Changed";
    }

    // PUSH LOG: Status Change
    logs.push({
      action: actionLabel,
      details: {
        reason: `Status changed from ${previousStatus.name} to ${newStatus.name}`,
        old_status: { id: previousStatus.id, name: previousStatus.name },
        new_status: { id: newStatus.id, name: newStatus.name },
      },
    });
  }

  // --- B. Admin Assignment/Reassignment Detection ---
  const oldAdminId = oldTicket.admin_assigned_to?.id || null;
  const newAdminId = newTicket.admin_assigned_to || null;

  if (userRole === "admin" && oldAdminId !== newAdminId) {
    const actionLabel: ActionType =
      oldAdminId === null ? "assigned" : "reassigned";

    // PUSH LOG: Assignment Change
    logs.push({
      action: actionLabel,
      details: {
        reason: `Admin assignment updated.`,
        old_admin_id: oldAdminId,
        new_admin_id: newAdminId,
      },
    });
  }

  // --- C. Priority/Category Change Detection (Add as needed) ---
  // You would add similar blocks for other fields like priority, category, etc.

  // Example for Priority:
  if (
    newTicket.ticketPriority_id &&
    oldTicket.ticketPriority_id.id !== newTicket.ticketPriority_id
  ) {
    const oldPrio = TicketPriorities.find(
      (p) => p.id === oldTicket.ticketPriority_id.id
    );
    const newPrio = TicketPriorities.find(
      (p) => p.id === newTicket.ticketPriority_id
    );
    logs.push({
      action: "Priority Changed",
      details: {
        reason: `Ticket priority changed from ${oldPrio?.name} to ${newPrio?.name}`,
        old_priority: oldPrio,
        new_proiority: newPrio,
      },
    });
  }

  return logs;
}

export async function editTicket({
  newTicketData,
  oldTicketData,
  currentUser,
  currentClient,
  ticketStatuses,
  ticketPriorities,
  message,
  messageToEdit,
}: {
  newTicketData: EditProps;
  oldTicketData: Ticket;
  currentUser: User;
  currentClient: Client;
  ticketStatuses: TicketStatus[];
  ticketPriorities: TicketPriority[];
  message?: Message;
  messageToEdit?: EditMessageProps;
}) {
  try {
    // 1. Data Preparation: Fetch statuses if not provided (keeping the original logic for simplicity)
    // NOTE: In a production app, pass ticketStatuses in props to avoid this fetch.

    if (!ticketStatuses || !ticketStatuses.length)
      throw new Error("Could not load ticket statuses data.");

    const dateNow = new Date().toISOString();
    let resolveTime = oldTicketData.resolveTime;
    let firstResponseTime = oldTicketData.firstResponseTime;
    const userRole = currentUser.user_metadata?.role?.toLowerCase() || "user";
    const newStatus = ticketStatuses.find(
      (s) => s.id === newTicketData.ticketStatus_id
    );

    // 2. Pre-Update Calculations (Resolve Time & First Response Time)

    // Calculate Resolve Time
    if (
      userRole === "admin" &&
      newStatus?.name.toLowerCase() === "solved" &&
      !resolveTime
    ) {
      resolveTime = dateNow;
    }

    // Calculate First Response Time (Assuming any Admin action triggers this)
    if (userRole === "admin" && !firstResponseTime) {
      firstResponseTime = dateNow;
    }

    // 3. Generate History Logs (before the update)
    const historyLogs = generateHistoryLogs(
      oldTicketData,
      newTicketData,
      currentUser,
      ticketStatuses,
      ticketPriorities
    );

    // 4. Handle Message/Note Log (Independent Action)
    if (message && !messageToEdit) {
      const isInternal = message.is_internal_note;
      const reason = isInternal
        ? "Admin added internal note"
        : ` ${userRole === "admin" ? "Admin" : "Cutomer"} added public message`;
      historyLogs.push({
        action: isInternal ? "Internal Note" : "message",
        details: {
          message_id: `#${message.id}`,
          reason,
          content: message.content, // Includes the "reason" text
          attachment_count: message.attachments.length,
        },
      });
    }

    if (message && messageToEdit) {
      const isInternal = messageToEdit.editMessage.is_internal_note;
      const reason = isInternal
        ? "Admin edited internal note"
        : ` ${
            userRole === "admin" ? "Admin" : "Cutomer"
          } edited public message`;
      historyLogs.push({
        action: isInternal ? "Internal Note Edited" : "message edited",
        details: {
          message_id: `#${message.id}`,
          reason,
          content: messageToEdit.editMessage.content,
          old_message_content: message.content,
          attachment_count:
            message.attachments.length -
            (messageToEdit.attachmentsToDelete?.length || 0) +
            (messageToEdit.newFiles?.length || 0),

          deleted_attachment_count:
            messageToEdit.attachmentsToDelete?.length || 0,
          added_attachment_count: messageToEdit.newFiles?.length || 0,
        },
      });
    }

    // 5. PRIMARY DATABASE UPDATE
    const { error: updateError } = await supabase
      .from("tickets")
      .update({
        ...newTicketData,
        updated_at: dateNow, // Use the current time
        resolveTime,
        firstResponseTime,
      })
      .eq("id", newTicketData.id);

    if (updateError) {
      console.error(updateError.message);
      throw new Error(updateError.message);
    }

    // 6. HISTORY LOGGING (Execute all collected logs)
    const actorId = currentClient.id; // Use the current user's ID as the actor
    const ticketId = newTicketData.id;

    // Map the LogEntry objects into the full database object structure
    const finalLogsToInsert: TicketLogData[] = historyLogs.map((log) => ({
      ticket_id: ticketId,
      actor_id: actorId,
      action: log.action,
      details: log.details,
      // Message ID is only relevant for message/comment logs, otherwise it's null
      message_id:
        log.action.toLowerCase().includes("message") ||
        log.action.toLowerCase().includes("internal")
          ? message?.id
          : null,
    }));

    // Log all other state changes
    // Final step of editTicket:
    if (finalLogsToInsert.length > 0) {
      await logTicketActions(finalLogsToInsert); // Single bulk insert
    }
    // 7. FINAL STEP
    await revalidateTickets();
  } catch (error: any) {
    throw new Error(`Failed to edit ticket: ${error.message}`);
  }
}

// Define a type for the data structure required for a single log entry
interface TicketLogData {
  ticket_id: number;
  actor_id: number; // Assuming actor_id is a string/UUID based on previous discussion
  action: string;
  details: object;
  message_id?: number | null;
  created_at?: string; // We'll set this automatically
}

export async function logTicketActions(logs: TicketLogData[]) {
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
// export async function logTicketAction(
//   ticket_id: number,
//   actor_id: number,
//   action: string,
//   details: object,
//   messageId?: number
// ) {
//   const { error } = await supabase.from("ticketHistory").insert({
//     ticket_id,
//     actor_id,
//     action,
//     details, // The JSONB object
//     message_id: messageId,
//   });

//   if (error) {
//     // IMPORTANT: Log this error to your monitoring system, but usually
//     // don't throw it, as the main action (editTicket) already succeeded.
//     console.error("Failed to log ticket history:", error);
//     throw new Error(error.message);
//   }
// }

export async function getTicketById(
  id: string
): Promise<{ ticket: Ticket | null; error: PostgrestError | null }> {
  const { data: ticket, error } = await supabase
    .from("tickets")
    .select(
      "*,admin_assigned_to(*),ticketStatus_id(*),ticketPriority_id(*),ticketCategory_id(*),client:client_id(*)"
    )
    .eq("id", id)
    .single();

  return { ticket, error };
}
export async function getMessages(
  id: string
): Promise<{ messages: Message[] | null; error: PostgrestError | null }> {
  const { data: messages, error } = await supabase
    .from("messages")
    .select("*,attachments(*),client:client_id(*)")
    .eq("ticket_id", id)
    .order("created_at", { ascending: true });

  return { messages, error };
}

export async function deleteTicket(id: number) {
  const { error } = await supabase.from("tickets").delete().eq("id", id);

  if (error) throw new Error(error.message);
}
type BucketPromiseType = Promise<
  | {
      data: {
        id: string;
        path: string;
        fullPath: string;
      };
      error: null;
    }
  | {
      data: null;
      error: {
        message: string;
        statusCode?: number | null;
        error?: string | null;
        details?: any | null;
      };
    }
>;

interface Create {
  data: z.infer<typeof MessageSchema>;
  files: FileWithPreview[];
  client: Client;
}

async function uploadFiles(message: Message, files: FileWithPreview[]) {
  const bucketPromises: BucketPromiseType[] = [];
  const attachmentsData: Omit<CreateAttachment, "file">[] = [];

  // 1. Extract the data needed from teh attachments data.
  files.forEach((file) => {
    const file_name = file.name;
    const file_type = file.type;

    // Make sure that no file has the same name in the bucket.
    const nameInBucket = `${crypto.randomUUID()}-${file.name}`.replace(
      /\//g,
      ""
    );
    const file_url = `${SUPABASE_URL}/storage/v1/object/public/attachments/${nameInBucket}`;

    // Push all the file data for the attachment bucket.
    bucketPromises.push(
      supabase.storage.from("attachments").upload(nameInBucket, file, {
        cacheControl: "3600",
        upsert: false, // Prevent overwriting if UUID collision somehow happens
      })
    );

    // Push the data needed for the attachments table.
    attachmentsData.push({
      ticket_id: message.ticket_id,
      message_id: message.id,
      file_url,
      file_name,
      file_type,
      client_id: message.client_id,
      uploaded_by: message.senderId,
    });
  });

  // 2. Upload all files to the bucket.

  const results = await Promise.allSettled(bucketPromises);

  // 3.  Make sure that there were no errors while uploading the files to the backend.
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(`File upload at index ${index} failed:`, result.reason);
    } else {
      // result.status is 'fulfilled'
      console.log(
        `File at index ${index} uploaded successfully:`,
        result.value.data
      );
    }
  });

  // 4. Upload all attachment data for each file to attachment Table.
  const { data: returnedAttchments, error: attachmentsError } = await supabase
    .from("attachments")
    .insert(attachmentsData)
    .select();

  // 5. If an error occurred while uploading the attachment data throw an error.
  if (attachmentsError) throw new Error(attachmentsError.message);
  // attachments = returnedAttchments;
}

// export async function createMessage({
//   data,
//   files,
// }: Create): Promise<Message | null> {
//   // throw new Error(`Testing failed creation`);
//   const { data: message, error } = await supabase
//     .from("messages")
//     .insert([data])
//     .select();

//   if (error) throw new Error(error.message);

//   if (!message)
//     throw new Error("Something went wrong while creating a message");

//   const senderId = message[0].senderId;
//   const message_id = message[0].id;
//   const ticket_id = data.ticket_id;
//   const client_id = data.client_id;

//   let attachments: Attachment[] = [];

//   // https://umkyoinqpknmedkowqva.supabase.co/storage/v1/object/public/attachments/G4OrcuxWsAA8iDj.jpeg
//   if (files.length) {
//     const bucketPromises: BucketPromiseType[] = [];
//     const attachmentsData: Omit<CreateAttachment, "file">[] = [];

//     // 1. Extract the data needed from teh attachments data.
//     files.forEach((file) => {
//       const file_name = file.name;
//       const file_type = file.type;

//       // Make sure that no file has the same name in the bucket.
//       const nameInBucket = `${crypto.randomUUID()}-${file.name}`.replace(
//         /\//g,
//         ""
//       );
//       const file_url = `${SUPABASE_URL}/storage/v1/object/public/attachments/${nameInBucket}`;

//       // Push all the file data for the attachment bucket.
//       bucketPromises.push(
//         supabase.storage.from("attachments").upload(nameInBucket, file, {
//           cacheControl: "3600",
//           upsert: false, // Prevent overwriting if UUID collision somehow happens
//         })
//       );

//       // Push the data needed for the attachments table.
//       attachmentsData.push({
//         ticket_id,
//         message_id,
//         file_url,
//         file_name,
//         file_type,
//         client_id,
//         uploaded_by: senderId,
//       });
//     });

//     // 2. Upload all files to the bucket.
//     console.log("BEFORE  result");
//     const results = await Promise.allSettled(bucketPromises);
//     console.log("After results");
//     // 3.  Make sure that there were no errors while uploading the files to the backend.
//     results.forEach((result, index) => {
//       if (result.status === "rejected") {
//         console.error(`File upload at index ${index} failed:`, result.reason);
//       } else {
//         // result.status is 'fulfilled'
//         console.log(
//           `File at index ${index} uploaded successfully:`,
//           result.value.data
//         );
//       }
//     });

//     // 4. Upload all attachment data for each file to attachment Table.
//     const { data: returnedAttchments, error: attachmentsError } = await supabase
//       .from("attachments")
//       .insert(attachmentsData)
//       .select();

//     // 5. If an error occurred while uploading the attachment data throw an error.
//     if (attachmentsError) throw new Error(attachmentsError.message);
//     attachments = returnedAttchments;
//   }

//   return { ...message[0], attachments };
// }

export async function createMessage({
  data,
  files,
  client,
}: Create): Promise<Message | null> {
  // throw new Error(`Testing failed creation`);
  // throw new Error("ERROR ");
  const { data: message, error } = await supabase
    .from("messages")
    .insert([data])
    .select();

  if (error) throw new Error(error.message);

  if (!message)
    throw new Error("Something went wrong while creating a message");

  const senderId = message[0].senderId;
  const message_id = message[0].id;
  const ticket_id = data.ticket_id;
  const client_id = data.client_id;

  let attachments: Attachment[] = [];

  // https://umkyoinqpknmedkowqva.supabase.co/storage/v1/object/public/attachments/G4OrcuxWsAA8iDj.jpeg
  if (files.length) {
    const bucketPromises: BucketPromiseType[] = [];
    const attachmentsData: Omit<CreateAttachment, "file">[] = [];

    // 1. Extract the data needed from teh attachments data.
    files.forEach((file) => {
      const file_name = file.name;
      const file_type = file.type;

      // Make sure that no file has the same name in the bucket.
      const nameInBucket = `${crypto.randomUUID()}-${file.name}`.replace(
        /\//g,
        ""
      );
      const file_url = `${SUPABASE_URL}/storage/v1/object/public/attachments/${nameInBucket}`;

      // Push all the file data for the attachment bucket.
      bucketPromises.push(
        supabase.storage.from("attachments").upload(nameInBucket, file, {
          cacheControl: "3600",
          upsert: false, // Prevent overwriting if UUID collision somehow happens
        })
      );

      // Push the data needed for the attachments table.
      attachmentsData.push({
        ticket_id,
        message_id,
        file_url,
        file_name,
        file_type,
        client_id,
        uploaded_by: senderId,
      });
    });

    // 2. Upload all files to the bucket.

    const results = await Promise.allSettled(bucketPromises);

    // 3.  Make sure that there were no errors while uploading the files to the backend.
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(`File upload at index ${index} failed:`, result.reason);
      } else {
        // result.status is 'fulfilled'
        console.log(
          `File at index ${index} uploaded successfully:`,
          result.value.data
        );
      }
    });

    // 4. Upload all attachment data for each file to attachment Table.
    const { data: returnedAttchments, error: attachmentsError } = await supabase
      .from("attachments")
      .insert(attachmentsData)
      .select();

    // 5. If an error occurred while uploading the attachment data throw an error.
    if (attachmentsError) throw new Error(attachmentsError.message);
    attachments = returnedAttchments;
  }

  return { ...message[0], client, attachments };
}

export async function editMessages({
  editMessage,
  newFiles,
  attachmentsToDelete,
}: EditMessageProps) {
  const { data: message, error } = await supabase
    .from("messages")
    .update({ ...editMessage })
    .eq("id", editMessage.id)
    .select();

  if (error) {
    throw new Error(error.message);
  }
  if (!message) throw new Error("Something went wrong while editing message.");

  if (newFiles?.length) {
    await uploadFiles(message[0], newFiles);
  }

  if (attachmentsToDelete?.length) {
    const imageUrl: string[] = [];
    const attachmentIds: number[] = [];

    attachmentsToDelete.forEach((attachment) => {
      imageUrl.push(attachment.file_url);
      attachmentIds.push(attachment.id);
    });

    const { error: bucketError } = await deleteImageFromBucket({
      bucketName: "attachments",
      imagePaths: imageUrl,
    });

    if (bucketError) throw new Error(bucketError.message);

    const { error } = await supabase
      .from("attachments")
      .delete()
      .in("id", attachmentIds);
    if (error) throw new Error(error.message);
  }

  // await logTicketActions([
  //   {
  //     ticket_id: message[0].id,
  //     actor_id: message[0].client_id,
  //     action: "message edited",
  //     details: {
  //       ticket_id: message[0].id,
  //       reason: "Message content edited",
  //       deleted_attachments: attachmentsToDelete?.length || 0,
  //       added_attachments: newFiles?.length || 0,
  //       old_message_content: editMessage.content,
  //       new_message_content: message[0].content,
  //     },
  //   },
  // ]);
}

export async function deleteMessage(message: Message) {
  if (message.attachments.length) {
    const imagePaths: string[] = [];
    const attachmentIds: number[] = [];
    message.attachments.forEach((attachment) => {
      imagePaths.push(attachment.file_url);
      attachmentIds.push(attachment.id);
    });

    const { error: bucketError } = await deleteImageFromBucket({
      imagePaths,
      bucketName: "attachments",
    });

    if (bucketError) throw new Error(bucketError.message);

    const { error } = await supabase
      .from("attachments")
      .delete()
      .in("id", attachmentIds);

    if (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }

  const { error } = await supabase
    .from("messages")
    .delete()
    .eq("id", message.id);

  if (error) {
    console.log(error.message);
    throw new Error(error.message);
  }

  await logTicketActions([
    {
      ticket_id: message.ticket_id,
      actor_id: message.client_id,
      action: "message deleted",
      details: {
        reason: "Message deleted",
        attachments_deleted: message.attachments.length,
        message_content: message.content,
        is_internal_note: message.is_internal_note,
        message_id: `#${message.id}`,
      },
    },
  ]);
}

export async function deleteAttachment(attachment: Attachment) {
  const { error: bucketError } = await deleteImageFromBucket({
    bucketName: "attachments",
    imagePaths: [attachment.file_url],
  });
  if (bucketError) throw new Error(bucketError.message);

  const { error } = await supabase
    .from("attachments")
    .delete()
    .eq("id", attachment.id);

  if (error) throw new Error(error.message);
}

/// ---------------------------------------------------------------  old edit ticket function.

// export async function editTicket({
//   newTicketData,
//   oldTicketData,
//   currentUser,
//   currentClient,
//   ticketStatuses,
//   message,
// }: {
//   newTicketData: EditProps;
//   oldTicketData: Ticket;
//   currentUser: User;
//   currentClient: Client;
//   ticketStatuses?: TicketStatus[];
//   message?: Message;
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
//     const userRole = currentUser.user_metadata?.role || "user";
//     const previousStatus = ticketStatusesData.find(
//       (status) => status.id === oldTicketData.ticketStatus_id.id
//     ) as TicketStatus;
//     const newStatus = ticketStatusesData.find(
//       (status) => status.id === newTicketData.ticketStatus_id
//     ) as TicketStatus;

//     let action: z.infer<typeof TicketHistoryAction> | null = null;
//     let detials: z.infer<typeof TicektHistoryDetials> | null = null;

//     let firstResponseTime = oldTicketData.firstResponseTime;
//     let resolveTime = oldTicketData.resolveTime;

//     let isChanged = false;
//     // Check if the status has changed.
//     if (previousStatus.id !== newStatus.id) {
//       isChanged = true;
//       const name = newStatus.name.toLowerCase();

//       switch (name) {
//         case "solved":
//           action = "resolved";
//           break; // Stops execution here if 'name' was "solved"

//         case "closed":
//           {
//             action = "closed";
//           }
//           break; // Stops execution here if 'name' was "closed"

//         case "open":
//           action = "reopened";
//           break; // Stops execution here if 'name' was "open"

//         default:
//           action = name.startsWith("awaiting") ? "updated" : "Status Changed";
//         // No break needed for default as it's the last case
//       }

//       detials = {
//         reason: "Status has been changed by the admin",
//         old_status: { id: previousStatus.id, name: previousStatus.name },
//         new_status: { id: newStatus.id, name: newStatus.name },
//       };

//       // Check if the ticket wasn't assigned or got assigned to another admin.
//     }
//     if (userRole.toLowerCase() === "admin") {
//       if (!oldTicketData.admin_assigned_to) {
//         isChanged = true;
//         action = "assigned";

//         detials = {
//           reason: "Admin assigned",
//           new_admin_id: newTicketData.admin_assigned_to,
//           old_admin_id: oldTicketData.admin_assigned_to,
//         };
//       } else if (
//         newTicketData.admin_assigned_to !== oldTicketData.admin_assigned_to?.id
//       ) {
//         isChanged = true;
//         action = "assigned";

//         detials = {
//           reason: "Assigned To a different admin",
//           new_admin_id: newTicketData.admin_assigned_to,
//           old_admin_id: oldTicketData.admin_assigned_to?.id,
//         };
//       }
//     }
//     if (
//       userRole.toLowerCase() === "admin" &&
//       newStatus.name.toLowerCase() === "solved" &&
//       !resolveTime
//     ) {
//       isChanged = true;
//       resolveTime = dateNow.toISOString();
//     }
//     if (userRole.toLowerCase() === "admin" && !firstResponseTime) {
//       isChanged = true;
//       firstResponseTime = dateNow.toISOString();
//     }

//     if (message) {
//       action = message.is_internal_note ? "comment" : "message";

//       detials = {
//         message_id: message.id,
//         reason:
//           userRole.toLowerCase() === "admin"
//             ? "Admin message added"
//             : "Customer message added",
//         content: message.content,
//         is_internal_note: message.is_internal_note,
//         attachment_count: message.attachments.length,
//       };
//     }
//     const { error } = await supabase
//       .from("tickets")
//       .update({
//         ...newTicketData,
//         updated_at: dateNow.toISOString(),
//         resolveTime,
//         firstResponseTime,
//       })
//       .eq("id", newTicketData.id);

//     if (error) {
//       console.log(error.message);
//       throw new Error(error.message);
//     }
//     // if (isChanged) {
//     //   console.log(`revlidate has been fired.`);
//     //   await revalidateTickets();
//     // }
//     await revalidateTickets();

//     if (!action || !detials) return;
//     await logTicketAction(
//       newTicketData.id,
//       currentClient.id,
//       action,
//       detials,
//       message?.id
//     );
//   } catch (error: any) {
//     throw new Error(error.message);
//   }
// }
