import React from "react"
import CarForm from "./car-form"

import { cn } from "@/lib/utils"
import type { Car, CarMaker, User } from "@/types"

const CarManagement = ({
  carToEdit,
  useParams,
  className,
  clients,
  // carGenerations,
  // carMakers,
  clientId,
}: {
  useParams?: boolean
  carToEdit?: Car
  className?: string
  clientId?: number
  // carMakers: CarMaker[]
  // carGenerations: CarGenerationProps[] | null;
  clients?: User[] | null
}) => {
  // const [carInfos, clients] = await Promise.all([
  //   getAllCarsInfoAction(),
  //   getClientsDataAction(),
  // ]);

  // const { data: clientsData, error: clientsDataError } = clients;
  // const { data: carInfosData, error: carInfosError } = carInfos;

  // if (clientsDataError || carInfosError)
  //   return <p>{clientsDataError || carInfosError}</p>;
  return (
    <div
      className={cn(
        "flex w-full flex-col justify-between gap-x-7 gap-y-2 rounded-lg border p-3 shadow-sm xs:flex-row xs:items-center",
        className
      )}
    >
      <div className="space-y-0.5">
        <label className="font-semibold">Cars</label>
        <p className="text-sm text-muted-foreground">
          {carToEdit ? "Edit car" : "Create a new car."}
        </p>
      </div>
      <div className="sm:pr-2">
        <CarForm
          useParams={useParams}
          carToEdit={carToEdit}
          // carMakers={carMakers}
          // clientId={clientId}
          clients={clients || []}
        />
      </div>
    </div>
  )
}

export default CarManagement
