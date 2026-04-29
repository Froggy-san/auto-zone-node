import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { cn } from "@/lib/utils"
import React, { useState } from "react"

import { Button } from "./ui/button"
import { Check, ChevronsUpDown } from "lucide-react"
import type { CarMaker } from "@/types/carMaker"

interface Props {
  setValue: (value: string) => void
  value: string | null
  searchTerm?: string
  setSearchTerm?: (value: string) => void
  shouldFilter?: boolean
  options: CarMaker[]
  disabled?: boolean
  className?: string
}
const CarBrandsCombobox = React.forwardRef<HTMLButtonElement, Props>(
  (
    {
      value,
      setValue,
      searchTerm,
      setSearchTerm,
      options,
      disabled,
      className,
      shouldFilter = true,
    }: Props,
    ref
  ) => {
    const [open, setOpen] = useState(false)

    const selected = options.find((option) => option._id === value)

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            disabled={disabled}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "h-fit min-h-9 w-full justify-between select-none",
              className
            )}
          >
            {selected ? (
              <div className="flex items-center gap-2 text-sm">
                {selected.logo ? (
                  <img
                    src={selected.logo}
                    className="h-9 max-w-10 object-contain 3xl:h-11 3xl:max-w-14"
                    alt="Car image"
                  />
                ) : null}
                <span className="text-wrap break-all 3xl:text-lg">
                  {" "}
                  {selected.name}
                </span>
              </div>
            ) : (
              "Select car..."
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="h-[30vh] w-[300px] p-0 sm:h-[unset] sm:w-[400px]">
          <Command shouldFilter={shouldFilter}>
            <CommandInput
              className="3xl:h-16"
              value={searchTerm}
              onValueChange={(value) => setSearchTerm?.(value)}
              placeholder="Search for car brands..."
            />
            <CommandList>
              <CommandEmpty>No option found.</CommandEmpty>
              <CommandGroup>
                {options?.map((option, i) => {
                  console.log(option._id, "DDDDDDDD")
                  return (
                    <CommandItem
                      key={`${option._id}-${i}`}
                      value={option._id}
                      onSelect={() => {
                        setValue(option._id === value ? "" : option._id)
                        setOpen(false)
                      }}
                      className="gap-2"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 shrink-0",
                          value === option._id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        {option.logo ? (
                          <img
                            src={option.logo}
                            className="h-9 max-w-10 object-contain 3xl:h-14 3xl:max-w-14"
                            alt="Car image"
                          />
                        ) : null}{" "}
                        <span className="3xl:text-lg"> {option.name}</span>
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }
)

CarBrandsCombobox.displayName = "CarBrandsCombobox"
export default CarBrandsCombobox
