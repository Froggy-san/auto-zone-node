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
import { CarInfoProps, ClientWithPhoneNumbers } from "@lib/types";
import { DEFAULT_CAR_LOGO } from "@lib/constants";

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

interface ClientsComboBoxProps {
  setValue: React.Dispatch<React.SetStateAction<number>>;
  value: number;
  options: ClientWithPhoneNumbers[];
  disabled?: boolean;
}

export const ClientsComboBox: React.FC<ClientsComboBoxProps> = ({
  setValue,
  value,
  options,
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
          className=" w-full   justify-between   h-fit "
        >
          {selected ? (
            <p className=" text-wrap  text-left ">Name: {selected.name}</p>
          ) : (
            "Select client..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="   p-0">
        <Command className=" max-h-[30vh] sm:max-h-[500px]">
          <CommandInput placeholder="Search client..." />
          <CommandList>
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              {options?.map((option) => {
                const phones = option.phones.length
                  ? option.phones.map((phone) => phone.number)
                  : [];
                const phoneStirng = phones.length ? phones.join(" ") : "";

                return (
                  <CommandItem
                    key={option.id}
                    value={option.name + phoneStirng + String(option.id)} // to avoid selecting two or more items that has the same name proprty.
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
                    <p className=" break-all flex-1">Name: {option.name}</p>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
