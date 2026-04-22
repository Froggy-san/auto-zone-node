import { getTicketsAction } from "@lib/actions/tickets-actions";
import { createClient } from "@utils/supabase/server";
import React from "react";
import TicketTable from "./ticket-table";
import ErrorMessage from "./error-message";
import PaginationControl from "./pagination-controls";
import { TicketCategory, TicketPriority, TicketStatus } from "@lib/types";
import TicketTableOperations from "./ticket-table-operations";
interface SearchParams {
  page?: string;
}
interface Props {
  page?: string;
  dateTo: string;
  dateFrom: string;
  name: string;
  sort: string;
  ticketStatusId: string;
  ticketStatuses: TicketStatus[];
  ticketCategories: TicketCategory[];
  ticketPriorities: TicketPriority[];
}
const Tickets = async ({
  ticketCategories,
  ticketPriorities,
  ticketStatuses,
  ticketStatusId,
  name,
  page,
  dateFrom,
  dateTo,
  sort,
}: Props) => {
  const pageNumber = page || "1";
  const supabase = await createClient();

  const { tickets, count, error } = await getTicketsAction(
    {
      pageNumber,
      status: ticketStatusId,
      dateTo,
      dateFrom,
      name,
      sort,
    },
    supabase
  );

  // const [] = await Promise.all([]);

  // if (error) return <ErrorMessage>{error}</ErrorMessage>;
  return (
    <div>
      <TicketTableOperations
        isAdmin
        sort={sort}
        status={ticketStatuses}
        ticketStatusId={ticketStatusId}
        currPage={pageNumber}
        dateFrom={dateFrom}
        dateTo={dateTo}
        name={name}
      />
      <TicketTable
        isAdmin
        tickets={tickets || []}
        ticketStatuses={ticketStatuses}
        ticketCategories={ticketCategories}
        ticketPriorities={ticketPriorities}
      />
      <PaginationControl count={count ? count : 0} currPage={pageNumber} />
    </div>
  );
};

export default Tickets;
