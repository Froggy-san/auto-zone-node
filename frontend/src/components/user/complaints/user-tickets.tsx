import ErrorMessage from "@components/error-message";
import PaginationControl from "@components/pagination-controls";
import TicketTable from "@components/ticket-table";
import { getClientByIdAction } from "@lib/actions/clientActions";
import { getTicketsAction } from "@lib/actions/tickets-actions";
import { TicketCategory, TicketPriority, TicketStatus } from "@lib/types";
import { SupabaseClient, User } from "@supabase/supabase-js";

import React from "react";
import { GiTumbleweed } from "react-icons/gi";

interface Props {
  ticketStatuses: TicketStatus[];
  ticketCategories: TicketCategory[];
  ticketPriorities: TicketPriority[];
  pageNumber: string;
  ticketStatusId: string;
  supabase: SupabaseClient;
  userId: string;
  currUser: User | null;
}
const UserTickets = async ({
  supabase,
  pageNumber,
  ticketStatusId,
  ticketCategories,
  ticketPriorities,
  ticketStatuses,
  userId,
  currUser,
}: Props) => {
  const { data: ClientsData, error: clientError } = await getClientByIdAction(
    userId,
    "user_id"
  );

  if (clientError) return <ErrorMessage>{clientError}</ErrorMessage>;

  if (!ClientsData)
    return (
      <ErrorMessage>
        Something went wrong while grabbing the client&apos;s data.
      </ErrorMessage>
    );

  const { tickets, count, error } = await getTicketsAction(
    {
      pageNumber,
      status: ticketStatusId,
      clientId: ClientsData?.id,
    },
    supabase
  );

  const isError = !!error?.message.length || clientError.length > 0;

  if (isError)
    return (
      <>
        {error?.message && <ErrorMessage>{error.message}</ErrorMessage>}
        {clientError && <ErrorMessage>{clientError}</ErrorMessage>}
      </>
    );

  if (!tickets) return <ErrorMessage>Something went wrong</ErrorMessage>;

  const isAdmin = currUser?.user_metadata.role === "Admin";
  return (
    <div>
      {tickets.length ? (
        <>
          {" "}
          <TicketTable
            isAdmin={!!isAdmin}
            tickets={tickets || []}
            ticketStatuses={ticketStatuses}
            ticketCategories={ticketCategories}
            ticketPriorities={ticketPriorities}
          />
          <PaginationControl count={count ? count : 0} currPage={pageNumber} />
        </>
      ) : (
        <div className=" flex flex-col items-center justify-center gap-4">
          <GiTumbleweed className=" w-7 h-7 sm:w-12 sm:h-12" />
          <p className=" text-lg text-center text-muted-foreground  md:text-xl">
            No tickets were issued{" "}
          </p>
        </div>
      )}
    </div>
  );
};

export default UserTickets;
