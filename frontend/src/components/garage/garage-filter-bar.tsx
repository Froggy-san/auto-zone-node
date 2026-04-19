import React from "react";

import GarageFilter from "./garage-fiter";
import {
  CarGenerationProps,
  CarMaker,
  CarModelProps,
  ClientWithPhoneNumbers,
} from "@lib/types";

interface CarsListProps {
  color: string;
  plateNumber: string;
  chassisNumber: string;
  motorNumber: string;
  clientId: string;
  carGenerationId: string;
  carGenerations: CarGenerationProps[] | null;
  clients: ClientWithPhoneNumbers[];
  carMakers: CarMaker[];
  carModels: CarModelProps[];
  pageNumber: string;
  count: number;
  carMakerId: string;
  carModelId: string;
}
const GarageFilterbar: React.FC<CarsListProps> = async ({
  clients,
  carGenerations,
  ...props
}) => {
  return (
    <aside className={`sm:w-[200px]   sm:p-2 sm:border-t sm:border-r `}>
      <GarageFilter
        clients={clients}
        carGeneration={carGenerations || []}
        {...props}
      />
    </aside>
  );
};

export default GarageFilterbar;
