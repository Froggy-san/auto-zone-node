import React, { useEffect } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { Button } from "@components/ui/button";
import Spinner from "@components/Spinner";
import { DateRange } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@components/ui/popover";
import { Ban, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@components/ui/calendar";
import { cn } from "@lib/utils";
import { Client } from "@lib/types";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import { Input } from "@components/ui/input";

interface Props {
  open: boolean;
  handleClose: () => void;
  client: Client;
}

const BanClient = ({ open, handleClose, client }: Props) => {
  const [date, setDate] = React.useState<DateRange | undefined>({
    to: undefined,
    from: undefined,
  });

  useEffect(() => {
    const body = document.querySelector("body");

    if (body) {
      body.style.pointerEvents = "auto";
    }
    return () => {
      if (body) body.style.pointerEvents = "auto";
    };
  }, [open]);
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] border-none">
        <DialogHeader>
          <DialogTitle>Ban user.</DialogTitle>
          <DialogDescription>
            Ban a user from using the website..
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={() => {}} className="  space-y-5 ">
          <div className=" space-y-2  text-xs p-2 text-center border bg-accent/20 rounded-xl">
            {client.picture ? (
              <img
                src={client.picture}
                className=" w-24 h-24 rounded-full object-cover mx-auto"
              />
            ) : null}
            <p>Name: {client.name}</p>
            <p>Email: {client.email}</p>
          </div>
          <div>
            <Label>Reason</Label>
            <Textarea />
          </div>

          <div className=" space-y-2">
            <Label>Duration</Label>
            <div className="grid gap-2 w-full  ">
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
          </div>
          <div className="  flex  flex-col-reverse    gap-2 ">
            <DialogClose asChild>
              <Button size="sm" variant="secondary" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button size="sm" type="submit">
              {false ? <Spinner className=" h-full" /> : "Confrim"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BanClient;
