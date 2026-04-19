"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CarInfoProps,
  Product,
  ProductWithCategory,
  RestockingBill,
  ServiceStatus,
} from "@lib/types";
import { DEFAULT_CAR_LOGO } from "@lib/constants";
import StatusBadge from "./dashboard/status-badge";

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
  setValue: React.Dispatch<React.SetStateAction<number>>;
  value: number;
  options: ServiceStatus[];
  disabled?: boolean;
  className?: string;
}

export const ServiceStatusCombobox: React.FC<ComboBoxProps> = ({
  setValue,
  value,
  options,
  className,
  disabled,
}) => {
  const [open, setOpen] = React.useState(false);
  // const [value, setValue] = React.useState(0);
  const selected = options.find((option) => option.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full   justify-between   h-fit ", className)}
        >
          {selected ? (
            <div className=" flex max-w-full   items-center gap-2">
              Status:{" "}
              <StatusBadge
                status={selected}
                className=" py-[.1rem] text-wrap"
                key={selected.id}
              />
            </div>
          ) : (
            "Select status..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className=" max-h-[30vh] sm:h-[unset]  w-[300px] sm:w-[400px]   p-0">
        <Command>
          <CommandInput placeholder="Search option..." />
          <CommandList>
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              {options?.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.name + String(option.id)} // to avoid selecting two or more items that has the same name proprty.
                  onSelect={() => {
                    setValue(option.id === value ? 0 : option.id);
                    setOpen(false);
                  }}
                  className="gap-2"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="  flex items-center gap-2 ">
                    Status:{" "}
                    <StatusBadge status={option} className=" py-[.1rem]" />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
