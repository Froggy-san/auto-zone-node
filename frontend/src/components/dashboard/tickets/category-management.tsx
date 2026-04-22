import ErrorMessage from "@components/error-message";
import { getTicketCategoriesAction } from "@lib/actions/ticket-category-action";
import { createClient } from "@utils/supabase/server";
import React from "react";
import Categories from "./categories";

const CategoryManagement = async () => {
  const supabase = await createClient();
  const { ticketCategories, error } = await getTicketCategoriesAction(supabase);

  if (error) return <ErrorMessage>{error.message}</ErrorMessage>;
  return (
    <div>
      <Categories ticketCategories={ticketCategories} />
    </div>
  );
};

export default CategoryManagement;
