import ErrorMessage from "@components/error-message";
import { getTicketStatusesAction } from "@lib/actions/ticket-status-actions";
import React from "react";
import TicketStatus from "../../ticket-status";
import { createClient } from "@utils/supabase/server";

const Statuses = async () => {
  const supabase = await createClient();
  const { ticketStatus, error } = await getTicketStatusesAction(supabase);

  if (error) return <ErrorMessage>{error.message}</ErrorMessage>;
  return (
    <div className=" my-10">
      <h2 className="  font-semibold mb-6 text-xl underline">Ticket Status</h2>
      <ul className=" flex  gap-2   flex-wrap">
        {ticketStatus?.length ? (
          ticketStatus.map((ticket) => (
            <TicketStatus admin key={ticket.id} ticketStatus={ticket} />
          ))
        ) : (
          <p className=" text-2xl my-20 w-full text-center font-semibold text-muted-foreground">
            No ticket status were posted.
          </p>
        )}
      </ul>
    </div>
  );
};

export default Statuses;
