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
import { CarMaker } from "@lib/types";

interface CarModelComboBoxProps {
  setValue: (carMaker: number) => void;
  value: number;
  options: CarMaker[];
  disabled?: boolean;
}

export const MakerCombobox: React.FC<CarModelComboBoxProps> = ({
  setValue,
  value,
  options,
  disabled,
}) => {
  const [open, setOpen] = React.useState(false);
  // const [value, setValue] = React.useState(0);

  const selectedItem = options?.find((option) => option.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          role="CarModelComboBox"
          aria-expanded={open}
          className=" w-full justify-between h-fit"
        >
          {selectedItem ? (
            <>
              <p className="text-wrap break-all text-left pr-2">
                {" "}
                Maker: {selectedItem.name}
              </p>
              <span className=" ml-auto">
                {selectedItem.logo ? (
                  <img
                    src={selectedItem.logo}
                    alt="logo"
                    className="   min-w-6 min-h-6   w-6 h-6 rounded-md   object-cover"
                  />
                ) : (
                  "Logo"
                )}
              </span>
            </>
          ) : (
            "Select option..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="      p-0">
        <Command className=" max-h-[30vh] sm:max-h-[500px]">
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
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>Maker: {option.name}</span>{" "}
                  <span className=" ml-auto">
                    {option.logo ? (
                      <img
                        src={option.logo}
                        alt="logo"
                        className=" w-6 h-6 rounded-md"
                      />
                    ) : (
                      "Logo"
                    )}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
