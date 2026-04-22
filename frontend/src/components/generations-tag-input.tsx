import { cn } from "@/lib/utils"
import React, { useCallback, useEffect, useRef, useState } from "react"

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import CloseButton from "./close-button"
import { useOutsideClick } from "@/hooks/use-outside-click"
import type { CarGeneration } from "@/types"
interface Props {
  disabled?: boolean
  generations: CarGeneration[]
  ids: string[]
  setIds: React.Dispatch<React.SetStateAction<string[]>>
  className?: string
}

const GenerationsTagInput = ({
  disabled,
  generations,
  ids,
  setIds,
  className,
}: Props) => {
  const unAddedGens = generations.filter((gen) => !ids?.includes(gen._id))
  const gens = ids
    .map((id) => generations.find((item) => item._id === id))
    .filter((gen) => gen !== undefined)

  const handleRemove = useCallback(
    (id: string) => {
      setIds((ids) => ids.filter((gen) => gen !== id))
    },
    [setIds]
  )

  return (
    <ul
      className={cn(
        "flex h-fit flex-wrap items-start gap-x-3 gap-y-2 rounded-xl border p-3",
        className,
        { "pointer-events-none opacity-85": disabled }
      )}
    >
      {gens.length ? (
        ids.map((id) => {
          const generation = generations.find(
            (gen) => gen._id === id
          ) as CarGeneration
          return (
            <li
              className="flex items-center gap-3 rounded-xl bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground"
              key={id}
            >
              {generation?.name}{" "}
              <CloseButton
                onClick={() => handleRemove(generation._id)}
                className="static"
              />
            </li>
          )
        })
      ) : (
        <p className="text-muted-foreground">Add car generations.</p>
      )}
      <SearchBar generations={unAddedGens} setIds={setIds} />
    </ul>
  )
}

function SearchBar({
  generations,
  setIds,
}: {
  generations: CarGeneration[]
  setIds: React.Dispatch<React.SetStateAction<string[]>>
}) {
  const [open, setOpen] = useState(false)
  const [term, setTerm] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const container = useRef<HTMLDivElement>(null)
  const handleSelect = (generationId: string) => {
    setIds((ids) => [generationId, ...ids])
    // setOpen(false);
  }
  const ref = useOutsideClick(() => setOpen(false))
  useEffect(() => {
    if (inputRef.current) {
      // We know it's the direct parent div because of the CommandInput source code.
      //   const wrapperDiv = inputRef.current.parentElement;
      const wrapperDiv = inputRef.current.closest('div[cmdk-input-wrapper=""]')

      // You could also use closest('div[cmdk-input-wrapper=""]'), but parentElement is more direct here.
      // const wrapperDiv = inputRef.current.closest('div[cmdk-input-wrapper=""]');

      if (wrapperDiv) {
        // Add a class to remove the border
        wrapperDiv.classList.add("border-none")
      }
    }
  }, [])
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>}>
      <Command className="relative max-w-[300px] min-w-[260px] flex-1 overflow-visible rounded-lg border-none bg-card shadow-sm">
        <CommandInput
          ref={inputRef}
          value={term}
          onValueChange={(value) => setTerm(value)}
          onKeyDown={(e) => {
            if (e.code === "Backspace" && !term.length) {
              e.preventDefault()
              setIds((ids) => {
                const newArr = [...ids]
                newArr.pop()
                return newArr
              })
            }
          }}
          onFocus={() => setOpen(true)}
          // onBlur={() => setOpen(false)}
          placeholder="Search generations..."
          className="h-5"
        />
        {open ? (
          <CommandList className="absolute top-8 left-1/2 z-20 w-full -translate-x-1/2 rounded-xl border bg-card p-1 shadow-md">
            <CommandEmpty>No results found.</CommandEmpty>

            {generations.map((generation) => (
              <CommandItem
                key={generation._id}
                value={generation.name}
                onSelect={() => handleSelect(generation._id)}
                onClick={() => {
                  handleSelect(generation._id)
                }}
              >
                {generation.name}
              </CommandItem>
            ))}
          </CommandList>
        ) : null}
      </Command>
    </div>
  )
}

export default GenerationsTagInput
