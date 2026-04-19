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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EditCarGenerationForm } from "@components/edit-generation-form";
import Spinner from "@components/Spinner";
import { useToast } from "@hooks/use-toast";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";
import useDeleteCarGenerations from "@lib/queries/car-generation/useDeleteCarGenerations";
import { CarGenerationProps } from "@lib/types";
import { Cross2Icon } from "@radix-ui/react-icons";
import { NotepadText } from "lucide-react";

import React, { useState } from "react";
import { cn } from "@lib/utils";

const GenerationItem = ({
  className,
  item,
  handleResetPage,
}: {
  className?: string;
  handleResetPage?: () => void;
  item: CarGenerationProps;
}) => {
  return (
    <li
      className={cn(
        "w-full  sm:w-fit px-3 py-2 flex items-center gap-2  text-sm border rounded-lg",
        className
      )}
    >
      <EditCarGenerationForm item={item} />

      <div className=" flex items-center  gap-2">
        <NoteDialog disabled={!item.notes} item={item} />
        <DeleteBtn handleResetPage={handleResetPage} item={item} />
      </div>
    </li>
  );
};

function DeleteBtn({
  item,
  handleResetPage,
}: {
  handleResetPage?: () => void;
  item: CarGenerationProps;
}) {
  const { toast } = useToast();
  const { deleteGeneration, isDeleting } = useDeleteCarGenerations();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="  rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground  -mr-1">
          {isDeleting ? (
            <Spinner className=" h-full" size={14} />
          ) : (
            <Cross2Icon className="h-4 w-4" />
          )}
          {/* <span className="sr-only">Close</span> */}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-none">
        <DialogHeader>
          <DialogTitle>Delete car generation</DialogTitle>
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
            onClick={async () => {
              deleteGeneration(item.id, {
                onSuccess: () => {
                  setOpen(false);
                  handleResetPage?.();
                  toast({
                    className: "bg-primary  text-primary-foreground",
                    title: "Deleted.",
                    description: (
                      <SuccessToastDescription message="Car generation has been deleted." />
                    ),
                  });
                },
                onError: (error: any) => {
                  toast({
                    variant: "destructive",
                    title: "Something went wrong.",
                    description: (
                      <ErorrToastDescription error={error.message} />
                    ),
                  });
                },
              });
            }}
          >
            {isDeleting ? <Spinner className=" h-full" /> : "Confrim"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NoteDialog({
  item,
  disabled = false,
}: {
  item: CarGenerationProps;
  disabled?: boolean;
}) {
  return (
    <Dialog>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <button
                disabled={disabled}
                className="  flex items-center justify-center rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground  disabled:text-muted-foreground "
              >
                <NotepadText className="h-4 w-4" />
              </button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>View notes</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent
        className="sm:max-w-[500px]  max-h-[55vh]
        overflow-y-auto
      border-none"
      >
        <DialogHeader>
          <DialogTitle className=" break-all  pr-5">
            {item.name}&apos;s note.
          </DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4  overflow-hidden  text-center sm:text-left break-all">
          {item.notes}
        </div>

        <DialogClose asChild>
          <Button size="sm" variant="secondary" className=" w-full">
            Cancel
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

export default GenerationItem;
