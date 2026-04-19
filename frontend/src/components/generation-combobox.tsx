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
import { CarGenerationProps } from "@lib/types";

interface CarModelComboBoxProps {
  setValue: (carGeneration: number) => void;
  value: number;
  disabled?: boolean;
  options: CarGenerationProps[];
}

export const GenerationComboBox: React.FC<CarModelComboBoxProps> = ({
  setValue,
  value,
  disabled,
  options,
}) => {
  const [open, setOpen] = React.useState(false);
  // const [value, setValue] = React.useState(0);

  const selectedItem = options.find((option) => option.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          role="CarModelComboBox"
          aria-expanded={open}
          className=" w-full  h-fit justify-between"
        >
          {selectedItem ? (
            <p className=" text-wrap break-all text-left ">
              Generation name: {selectedItem.name} / Car Model:{" "}
              {selectedItem.carModel ? selectedItem.carModel : "None"}{" "}
            </p>
          ) : (
            "Select option..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="    p-0">
        <Command className="">
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
                  <div className="text-wrap break-all">
                    Generation name: {option.name} Car Model:{" "}
                    {option.carModel ? option.carModel : "None"}
                  </div>{" "}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
