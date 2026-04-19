import React from "react";
import ClientForm from "./client-form";

const ClientManagement = () => {
  return (
    <div className="flex  flex-col  gap-y-2 xs:flex-row xs:items-center justify-between rounded-lg border p-3 shadow-sm gap-x-7">
      <div className="space-y-0.5   ">
        <label className=" font-semibold">Clients</label>
        <p className=" text-muted-foreground text-sm">Create a new client.</p>
      </div>
      <div className=" sm:pr-2">
        <ClientForm />
      </div>
    </div>
  );
};

export default ClientManagement;
