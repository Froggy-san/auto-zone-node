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
import { CarItem, ClientWithPhoneNumbers } from "@lib/types";

interface Props {
  setValue: React.Dispatch<React.SetStateAction<number>>;
  value: number;
  options: CarItem[];
  disabled?: boolean;
}

export const CarsComboBox: React.FC<Props> = ({
  setValue,
  value,
  options,
  disabled,
}) => {
  const [open, setOpen] = React.useState(false);
  // const [value, setValue] = React.useState(0);
  const selected = options.find((option) => option.id === value);
  const image =
    selected?.carImages.length &&
    (selected?.carImages.find((image) => image.isMain)?.imagePath ||
      selected?.carImages[0].imagePath);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className=" w-full   justify-between    h-fit "
        >
          {selected ? (
            <div className=" flex items-center gap-2 flex-wrap">
              Plate: {selected.plateNumber} /{" "}
              <div className=" flex items-center gap-2">
                {" "}
                Image:{" "}
                {image ? (
                  <img
                    src={image}
                    className="  max-w-7 max-h-[1.4rem] object-contain"
                    alt="Car image"
                  />
                ) : (
                  "-"
                )}
              </div>
            </div>
          ) : (
            "Select car..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className=" h-[30vh] sm:h-[unset]  w-[300px] sm:w-[400px]   p-0">
        <Command>
          <CommandInput placeholder="Search client..." />
          <CommandList>
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              {options?.map((option) => {
                // const phones = option.phoneNumbers.length
                //   ? option.phoneNumbers.map((phone) => phone.number)
                // //   : [];
                // const phoneStirng = phones.length ? phones.join(" ") : "";

                const optionImage =
                  option.carImages.length &&
                  (option?.carImages.find((image) => image.isMain)?.imagePath ||
                    option.carImages[0].imagePath);

                return (
                  <CommandItem
                    key={option.id}
                    value={option.plateNumber + String(option.id)}
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
                    <div className=" flex items-center gap-2  flex-wrap">
                      Plate: {option.plateNumber} /{" "}
                      <div className=" flex items-center gap-2 justify-between  flex-1">
                        {" "}
                        Image:{" "}
                        {optionImage ? (
                          <img
                            src={optionImage}
                            className=" max-w-7 max-h-7 object-contain"
                            alt="Car image"
                          />
                        ) : (
                          "-"
                        )}
                      </div>
                    </div>
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
