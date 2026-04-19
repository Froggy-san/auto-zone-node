import { Service } from "@lib/types";
import { cn } from "@lib/utils";
import Link from "next/link";
import React from "react";

const ServiceDiaDetails = ({
  service,
  isAdmin,
  className,
}: {
  service: Service;
  isAdmin: boolean;
  className?: string;
}) => {
  const plateNumber = service.cars.plateNumber;
  const client = service.clients;

  return (
    <div
      className={cn(
        " text-xs   justify-end flex items-center gap-y-1 gap-x-3 flex-wrap text-muted-foreground  ",
        className
      )}
    >
      {isAdmin ? (
        <>
          <Link href={`/customers?name=${client.name}`}>
            Client: <span>{client.name}</span>
          </Link>
          <Link href={`/garage?plateNumber=${plateNumber}&page=1`}>
            Plate num: <span>{service.cars.plateNumber}</span>
          </Link>
        </>
      ) : (
        <>
          <div>
            Client: <span>{client.name}</span>
          </div>
          <div>
            Plate num: <span>{service.cars.plateNumber}</span>
          </div>
        </>
      )}
      <div>
        Date: <span>{service.created_at}</span>
      </div>
    </div>
  );
};

export default ServiceDiaDetails;
