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

interface ComboBoxProps {
  setValue?: React.Dispatch<React.SetStateAction<number>>;
  setParam?: (number: number, name: string, initalValue: number) => void;
  paramName?: string;
  value: number;
  options: { id: number; name: string }[];
  disabled?: boolean;
}

export const ComboBox: React.FC<ComboBoxProps> = ({
  setValue,
  value,
  setParam,
  paramName,
  options,
  disabled,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className=" w-full  h-fit  justify-between"
        >
          <p className="text-wrap break-all text-left">
            {" "}
            {value
              ? options.find((option) => option.id === value)?.name
              : "Select option..."}
          </p>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="    p-0">
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
                    setValue?.(option.id === value ? 0 : option.id);
                    if (paramName) {
                      setParam?.(option.id, paramName, value);
                    }
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
