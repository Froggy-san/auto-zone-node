import React from "react";

import { getAllCarModelsAction } from "@lib/actions/carModelsActions";
import { getAllCarMakersAction } from "@lib/actions/carMakerActions";
import { getAllCarGenerationsAction } from "@lib/actions/carGenerationsActions";
import CarInfoForm from "./car-info-form";

const CarInfoManagement = async () => {
  const [carModels, carMakers, carGenerations] = await Promise.all([
    getAllCarModelsAction(),
    getAllCarMakersAction(),
    getAllCarGenerationsAction(),
  ]);
  const { data: carGenerationsData, error: carGenerationsError } =
    carGenerations;
  const { data: carModelsData, error: carModelsError } = carModels;
  const { data: carMakersData, error: carMakersError } = carMakers;

  if (carModelsError || carMakersError || carGenerationsError)
    return <p>{carMakersError || carModelsError || carGenerationsError}</p>;

  return (
    <div className="flex  flex-col  gap-y-2 xs:flex-row xs:items-center justify-between rounded-lg border p-3 shadow-sm gap-x-7">
      <div className="space-y-0.5   ">
        <label className=" font-semibold">Car information</label>
        <p className=" text-muted-foreground text-sm">
          Create a new car information.
        </p>
      </div>
      <div className="  sm:pr-2">
        <CarInfoForm
          carGenerations={carGenerationsData?.carGenerationsData}
          carMakers={carMakersData || []}
          carModels={carModelsData?.models}
        />
      </div>
    </div>
  );
};

export default CarInfoManagement;
