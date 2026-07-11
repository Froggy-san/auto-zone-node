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
import { CarInfoProps } from "@lib/types"
import { DEFAULT_CAR_LOGO } from "@lib/constants"

// const frameworks = [
//   {
//     value: "next.js",
//     label: "Next.js",
//   },
//   {
//     value: "sveltekit",
//     label: "SvelteKit",
//   },
//   {
//     value: "nuxt.js",
//     label: "Nuxt.js",
//   },
//   {
//     value: "remix",
//     label: "Remix",
//   },
//   {
//     value: "astro",
//     label: "Astro",
//   },
// ];

interface ComboBoxProps {
  setValue: React.Dispatch<React.SetStateAction<number>>
  value: number
  options: CarInfoProps[]
  disabled?: boolean
}

export const CarInfoComboBox: React.FC<ComboBoxProps> = ({
  setValue,
  value,
  options,
  disabled,
}) => {
  const [open, setOpen] = React.useState(false)
  // const [value, setValue] = React.useState(0);
  const selected = options.find((option) => option.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-fit w-full justify-between"
        >
          {selected ? (
            <div className="flex flex-1 items-center break-all">
              <p className="text-left text-wrap">
                Make: {selected.carMaker.name} / Model: {selected.carModel.name}{" "}
                / Gen: {selected.carGeneration.name}{" "}
              </p>
              <img
                src={selected.carMaker.logo || DEFAULT_CAR_LOGO}
                alt="Car logo"
                className="ml-[5px] h-9 w-9 max-w-[100%] rounded-sm object-cover"
              />
            </div>
          ) : (
            "Select option..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="h-[30vh] w-[300px] p-0 sm:h-[unset] sm:w-[400px]">
        <Command>
          <CommandInput placeholder="Search option..." />
          <CommandList>
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              {options?.map((option) => (
                <CommandItem
                  key={option.id}
                  value={
                    option.carMaker.name +
                    option.carModel.name +
                    option.carGeneration.name +
                    String(option.id)
                  } // to avoid selecting two or more items that has the same name proprty.
                  onSelect={() => {
                    setValue(option.id === value ? 0 : option.id)
                    setOpen(false)
                  }}
                  className="gap-2"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <p className="flex-1 break-all">
                    Make: {option.carMaker.name} / Model: {option.carModel.name}{" "}
                    / Gen: {option.carGeneration.name}{" "}
                  </p>
                  <img
                    src={option.carMaker.logo || DEFAULT_CAR_LOGO}
                    alt="Car logo"
                    className="ml-auto max-h-9 max-w-9 rounded-sm object-cover"
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
