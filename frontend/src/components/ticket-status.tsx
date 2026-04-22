"use client";
import CloseButton from "@components/close-button";
import { Badge } from "@components/ui/badge";
import { TicketStatus as TicketStatusType } from "@lib/types";
import { cn } from "@lib/utils";
import React, { useState } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "./ui/button";
import { useToast } from "@hooks/use-toast";
import SuccessToastDescription, { ErorrToastDescription } from "./toast-items";
import { deleteTicketStatusAction } from "@lib/actions/ticket-status-actions";
import Spinner from "./Spinner";
import StatusForm from "./dashboard/tickets/status-form";
const TicketStatus = ({
  ticketStatus,
  className,
  admin,
}: {
  ticketStatus: TicketStatusType;
  className?: string;
  admin?: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const { toast } = useToast();

  async function handleDelete() {
    try {
      setIsLoading(true);

      const { error } = await deleteTicketStatusAction(ticketStatus.id);
      if (error) throw new Error(error);
      toast({
        className: "bg-primary  text-primary-foreground",
        title: "Done.",
        description: (
          <SuccessToastDescription message="Ticket status has been deleted." />
        ),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: <ErorrToastDescription error={error.message} />,
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (ticketStatus.description)
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              onClick={() => setEditOpen(true)}
              className={cn(
                "   text-xs select-none w-fit font-semibold flex items-center justify-center gap-1  px-2.5 py-[0.15rem]  whitespace-nowrap text-center rounded-[10px] bg-primary text-primary-foreground  transition-all",

                {
                  "bg-dashboard-blue text-dashboard-text-blue":
                    ticketStatus.name.toLowerCase() === "in progress",
                  "  bg-dashboard-orange text-dashboard-text-orange ":
                    ticketStatus.name.toLowerCase() ===
                    "awaiting client's response",
                  " text-red-800  dark:text-red-200  bg-destructive/70":
                    ticketStatus.name.toLowerCase() === "closed",
                  " bg-dashboard-green text-dashboard-text-green":
                    ticketStatus.name.toLowerCase() === "solved",
                },
                className
              )}
            >
              {ticketStatus.name}

              {admin &&
                (isLoading ? (
                  <Spinner className=" h-4 w-4" />
                ) : (
                  <CloseButton
                    className=" static"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpen(true);
                    }}
                  />
                ))}

              {admin && (
                <div onClick={(e) => e.stopPropagation()}>
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently
                          delete the status badge from the database.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className=" gap-y-2">
                        <DialogClose>
                          <Button variant="secondary" size="sm">
                            Close
                          </Button>
                        </DialogClose>
                        <Button
                          size="sm"
                          disabled={isLoading}
                          onClick={handleDelete}
                        >
                          Confirm
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <StatusForm
                    showBtn={false}
                    statusToEdit={ticketStatus}
                    isOpen={editOpen}
                    setIsOpen={setEditOpen}
                  />
                </div>
              )}
            </div>
          </TooltipTrigger>

          <TooltipContent>
            <p>{ticketStatus.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  return (
    <div
      onClick={() => setEditOpen(true)}
      className={cn(
        "   text-xs select-none w-fit font-semibold flex items-center justify-center gap-1  px-2.5 py-[0.15rem]  whitespace-nowrap text-center rounded-[10px] bg-primary text-primary-foreground  transition-all",

        {
          "bg-dashboard-blue text-dashboard-text-blue":
            ticketStatus.name.toLowerCase() === "in progress",
          "  bg-dashboard-orange text-dashboard-text-orange ":
            ticketStatus.name.toLowerCase() === "awaiting client's response",
          " text-red-800  dark:text-red-200  bg-destructive/70":
            ticketStatus.name.toLowerCase() === "closed",
          " bg-dashboard-green text-dashboard-text-green":
            ticketStatus.name.toLowerCase() === "solved",
        },
        className
      )}
    >
      {ticketStatus.name}

      {admin &&
        (isLoading ? (
          <Spinner className=" h-4 w-4" />
        ) : (
          <CloseButton
            className=" static"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
          />
        ))}

      {admin && (
        <div onClick={(e) => e.stopPropagation()}>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete the
                  status badge from the database.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className=" gap-y-2">
                <DialogClose>
                  <Button variant="secondary" size="sm">
                    Close
                  </Button>
                </DialogClose>
                <Button size="sm" disabled={isLoading} onClick={handleDelete}>
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <StatusForm
            showBtn={false}
            statusToEdit={ticketStatus}
            isOpen={editOpen}
            setIsOpen={setEditOpen}
          />
        </div>
      )}
    </div>
  );
};

export default TicketStatus;
