import ErrorMessage from "@components/error-message";
import { getTicketCategoriesAction } from "@lib/actions/ticket-category-action";
import { createClient } from "@utils/supabase/server";
import React from "react";
import Categories from "./categories";
import { getTickettPrioritiesAction } from "@lib/actions/ticket-priority-action";
import Priorities from "./priorities";

const PrioManagement = async () => {
  const supabase = await createClient();
  const { ticketPriorities, error } = await getTickettPrioritiesAction(
    supabase
  );

  if (error) return <ErrorMessage>{error.message}</ErrorMessage>;
  return (
    <div>
      <Priorities ticketCategories={ticketPriorities} />
    </div>
  );
};

export default PrioManagement;
