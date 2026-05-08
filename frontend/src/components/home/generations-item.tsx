import { CarGenerationProps } from "@lib/types"
import { cn } from "@lib/utils"
import React from "react"

interface Generation {
  className?: string
  generation: CarGenerationProps
}

const GenerationItem = ({ generation, className }: Generation) => {
  return (
    <li
      className={cn(
        `relative flex h-fit cursor-pointer flex-col items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm transition-all hover:bg-accent/30`,
        { "px-3 py-[0.4rem]": !generation.image },
        className
      )}
    >
      {generation.image ? (
        <img src={generation.image} className="w-20 object-contain" />
      ) : null}

      <p className="font-semibold text-muted-foreground">{generation.name}</p>
    </li>
  )
}

export default GenerationItem
