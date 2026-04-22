import React from "react";

import GarageFilter from "./garage-fiter";
import {
  CarGenerationProps,
  CarMaker,
  CarMakersData,
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
  // carGenerations: CarGenerationProps[] | null;
  clients: ClientWithPhoneNumbers[];
  carMakers: CarMakersData[];
  // carModels: CarModelProps[];
  pageNumber: string;
  count: number;
  carMakerId: string;
  carModelId: string;
}
const GarageFilterbar: React.FC<CarsListProps> = async ({
  clients,
  ...props
}) => {
  return (
    <aside className={`sm:w-[210px] 3xl:w-[300px]    sm:border-t sm:border-r `}>
      <GarageFilter clients={clients} {...props} />
    </aside>
  );
};

export default GarageFilterbar;
