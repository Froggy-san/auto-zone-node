import { CarModelProps } from "@lib/types";
import { cn } from "@lib/utils";
import React from "react";
import { motion } from "framer-motion";
interface Model extends React.HTMLAttributes<HTMLLIElement> {
  model: CarModelProps;
}

const Model = ({ model, className, ...props }: Model) => {
  return (
    <li
      className={cn(
        `relative w-[48%] h-fit  sm:w-fit px-3 py-2 flex flex-col  items-center    hover:bg-accent/30  transition-all duration-200  cursor-pointer  gap-2 text-sm border rounded-lg `,
        className
      )}
      {...props}
    >
      {model.image ? (
        <img
          src={model.image}
          alt={model.name}
          className="w-20 object-contain"
        />
      ) : null}
      <p className="text-center font-semibold">{model.name}</p>
    </li>
  );
};

export default Model;
