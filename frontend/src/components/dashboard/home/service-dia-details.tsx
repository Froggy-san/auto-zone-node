import { cn } from "@/lib/utils"
import type { Service } from "@/types"
import React from "react"
import { Link } from "react-router"

const ServiceDiaDetails = ({
  service,
  isAdmin,
  className,
}: {
  service: Service
  isAdmin: boolean
  className?: string
}) => {
  const plateNumber = service.car.plateNumber
  const client = service.user

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs text-muted-foreground",
        className
      )}
    >
      {isAdmin ? (
        <>
          <Link to={`/customers?name=${client.username}`}>
            Client: <span>{client.username}</span>
          </Link>
          <Link to={`/garage?plateNumber=${plateNumber}&page=1`}>
            Plate num: <span>{service.car.plateNumber}</span>
          </Link>
        </>
      ) : (
        <>
          <div>
            Client: <span>{client.username}</span>
          </div>
          <div>
            Plate num: <span>{service.car.plateNumber}</span>
          </div>
        </>
      )}
      <div>
        Date: <span>{`${service.createdAt}`}</span>
      </div>
    </div>
  )
}

export default ServiceDiaDetails
