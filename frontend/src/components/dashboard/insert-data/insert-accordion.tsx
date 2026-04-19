import { Accordion } from "@components/ui/accordion";
import React from "react";

import CarMakerList from "../cars-data/car-makers-list";
import CarGenerationList from "../cars-data/car-generation-list";

const InsetAccorion = ({ className }: { className?: string }) => {
  return (
    <Accordion type="multiple" className={`my-10 ${className}`}>
      <CarGenerationList />
      <CarMakerList />
    </Accordion>
  );
};

export default InsetAccorion;
