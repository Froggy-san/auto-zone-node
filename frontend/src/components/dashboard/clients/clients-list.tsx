import React from "react";
import ClientsTable from "./clients-table";
import { getClientsAction } from "@lib/actions/clientActions";
import PaginationControl from "@components/pagination-controls";

interface ClientListProps {
  // Add the properties you expect in searchParam
  // query: string;

  pageNumber: string;
  name?: string;
  phone?: string;
  email?: string;
}
const ClientsList = async ({
  pageNumber,
  name,
  email,
  phone,
}: ClientListProps) => {
  const { data, error } = await getClientsAction({
    pageNumber,
    name,
    email,
    phone,
  });

  if (error) return <p>{error}</p>;

  return (
    <div>
      <ClientsTable currPage={pageNumber} clients={data?.clients || []} />
      <PaginationControl
        count={Number(data?.count) || 0}
        currPage={pageNumber}
      />
    </div>
  );
};

export default ClientsList;
