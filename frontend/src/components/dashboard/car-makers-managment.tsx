import CarkMakerForm from "@components/car-maker-form";
import React from "react";

const CarMakerManagement = () => {
  return (
    <div className="flex  flex-col  gap-y-2 xs:flex-row xs:items-center justify-between rounded-lg border p-3 shadow-sm gap-x-7">
      <div className="space-y-0.5   ">
        <label className=" font-semibold">Car makers</label>
        <p className=" text-muted-foreground text-sm">Add car makers.</p>
      </div>
      <div className=" sm:pr-2">
        <CarkMakerForm />
      </div>
    </div>
  );
};

export default CarMakerManagement;
