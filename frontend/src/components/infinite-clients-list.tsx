"use client";
import React, { useEffect } from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@lib/utils";
import { Client } from "@lib/types";
import useInfiniteClients from "@lib/queries/useInfiniteclients";
import Spinner from "./Spinner";
import { useInView } from "react-intersection-observer";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import useDebounce from "@hooks/use-debounce";
import { Check } from "lucide-react";

interface InfiniteClientsListProps {
  className?: string;
  selectedClient?: Client | null;
  setOpen?: (open: boolean) => void;

  onVlaueChange?: (client: Client | null) => void;
}
const InfiniteClientsList = React.forwardRef<
  HTMLInputElement,
  InfiniteClientsListProps
>(
  (
    {
      selectedClient,
      onVlaueChange,
      setOpen,
      className,
    }: InfiniteClientsListProps,
    inputRef
  ) => {
    const [name, setName] = React.useState("");
    const debouce = useDebounce(name, 500);
    const {
      isFetched,
      isFetching,
      isFetchingNextPage,
      fetchNextPage,
      hasNextPage,
      data,
      error,
    } = useInfiniteClients({ name: debouce });
    const { ref, inView } = useInView();

    const clients: Client[] = React.useMemo(() => {
      return data?.pages.flatMap((page) => page.clients) || [];
    }, [data]);

    useEffect(() => {
      if (!isFetchingNextPage && inView && hasNextPage) {
        fetchNextPage();
      }
    }, [inView, hasNextPage]);
    return (
      <Command className={cn(className)} shouldFilter={false}>
        <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
          <MagnifyingGlassIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Search Client..."
            className={cn(
              "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
          />
        </div>
        {isFetching && clients.length === 0 ? (
          <Spinner className="  h-10" size={30} />
        ) : (
          <CommandList>
            <CommandEmpty>No clients found.</CommandEmpty>
            <CommandGroup heading="Clients">
              {clients.map((client) => (
                <Item
                  key={client.id}
                  client={client}
                  setOpen={setOpen}
                  selectedClient={selectedClient}
                  onVlaueChange={onVlaueChange}
                />
              ))}
              <div ref={ref}>
                {isFetchingNextPage && (
                  <Spinner className=" static h-11 " size={20} />
                )}
              </div>
            </CommandGroup>
          </CommandList>
        )}
      </Command>
    );
  }
);

export default InfiniteClientsList;
InfiniteClientsList.displayName = "InfiniteClientsList";

function Item({
  client,
  setOpen,
  selectedClient,
  onVlaueChange,
}: {
  client: Client;
  setOpen?: (open: boolean) => void;
  selectedClient?: Client | null;
  onVlaueChange?: (client: Client | null) => void;
}) {
  const isSelected = selectedClient?.id === client.id;
  const initials = client.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <CommandItem
      value={`${client.name}-${client.id}`}
      onSelect={() => {
        onVlaueChange?.(isSelected ? null : client);
        setOpen?.(false);
      }}
    >
      <div className=" flex items-center gap-3 w-full  overflow-hidden   ">
        <Avatar className=" w-8 h-8">
          <AvatarImage src={client.picture || undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div className=" flex flex-col flex-1 ">
          <p className=" text-sm line-clamp-2">{client.name}</p>
          <p className=" text-xs text-muted-foreground     truncate-text   ">
            {client.email}
          </p>
        </div>
        {isSelected && (
          <div className=" ml-auto shrink-0 ">
            <Check className=" w-4 h-5" />
          </div>
        )}
      </div>
    </CommandItem>
  );
}
