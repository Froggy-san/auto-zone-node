"use client";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DateRange } from "react-day-picker";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TicketStatus as TicketStatusType } from "@lib/types";
import { cn } from "@lib/utils";
import TicketStatus from "./ticket-status";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import {
  ArrowDownNarrowWide,
  ArrowUpWideNarrow,
  CalendarIcon,
  RotateCcw,
} from "lucide-react";
import { formatDate } from "date-fns";
import { Calendar } from "./ui/calendar";
import { Input } from "./ui/input";
interface SearchProps {
  isAdmin: boolean;
  isClient?: boolean;
  currPage: string;
  dateFrom: string;
  dateTo: string;
  sort: "asc" | "desc" | string;
  ticketStatusId: string;
  status: TicketStatusType[];
  name: string;
  className?: string;
}
const TicketTableOperations = ({
  isAdmin,
  currPage,
  dateTo,
  dateFrom,
  status,
  sort,
  ticketStatusId,
  name,
  className,
}: SearchProps) => {
  const initalValus = {
    dateFrom: dateFrom ? new Date(dateFrom) : undefined,
    dateTo: dateTo ? new Date(dateTo) : undefined,
    name,
    statusId: ticketStatusId || undefined,
    sort,
  };

  const [nameValue, setNameValue] = useState(initalValus.name || "");
  const [open, setOpen] = React.useState(false);
  const [sortBy, setSortBy] = useState<"asc" | "desc" | string>(
    initalValus.sort
  );
  const [statusId, setStatusId] = useState<string | undefined>(
    initalValus.statusId
  );
  const [step, setStep] = useState(50);
  const [date, setDate] = React.useState<DateRange | undefined>({
    to: initalValus.dateTo,
    from: initalValus.dateFrom,
  });

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const page = Number(currPage);
  const params = new URLSearchParams(searchParams);
  function handleReset() {
    setStatusId(undefined);
    setDate(undefined);
    setNameValue("");
  }

  useEffect(() => {
    if (!sortBy) return;
    params.set("sort", sortBy);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [sortBy]);

  async function handleSub() {
    // const name = nameValue.trim();
    const dateFrom = date?.from;
    const dateTo = date?.to;
    // const params = new URLSearchParams(searchParams);

    if (page > 1) params.set("page", String(page - 1));

    if (!nameValue) {
      params.delete("name");
    } else {
      params.set("name", String(nameValue));
    }

    if (!statusId) {
      params.delete("ticketStatusId");
    } else {
      params.set("ticketStatusId", String(statusId));
    }

    if (!dateFrom) {
      params.delete("dateFrom");
    } else {
      params.set("dateFrom", new Date(dateFrom).toISOString());
    }

    if (!dateTo) {
      params.delete("dateTo");
    } else {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      params.set("dateTo", toDate.toISOString());
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setOpen(false);
  }

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div className=" flex items-center  gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          className={cn("block ml-auto w-full   sm:w-[250px]", className)}
        >
          <div className="text-sm border text-muted-foreground  flex items-center gap-2  py-1 px-2  rounded-sm  justify-between    ">
            Search...{" "}
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1  border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 rounded-md">
              <span className="text-xs">⌘</span>k
            </kbd>
          </div>
        </DialogTrigger>
        <DialogContent className="max-h-[75vh] overflow-y-auto sm:max-w-[425px] border-none ">
          <DialogHeader>
            <DialogTitle>Ticket filters</DialogTitle>
            <DialogDescription>
              Filter through all the tickets made.
            </DialogDescription>
          </DialogHeader>
          <form action={handleSub} className=" space-y-3">
            <div className=" space-y-2 mb-auto w-full   ">
              <Select
                key={statusId}
                value={statusId}
                onValueChange={(value) => {
                  setStatusId(value);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Ticket Status" />
                </SelectTrigger>
                <SelectContent>
                  {status.length ? (
                    status.map((status) => (
                      <SelectItem key={status.id} value={`${status.id}`}>
                        <TicketStatus
                          ticketStatus={status}
                          className=" text-wrap"
                        />
                      </SelectItem>
                    ))
                  ) : (
                    <p className=" text-muted-foreground text-center w-full">
                      No ticket status
                    </p>
                  )}
                </SelectContent>
              </Select>
              <p className=" text-xs text-muted-foreground">
                Search by service status.
              </p>
            </div>

            <div className={cn("grid  w-full   space-y-2")}>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    type="button"
                    className={cn(
                      "  justify-start text-left font-normal whitespace-normal break-all   text-xs gap-3",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {formatDate(date.from, "LLL dd, y")} -{" "}
                          {formatDate(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        formatDate(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              <p className=" text-xs text-muted-foreground">Search by Date.</p>
            </div>

            <div className=" space-y-2 w-full ">
              <Input
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                placeholder="Client's name..."
                className=""
              />
              <p className=" text-xs text-muted-foreground">
                Search by client&apos;s name.
              </p>
            </div>

            <div className=" flex flex-col-reverse gap-2 mt-4">
              <DialogClose
                className="inline-flex items-center justify-center whitespace-nowrap  font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 rounded-md px-3 text-xs
              
              bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80"
              >
                Cancel
                {/* <Button
                variant="secondary"
                size="sm"
                type="button"
                className=" w-full"
                >
                Cancel */}
                {/* </Button> */}
              </DialogClose>
              <Button type="submit" size="sm">
                Search...
              </Button>
              <Button
                onClick={handleReset}
                type="button"
                className=" p-0 h-6 w-6  ml-auto hidden sm:flex   left-1 bottom-2"
                variant="outline"
              >
                <RotateCcw className=" w-4 h-4" />
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Button
        variant="outline"
        size="sm"
        className=" gap-1"
        onClick={() =>
          setSortBy((sort) => {
            const newSort = sort === "desc" || !sort ? "asc" : "desc";

            return newSort;
          })
        }
      >
        {" "}
        {sortBy === "desc" || !sortBy ? (
          <>
            <span>Desc</span>
            <ArrowDownNarrowWide className=" w-4 h-4" />
          </>
        ) : (
          <>
            <span>Asc</span> <ArrowUpWideNarrow className=" h-4 w-4" />
          </>
        )}{" "}
      </Button>
    </div>
  );
};

// () => {
//   return (
//     <div>
//       <Select>
//         <SelectTrigger className="w-[180px]">
//           <SelectValue placeholder="Sort" />
//         </SelectTrigger>
//         <SelectContent>
//           <SelectItem value="light">Light</SelectItem>
//           <SelectItem value="dark">Dark</SelectItem>
//           <SelectItem value="system">System</SelectItem>
//         </SelectContent>
//       </Select>
//     </div>
//   );
// };

export default TicketTableOperations;
