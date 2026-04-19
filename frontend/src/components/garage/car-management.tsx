import React from "react";
import CarForm from "./car-form";
import {
  CarGeneration,
  CarGenerationProps,
  CarItem,
  CarMaker,
  CarModelProps,
  ClientWithPhoneNumbers,
} from "@lib/types";
import { cn } from "@lib/utils";

const CarManagement = async ({
  carToEdit,
  useParams,
  className,
  clients,
  carGenerations,
  carMakers,
  clientId,
}: {
  useParams?: boolean;
  carToEdit?: CarItem;
  className?: string;
  clientId?: number;
  carMakers: CarMaker[] | null;
  carGenerations: CarGenerationProps[] | null;
  clients?: ClientWithPhoneNumbers[] | null;
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
        "flex  flex-col   w-full gap-y-2 xs:flex-row xs:items-center justify-between rounded-lg border p-3 shadow-sm gap-x-7",
        className
      )}
    >
      <div className="space-y-0.5   ">
        <label className=" font-semibold">Cars</label>
        <p className=" text-muted-foreground text-sm">
          {carToEdit ? "Edit car" : "Create a new car."}
        </p>
      </div>
      <div className=" sm:pr-2">
        <CarForm
          useParams={useParams}
          carToEdit={carToEdit}
          carMakers={carMakers || []}
          clientId={clientId}
          clients={clients || []}
          carGenerations={carGenerations || []}
        />
      </div>
    </div>
  );
};

export default CarManagement;
