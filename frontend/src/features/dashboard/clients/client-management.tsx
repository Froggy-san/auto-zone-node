import React from "react"
import ClientForm from "./client-form"

const ClientManagement = () => {
  return (
    <div className="flex flex-col justify-between gap-x-7 gap-y-2 rounded-lg border p-3 shadow-sm xs:flex-row xs:items-center">
      <div className="space-y-0.5">
        <label className="font-semibold">Clients</label>
        <p className="text-sm text-muted-foreground">Create a new client.</p>
      </div>
      <div className="sm:pr-2">
        <ClientForm />
      </div>
    </div>
  )
}

export default ClientManagement
