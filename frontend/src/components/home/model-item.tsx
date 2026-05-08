import { CarModelProps } from "@lib/types"
import { cn } from "@lib/utils"
import React from "react"
import { motion } from "framer-motion"
interface Model extends React.HTMLAttributes<HTMLLIElement> {
  model: CarModelProps
}

const Model = ({ model, className, ...props }: Model) => {
  return (
    <li
      className={cn(
        `relative flex h-fit w-[48%] cursor-pointer flex-col items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all duration-200 hover:bg-accent/30 sm:w-fit`,
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
  )
}

export default Model
