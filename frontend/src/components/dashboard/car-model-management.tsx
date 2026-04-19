import CarModelForm from "@components/car-model-form";
import { getAllCarMakersAction } from "@lib/actions/carMakerActions";

import React from "react";

const CarModelManagement = async () => {
  const { data, error } = await getAllCarMakersAction();

  if (error) return <p>{error}</p>;
  return (
    <div className="flex  flex-col  gap-y-2 xs:flex-row xs:items-center justify-between rounded-lg border p-3 shadow-sm gap-x-7">
      <div className="space-y-0.5   ">
        <label className=" font-semibold">Car models</label>
        <p className=" text-muted-foreground text-sm">Add car models.</p>
      </div>
      <div className="  sm:pr-2">
        <CarModelForm carMakers={data} />
      </div>
    </div>
  );
};

export default CarModelManagement;
