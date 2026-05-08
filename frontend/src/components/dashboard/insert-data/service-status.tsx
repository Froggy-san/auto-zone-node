import ErrorMessage from "@components/error-message"
import { getServiceStatusAction } from "@lib/actions/serviceStatusAction"
import React from "react"
// import StatusBadge from "../status-badge";
import dynamic from "next/dynamic"
import Spinner from "@components/Spinner"

const StatusBadge = dynamic(() => import("../status-badge"), {
  loading: () => <Spinner className="h-fit w-fit" size={12} />,
  ssr: false,
})
const ServiceStatus = () => {
  const { data, error } = await getServiceStatusAction()

  if (error || !data)
    return (
      <ErrorMessage>
        {error || "Something went wrong while getting the service statuses"}
      </ErrorMessage>
    )

  return (
    <ul className="flex flex-row flex-wrap gap-2">
      {data.map((status) => (
        <StatusBadge
          controls
          key={status.id}
          status={status}
          className="transition-opacity hover:opacity-90"
        />
      ))}
    </ul>
  )
}

export default ServiceStatus
