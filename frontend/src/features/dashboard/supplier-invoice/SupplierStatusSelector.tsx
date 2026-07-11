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

import {
  FULLFILLMENT_STATUS_VALUES,
  type FulfillmentStatus,
} from "@/types/supplierInvoiceTypes"
import SupplierStatusBadge from "./SupplierStatusBadge"

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
  setValue: React.Dispatch<React.SetStateAction<FulfillmentStatus>>
  value: FulfillmentStatus
  // options: ServiceStatus[]
  disabled?: boolean
  className?: string
}

export const SupplierStatusSelector: React.FC<ComboBoxProps> = ({
  setValue,
  value,
  // options,
  className,
  disabled,
}) => {
  const [open, setOpen] = React.useState(false)

  // const [value, setValue] = React.useState(0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",

            className
          )}
        >
          {value ? (
            <div className="flex max-w-full items-center gap-2">
              <SupplierStatusBadge
                supplierStatus={value}
                className="py-[.1rem] !text-wrap"
              />
            </div>
          ) : (
            "Select status..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-h-[30vh] w-[300px] p-0 sm:h-[unset] sm:w-[400px]">
        <Command>
          <CommandInput placeholder="Search option..." />
          <CommandList>
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              {FULLFILLMENT_STATUS_VALUES?.map((option) => (
                <CommandItem
                  key={option}
                  value={option} // to avoid selecting two or more items that has the same name proprty.
                  onSelect={() => {
                    setValue(option)
                    setOpen(false)
                  }}
                  className="gap-2"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-2">
                    <SupplierStatusBadge
                      supplierStatus={option}
                      className="py-[.1rem]"
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
