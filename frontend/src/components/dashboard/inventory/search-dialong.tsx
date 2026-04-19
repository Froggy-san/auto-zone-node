"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RotateCcw, Search } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";

import { CalendarIcon } from "@radix-ui/react-icons";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import Box from "@mui/joy/Box";
import Slider from "@mui/joy/Slider";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@hooks/use-toast";
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en", { style: "currency", currency: "egp" }).format(
    value
  );
function valueText(value: any) {
  return `price range ${value}`;
}

interface SearchProps {
  currPage: string;
  shopName: string;
  name: string;
  dateOfOrderFrom: string;
  dateOfOrderTo: string;
  minTotalPrice: string;
  maxTotalPrice: string;
}

const SearchDialog = ({
  currPage,
  shopName,
  name,
  dateOfOrderFrom,
  dateOfOrderTo,
  minTotalPrice,
  maxTotalPrice,
}: SearchProps) => {
  const initalValus = {
    minTotalPrice: Number(minTotalPrice) || 0,
    maxTotalPrice: Number(maxTotalPrice) || 0,
    name,
    shopName,
    dateOfOrderFrom: dateOfOrderFrom ? new Date(dateOfOrderFrom) : undefined,
    dateOfOrderTo: dateOfOrderTo ? new Date(dateOfOrderTo) : undefined,
  };
  const rangeValues = [initalValus.minTotalPrice, initalValus.maxTotalPrice];
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [nameValue, setNameValue] = useState(initalValus.shopName);
  const [proName, setProName] = useState(initalValus.name || "");
  const [step, setStep] = useState(50);
  const [date, setDate] = React.useState<DateRange | undefined>({
    to: initalValus.dateOfOrderTo,
    from: initalValus.dateOfOrderFrom,
  });

  const [value, setValue] = React.useState(rangeValues);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const page = Number(currPage);

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (/^\d*$/.test(inputValue)) {
      const newMinPrice = Number(inputValue);
      if (newMinPrice <= value[1]) {
        setValue([newMinPrice, value[1]]);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid value",
          description: `Min total price must be lower than ${value[1]}`,
        });
      }
    }
  };

  function handleReset() {
    setNameValue("");
    setStep(50);
    setDate(undefined);
    setValue([0, 0]);
  }
  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (/^\d*$/.test(inputValue)) {
      const newMaxPrice = Number(inputValue);
      if (newMaxPrice >= value[0]) {
        setValue([value[0], newMaxPrice]);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid value",
          description: `Max total price must be higher than ${value[0]}`,
        });
      }
    }
  };

  async function handleSub() {
    const name = nameValue.trim();
    const dateFrom = date?.from;
    const dateTo = date?.to;
    const minTotal = value[0];
    const maxTotalPrice = value[1];

    const params = new URLSearchParams(searchParams);

    if (page > 1) params.set("page", String(page - 1));

    if (!name.length) {
      params.delete("shopName");
    } else {
      params.set("shopName", name);
    }

    if (!proName.length) {
      params.delete("name");
    } else {
      params.set("name", proName);
    }

    if (!dateTo) {
      params.delete("dateOfOrderTo");
    } else {
      params.set("dateOfOrderTo", format(dateTo, "yyyy-MM-dd"));
    }

    if (!dateFrom) {
      params.delete("dateOfOrderFrom");
    } else {
      params.set("dateOfOrderFrom", format(dateFrom, "yyyy-MM-dd"));
    }

    if (!minTotal) {
      params.delete("minTotalPrice");
    } else {
      params.set("minTotalPrice", minTotal.toString());
    }
    if (!maxTotalPrice) {
      params.delete("maxTotalPrice");
    } else {
      params.set("maxTotalPrice", maxTotalPrice.toString());
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setOpen(false);
  }

  const handleChange = (event: Event, newValue: number | number[]) => {
    setValue(newValue as number[]);
  };

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="text-sm border text-muted-foreground mt-7  flex items-center gap-2  py-1 px-2  rounded-sm w-full  sm:w-[250px] justify-between   ml-auto">
          Search...{" "}
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1  border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 rounded-md">
            <span className="text-xs">⌘</span>k
          </kbd>
        </div>
      </DialogTrigger>
      <DialogContent className="max-h-[70vh] overflow-y-auto sm:max-w-[425px] border-none">
        <DialogHeader>
          <DialogTitle>Search for recipts</DialogTitle>
          <DialogDescription>Filter throught the inventory.</DialogDescription>
        </DialogHeader>
        <form action={handleSub}>
          <div className=" flex flex-wrap   gap-2 gap-y-3">
            <Input
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              className=" w-full sm:w-[48%]"
              placeholder="Shop name"
            />

            <div className={cn("grid gap-2 w-full   sm:w-[48%]")}>
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
                          {format(date.from, "LLL dd, y")} -{" "}
                          {format(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
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
            </div>
            <div className=" space-y-2 w-full sm:w-[48%]">
              <Input
                type="text"
                value={value[0]}
                onChange={handleMinPriceChange}
                placeholder="Min price"
                className=""
              />
              <p className=" text-xs text-muted-foreground">Min total price.</p>
            </div>
            <div className=" w-full sm:w-[48%] space-y-2">
              <Input
                type="text"
                value={value[1]}
                onChange={handleMaxPriceChange}
                placeholder="Max price"
              />
              <p className=" text-xs text-muted-foreground">Max total price.</p>
            </div>

            {/* <Input
              type="text"
              value={proName}
              onChange={(e) => setProName(e.target.value)}
              placeholder="Max price"
            /> */}
            <Box sx={{ width: "100%" }}>
              <Slider
                sx={{
                  "& .MuiSlider-rail": {
                    border: "none",
                    height: "2px",
                  },
                  "& .MuiSlider-track": {
                    backgroundColor: "hsl(var(--primary))", // Style the track
                    height: "2px",
                  },
                  "& .MuiSlider-thumb": {
                    backgroundColor: "hsl(var(--accent))",
                    border: "solid 1px  hsl(var(--border))",
                    "&:hover, &.Mui-active, &.Mui-focusVisible": {
                      boxShadow: "none", // Remove the box shadow on hover, focus, or active state
                      border: "none",
                      outline: "none",
                    },
                  },
                  "& .css-hayzob-JoySlider-thumb::before ": {
                    backgroundColor: "hsl(var(--accent))",
                    //   borderColor: "hsl(var(--border))",
                    border: "solid 1px  hsl(var(--border))",
                  },

                  "& .css-sl4hj6-JoySlider-valueLabel": {
                    background: "hsl(var(--background))",
                    color: "hsl(var(--muted-foreground))",

                    outline: "none",
                  },

                  "& .css-sl4hj6-JoySlider-valueLabel::before": {
                    color: "hsl(var(--background))",
                  },
                }}
                getAriaLabel={() => "Temperature range"}
                value={value}
                max={300000}
                step={step}
                onChange={handleChange}
                valueLabelDisplay="auto"
                getAriaValueText={valueText}
              />
              <Input
                type="text"
                value={step}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  if (/^\d*$/.test(inputValue)) {
                    const value = Number(inputValue);

                    setStep(value);
                  }
                }}
                placeholder="Max price"
                className=" w-10 h-7  p-1  pl-[.4rem]  ml-auto"
              />
            </Box>
            <div className=" flex items-center justify-between w-full flex-wrap gap-2">
              <div className=" flex items-center gap-3 flex-wrap text-[10px]">
                <div>
                  Min price:{" "}
                  <span className=" text-muted-foreground">
                    {formatCurrency(value[0])}
                  </span>
                </div>
                <div>
                  Max price:{" "}
                  <span className="  text-muted-foreground">
                    {formatCurrency(value[1])}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleReset}
                type="button"
                className=" p-0 h-6 w-6 "
                variant="outline"
              >
                <RotateCcw className=" w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className=" flex flex-col-reverse gap-2 mt-4">
            <DialogClose asChild>
              <Button
                variant="secondary"
                size="sm"
                type="button"
                className=" w-full"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" size="sm">
              Search...
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
