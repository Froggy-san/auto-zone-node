import ErrorMessage from "@components/error-message";
import { getServiceStatusAction } from "@lib/actions/serviceStatusAction";
import React from "react";
// import StatusBadge from "../status-badge";
import dynamic from "next/dynamic";
import Spinner from "@components/Spinner";

const StatusBadge = dynamic(() => import("../status-badge"), {
  loading: () => <Spinner className="  w-fit h-fit" size={12} />,
  ssr: false,
});
const ServiceStatus = async () => {
  const { data, error } = await getServiceStatusAction();

  if (error || !data)
    return (
      <ErrorMessage>
        {error || "Something went wrong while getting the service statuses"}
      </ErrorMessage>
    );

  return (
    <ul className=" flex flex-row gap-2  flex-wrap ">
      {data.map((status) => (
        <StatusBadge
          controls
          key={status.id}
          status={status}
          className="  hover:opacity-90 transition-opacity "
        />
      ))}
    </ul>
  );
};

export default ServiceStatus;
