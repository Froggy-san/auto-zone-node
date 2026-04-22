import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CarGenerationProps, CarMakersData, CarModelProps } from "@lib/types";
import GenerationItem from "./generation-item";
const GenerationsList = ({
  generations,
  carMaker,
}: {
  generations: CarGenerationProps[];
  carMaker: CarMakersData | null;
}) => {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>
          {" "}
          <h3 className="sm:text-xl md:text-2xl font-semibold mb-3">
            All Generations
          </h3>
        </AccordionTrigger>
        <AccordionContent>
          {generations.length ? (
            <ul className=" grid  grid-cols-2 sm:grid-cols-3  gap-2">
              {generations.map((item) => {
                const model = carMaker?.carModels.find(
                  (model) => model.id === item.carModelId
                ) as CarModelProps;
                return (
                  <GenerationItem key={item.id} model={model} item={item} />
                );
              })}
            </ul>
          ) : (
            <p className="text-muted-foreground w-full text-center">
              No Generations
            </p>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default GenerationsList;
