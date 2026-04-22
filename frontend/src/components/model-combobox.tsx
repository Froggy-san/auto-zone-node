"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
import type { CarModel } from "@/types"

interface CarModelComboBoxProps {
  setValue: (carModel: string) => void
  value: string | null
  disabled?: boolean
  options: CarModel[]
  className?: string
}

export const ModelCombobox: React.FC<CarModelComboBoxProps> = ({
  setValue,
  value,
  disabled,
  options,
  className,
}) => {
  const [open, setOpen] = React.useState(false)
  // const [value, setValue] = React.useState(0);

  const selectedItem = options?.find((option) => option._id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          role="CarModelComboBox"
          aria-expanded={open}
          className={cn("h-fit w-full justify-between select-none", className)}
        >
          {selectedItem ? (
            <div className="flex items-center gap-2 text-left text-wrap break-all">
              {selectedItem.image ? (
                <img
                  loading="lazy"
                  src={selectedItem.image}
                  className="3xl:max-w-16 3xl:h-11 h-7 max-w-12 object-contain"
                  alt="Car image"
                />
              ) : null}
              <span className="3xl:text-lg"> {selectedItem.name}</span>
            </div>
          ) : (
            "Select model..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command className="h-[30vh] w-[300px] sm:h-[unset] sm:w-[400px]">
          <CommandInput className="3xl:h-16" placeholder="Search option..." />
          <CommandList>
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              {options?.map((option) => (
                <CommandItem
                  key={option._id}
                  value={option.name + String(option._id)} // to avoid selecting two or more items that has the same name proprty.
                  onSelect={() => {
                    setValue(option._id === value ? "" : option._id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === option._id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.image ? (
                    <img
                      loading="lazy"
                      src={option.image}
                      className="3xl:max-w-16 3xl:h-11 mr-2 h-7 max-w-12 object-contain"
                      alt="Car image"
                    />
                  ) : null}
                  <span className="3xl:text-lg flex-1 break-all">
                    {option.name}
                  </span>{" "}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
