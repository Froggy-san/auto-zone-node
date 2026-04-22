import CloseButton from "@components/close-button";
import HoverPopCard from "@components/hover-pop-card";
import InfiniteClientsList from "@components/infinite-clients-list";
import { Button } from "@components/ui/button";
import { Calendar } from "@components/ui/calendar";
import { Input } from "@components/ui/input";
import { Client, PaymentMethod } from "@lib/types";
import { cn } from "@lib/utils";
import { formatDate } from "date-fns";
import {
  ArrowDownNarrowWide,
  ArrowUpWideNarrow,
  CalendarDays,
  CalendarPlus,
  Search,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { DateRange } from "react-day-picker";
import { PiPerson } from "react-icons/pi";
import { z } from "zod";

interface FiltersProps {
  isToday?: boolean;
  searchTerm: string;
  selectedClient?: Client | null;
  createdAtDate?: DateRange;
  pickupDate?: DateRange;
  sortBy: "asc" | "desc" | string;
  selectedMethodIndx: number | null;
  setSelectedMethodIndx: (index: number | null) => void;
  setSortBy: (sort: "asc" | "desc" | string) => void;
  setSearchterm: (term: string) => void;
  setSelectedClient?: (client: Client | null) => void;
  setCreatedAtDate?: (createdAtDate: DateRange | undefined) => void;
  setPickupDate?: (pickupDate: DateRange | undefined) => void;
}

const PAYMENT_MTHOD: z.infer<typeof PaymentMethod>[] = ["card", "cod"];
function OrderFilters({
  isToday = false,
  searchTerm,
  setSearchterm,
  selectedClient,
  sortBy,
  setSortBy,
  setSelectedClient,
  createdAtDate,
  setCreatedAtDate,
  pickupDate,
  setPickupDate,
  selectedMethodIndx,
  setSelectedMethodIndx,
}: FiltersProps) {
  const [isClientOpen, setClientOpen] = React.useState(false);
  const [isCreatedDateOpen, setIsCreatedDateOpen] = React.useState(false);
  const [isPickDateOpen, setIsPickDateOpen] = React.useState(false);
  const [isShowSearch, setIsShowSearch] = useState(false);

  const [isCategoryOpen, setCategoryOpen] = React.useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const categoryInputRef = useRef<HTMLInputElement>(null);
  const clientInputRef = useRef<HTMLInputElement>(null);
  const isThereSelectedClient = selectedClient !== null;
  const selectedMethod =
    selectedMethodIndx !== null ? PAYMENT_MTHOD[selectedMethodIndx] : null;

  useEffect(() => {
    if (isClientOpen) {
      if (clientInputRef) {
        setTimeout(() => {
          clientInputRef.current?.focus();
        }, 100);
      }
    }
    if (isCategoryOpen) {
      if (categoryInputRef) {
        setTimeout(() => {
          categoryInputRef.current?.focus();
        }, 100);
      }
    }
  }, [isClientOpen, isCategoryOpen]);

  return (
    <div className=" relative  flex items-center justify-center sm:justify-between   w-fit mx-auto sm:w-[95%] gap-1 px-1.5 sm:px-4 py-1.5   rounded-full  border border-border/70 shadow-md ">
      {" "}
      <div className=" flex items-center  gap-1">
        <HoverPopCard
          open={isClientOpen}
          onOpenChange={setClientOpen}
          className="   sm:w-80"
          trigger={
            <Button
              variant="outline"
              className={cn(
                " p-1 w-7 h-7",
                isThereSelectedClient && "bg-accent",
              )}
            >
              <PiPerson className=" w-5 h-5" />
            </Button>
          }
          content={
            <InfiniteClientsList
              ref={clientInputRef}
              setOpen={setClientOpen}
              selectedClient={selectedClient}
              onVlaueChange={setSelectedClient}
            />
          }
        />
        {/* Created at filter ------ */}
        <HoverPopCard
          open={isCreatedDateOpen}
          onOpenChange={setIsCreatedDateOpen}
          className="w-auto p-0 max-h-[50vh] overflow-y-auto"
          trigger={
            <Button
              variant="outline"
              className=" py-1 px-1 xs:px-2 w-7 xs:w-fit h-7 text-[13px] items-center text-sm gap-1  "
            >
              <span className=" hidden xs:inline"> Created At </span>
              <CalendarPlus className=" w-4 h-4 mb-[1px] xs:text-muted-foreground" />
            </Button>
          }
          content={
            <>
              <Calendar
                className=" !text-xs"
                initialFocus
                mode="range"
                defaultMonth={createdAtDate?.from}
                selected={createdAtDate}
                onSelect={setCreatedAtDate}
                numberOfMonths={2}
              />
              <div className=" px-4 py-2 text-center">
                {createdAtDate?.from ? (
                  createdAtDate.to ? (
                    <>
                      {formatDate(createdAtDate.from, "LLL dd, y")} -{" "}
                      {formatDate(createdAtDate.to, "LLL dd, y")}
                    </>
                  ) : (
                    formatDate(createdAtDate.from, "LLL dd, y")
                  )
                ) : (
                  <span>Date of order creation</span>
                )}
              </div>
            </>
          }
        />
        {/* Created at filter ------ */}
        {/* Pick up date filter ------ */}
        {!isToday && (
          <HoverPopCard
            open={isPickDateOpen}
            onOpenChange={setIsPickDateOpen}
            className="w-auto p-0 max-h-[50vh] overflow-y-auto"
            trigger={
              <Button
                variant="outline"
                className=" py-1 px-1 xs:px-2 w-7 xs:w-fit h-7 text-[13px] items-center text-sm gap-1  "
              >
                <span className=" hidden xs:inline"> Pick-up </span>
                <CalendarDays className="  w-4 h-4 mb-[1px] xs:text-muted-foreground" />
              </Button>
            }
            content={
              <>
                <Calendar
                  className=" !text-xs"
                  initialFocus
                  mode="range"
                  defaultMonth={pickupDate?.from}
                  selected={pickupDate}
                  onSelect={setPickupDate}
                  numberOfMonths={2}
                />
                <div className=" px-4 py-2 text-center">
                  {pickupDate?.from ? (
                    pickupDate.to ? (
                      <>
                        {formatDate(pickupDate.from, "LLL dd, y")} -{" "}
                        {formatDate(pickupDate.to, "LLL dd, y")}
                      </>
                    ) : (
                      formatDate(pickupDate.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Date of the pick up</span>
                  )}
                </div>
              </>
            }
          />
        )}
        {/* Pick up date filter ------ */}
      </div>
      <Button
        onClick={() => {
          if (
            selectedMethodIndx !== null &&
            selectedMethodIndx >= PAYMENT_MTHOD.length - 1
          )
            setSelectedMethodIndx(null);
          else
            setSelectedMethodIndx(
              selectedMethodIndx !== null ? selectedMethodIndx + 1 : 0,
            );
        }}
        variant="outline"
        className={cn(
          " py-0  px-2 h-7 text-[12px]    items-center  gap-1 w-fit ",
          selectedMethod && " bg-accent",
        )}
      >
        {selectedMethod ? selectedMethod.toUpperCase() : "Method"}{" "}
      </Button>
      <div
        className={cn(
          // Base Mobile Styles (Hidden/Absolute)
          "absolute left-1/2 -translate-x-1/2 w-0 opacity-0 pointer-events-none blur-sm transition-all duration-300 h-7 bg-background rounded-md  border ",

          // Base Desktop Styles (Reset to flow)
          "sm:static sm:left-auto sm:translate-x-0 sm:w-full sm:opacity-100 sm:pointer-events-auto sm:blur-0",

          {
            // Mobile "Show" State
            "w-[98%] opacity-100 !blur-0 pointer-events-auto": isShowSearch,

            // Desktop "Show" State (Force it to remain static/normal)
            "sm:w-full sm:static sm:translate-x-0": isShowSearch,
          },
          // Pass through external classes if needed
        )}
      >
        <Input
          ref={inputRef}
          value={searchTerm}
          onChange={(e) => setSearchterm(e.target.value)}
          placeholder={"Filter through orders..."}
          className="  pr-3 h-full"
        />
        <CloseButton
          onClick={() => setIsShowSearch(false)}
          className=" right-2 top-1/2 sm:hidden  -translate-y-1/2"
        />
      </div>
      <Button
        onClick={() => {
          setIsShowSearch((is) => !is);
          inputRef.current?.focus();
        }}
        variant="outline"
        className={cn(
          " p-1 sm:hidden w-7 h-7 b",
          searchTerm.length && "  bg-accent   ",
        )}
      >
        <Search className=" w-5 h-5" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className=" gap-1  w-fit px-2 py-1 text-[12px] xs:text-xs  h-7"
        onClick={() => {
          setSortBy(sortBy === "asc" ? "desc" : "asc");
        }}
      >
        {" "}
        {sortBy === "desc" || !sortBy ? (
          <>
            <span>Desc</span>
            <ArrowDownNarrowWide className=" w-3 h-3 sm:w-4 sm:h-4" />
          </>
        ) : (
          <>
            <span>Asc</span>{" "}
            <ArrowUpWideNarrow className=" w-3 h-3 sm:w-4 sm:h-4" />
          </>
        )}{" "}
      </Button>
    </div>
  );
}

export default OrderFilters;
