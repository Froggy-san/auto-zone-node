"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Badge } from "@components/ui/badge";
import { ServiceStatus } from "@lib/types";
import { cn } from "@lib/utils";
import React, { SetStateAction, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@hooks/use-toast";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";
import { deleteServiceStatus } from "@lib/actions/serviceStatusAction";
import Spinner from "@components/Spinner";
import { Cross2Icon } from "@radix-ui/react-icons";
import StatusFormDialog from "./insert-data/status-form-dialog";
import { RiCircleLine, RiProgress3Line, RiProgress4Line } from "react-icons/ri";

import { useTheme } from "next-themes";
import {
  CircleCheck,
  CircleCheckBig,
  CircleDashed,
  Clock4,
  ClockAlert,
} from "lucide-react";
type Status =
  | "Pending"
  | "InProgress"
  | "Done"
  | "Canceled"
  | string
  | undefined;
const StatusBadge = ({
  // theme = "dark",
  disableToolTip = false,
  controls = false,
  className,
  status,
}: {
  // theme: string;
  disableToolTip?: boolean;
  className?: string;
  status: ServiceStatus;
  controls?: boolean;
}) => {
  const { theme } = useTheme();

  const prefered = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

  const [isEditing, setisEditing] = useState(false);
  const [isLoading, setisLoading] = useState(false);

  const chosenTheme = theme === "system" ? prefered : theme;
  const darkModelColor = JSON.parse(status.colorDark);
  const lightModeColor = JSON.parse(status.colorLight);
  const isNotDarkColor = Object.values(darkModelColor).every(
    (item) => item === 0
  );
  const isNotLightColor = Object.values(lightModeColor).every(
    (item) => item === 0
  );

  // console.log(isNotDarkColor, isNotLightColor);
  // const light = `hsl(${lightModeColor.h} ${lightModeColor.s} ${lightModeColor.l})`;
  // const dark = `hsl(${darkModelColor.h} ${darkModelColor.s} ${darkModelColor.l})`;
  return (
    <>
      {
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                onClick={() => {
                  if (controls) setisEditing((is) => !is);
                }}
                className={cn(
                  "text-xs select-none w-fit font-semibold flex items-center justify-center gap-1  px-2.5 py-[0.15rem]  whitespace-nowrap text-center rounded-full bg-primary text-primary-foreground  transition-all",

                  {
                    "bg-dashboard-blue text-dashboard-text-blue":
                      status.name.toLowerCase() === "pending",
                    "  bg-dashboard-orange text-dashboard-text-orange ":
                      status.name.toLowerCase() === "in progress",
                    " text-red-800  dark:text-red-200  bg-destructive/70":
                      status.name.toLowerCase() === "canceled",
                    " bg-dashboard-green text-dashboard-text-green":
                      status.name.toLowerCase() === "done",
                  },
                  className
                )}
                style={{
                  backgroundColor:
                    !isNotLightColor && chosenTheme === "light"
                      ? `hsla(${lightModeColor?.h}, ${lightModeColor?.s}%, ${lightModeColor?.l}%, 0.4)`
                      : !isNotDarkColor && chosenTheme === "dark"
                      ? `hsl(${darkModelColor?.h}, ${darkModelColor?.s}%, ${darkModelColor?.l}%)`
                      : "  primary ",

                  color:
                    !isNotLightColor && chosenTheme === "light"
                      ? `hsl(${lightModeColor?.h}, ${
                          lightModeColor?.s + 90
                        }%, ${lightModeColor?.l - 33}%)`
                      : !isNotDarkColor && chosenTheme === "dark"
                      ? `hsla(${darkModelColor?.h}, ${
                          darkModelColor?.s + 55
                        }%, ${darkModelColor?.l + 55}%)`
                      : "  primary-foreground",
                }}
              >
                {status.name.toLocaleLowerCase() == "in progress" && (
                  <RiProgress4Line className=" w-4 h-4" />
                )}
                {status.name.toLocaleLowerCase() == "pending" && (
                  <Clock4 className=" w-4 h-4" />
                )}
                {status.name.toLocaleLowerCase() == "canceled" && (
                  <RiCircleLine className=" w-4 h-4" />
                )}
                {status.name.toLocaleLowerCase() == "done" && (
                  // <CircleCheckBig className=" w-4 h-4" />
                  <CircleCheck className=" w-4 h-4" />
                )}
                {status.name}
                {controls ? (
                  <DeleteBtn
                    item={status}
                    isDeleting={isLoading}
                    setIsDeleting={setisLoading}
                  />
                ) : null}
              </div>
            </TooltipTrigger>
            {status.description && !disableToolTip && (
              <TooltipContent>
                <p>{status.description}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      }

      {controls ? (
        <StatusFormDialog
          open={isEditing}
          setOpen={setisEditing}
          statusToEdit={status}
        />
      ) : null}
    </>
  );
};

function DeleteBtn({
  item,
  isDeleting,
  setIsDeleting,
  handleResetPage,
}: {
  item: ServiceStatus;
  handleResetPage?: () => void;
  isDeleting: boolean;
  setIsDeleting: React.Dispatch<SetStateAction<boolean>>;
}) {
  const { toast } = useToast();
  // const { deleteCargeneration, isDeleting } = useDeleteCarGenerations();

  const [open, setOpen] = useState(false);

  const handleDelete = useCallback(async () => {
    try {
      setIsDeleting(true);
      const {} = await deleteServiceStatus(item.id);
      setOpen(false);
      handleResetPage?.();

      toast({
        className: "bg-primary  text-primary-foreground",
        title: "Data deleted.",
        description: (
          <SuccessToastDescription
            message={`Service status has been deleted.`}
          />
        ),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Something went wrong.",
        description: <ErorrToastDescription error={error.message} />,
      });
    } finally {
      setIsDeleting(false);
    }
  }, [item]);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className=" flex items-center justify-center"
    >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="  rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground  -mr-1">
            {isDeleting ? (
              <Spinner className=" h-full" size={14} />
            ) : (
              <Cross2Icon className="h-3 w-3" />
            )}
            {/* <span className="sr-only">Close</span> */}
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] border-none">
          <DialogHeader>
            <DialogTitle>
              You are about to delete a status badge &apos;{item.name}&apos;.
            </DialogTitle>
            <DialogDescription>
              This action can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="   gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button size="sm" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => handleDelete()}
            >
              {isDeleting ? <Spinner className=" h-full" /> : "Confrim"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StatusBadge;
