import { TicketCategory } from "@lib/types";
import React from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check } from "lucide-react";
interface TicketCategoryListProps {
  ticketCategories?: TicketCategory[];
  value?: TicketCategory | null;
  className?: string;
  setOpen?: (open: boolean) => void;
  onSelect?: (category: TicketCategory | null) => void;
}

const TicketCategoryList = React.forwardRef<
  HTMLInputElement,
  TicketCategoryListProps
>(
  (
    {
      ticketCategories,
      value,
      onSelect,
      setOpen,
      className,
    }: TicketCategoryListProps,
    ref
  ) => {
    return (
      <Command className={className}>
        <CommandInput ref={ref} placeholder="Search ticket categories..." />
        <CommandList>
          <CommandEmpty>No ticket categories found.</CommandEmpty>
          <CommandGroup heading="Ticket Categories">
            {ticketCategories?.map((category) => (
              <CommandItem
                key={category.id}
                className="w-full  justify-between gap-2"
                value={`${category.name}-${category.id}`}
                onSelect={() => {
                  onSelect?.(value?.id === category.id ? null : category);
                  setOpen?.(false);
                }}
              >
                {category.name}{" "}
                {value?.id === category.id && (
                  <Check className=" ml-2 h-4 w-4" />
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    );
  }
);
export default TicketCategoryList;
TicketCategoryList.displayName = "TicketCategoryList";
