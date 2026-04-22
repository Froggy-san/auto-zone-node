import { CarGenerationProps } from "@lib/types";
import { cn } from "@lib/utils";
import React from "react";

interface Generation {
  className?: string;
  generation: CarGenerationProps;
}

const GenerationItem = ({ generation, className }: Generation) => {
  return (
    <li
      className={cn(
        `relative  h-fit   px-3 py-2 flex flex-col  items-center justify-between    hover:bg-accent/30  transition-all cursor-pointer  gap-2 text-sm border rounded-lg `,
        { "px-3 py-[0.4rem] ": !generation.image },
        className
      )}
    >
      {generation.image ? (
        <img src={generation.image} className=" w-20 object-contain" />
      ) : null}

      <p className=" text-muted-foreground font-semibold">{generation.name}</p>
    </li>
  );
};

export default GenerationItem;
