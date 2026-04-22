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

import Spinner from "@components/Spinner";
import { useToast } from "@hooks/use-toast";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";
import useDeleteCarGenerations from "@lib/queries/car-generation/useDeleteCarGenerations";
import { CarGenerationProps, CarModelProps } from "@lib/types";
import { Cross2Icon } from "@radix-ui/react-icons";
import { EllipsisVertical, NotepadText, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React, { useCallback, useState } from "react";
import { cn } from "@lib/utils";
import { GenerationForm } from "@components/dashboard/cars-data/generation-form";

const GenerationItem = ({
  setOpen,
  className,
  setGenToEdit,
  item,
  model,
  withForm = true,
}: {
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  setGenToEdit?: React.Dispatch<
    React.SetStateAction<CarGenerationProps | null>
  >;
  className?: string;
  handleResetPage?: () => void;
  item: CarGenerationProps;
  model: CarModelProps;
  withForm?: boolean;
}) => {
  const [openGen, setOpenGen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  return (
    <li
      onClick={() => {
        setOpen?.(false);
        setGenToEdit?.(item);
        if (withForm) setOpenGen(true);
      }}
      className={cn(
        `relative  h-fit   px-3 py-2 flex flex-col  items-center justify-between    hover:bg-accent/30  transition-all cursor-pointer  gap-2 text-sm border rounded-lg `,
        { "px-3 py-[0.4rem] ": !item.image }
      )}
    >
      {item.image ? (
        <img
          src={item.image}
          alt={`${item.name} image`}
          className=" w-20 max-h-16 block  object-contain"
        />
      ) : null}
      <div className="flex items-center  w-full  justify-center gap-2 ">
        <p
          className={cn("    pr-6  text-center", {
            "max-w-[90%]  pr-0": item.image,
          })}
        >
          {item.name}
        </p>

        <div
          onClick={(e) => e.stopPropagation()}
          className={cn(
            `flex items-center absolute right-1 top-1/2 -translate-y-1/2 `,
            {
              "right-1 top-[unset] -translate-y-[unset] bottom-[0.4rem]":
                item.image,
            }
          )}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className=" p-0 h-7 w-7">
                <EllipsisVertical className=" w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className=" mt-3">
              <DropdownMenuItem
                className=" gap-2"
                disabled={!item.notes.length}
                onClick={() => setNoteOpen(true)}
              >
                <NotepadText className="h-4 w-4" /> View note
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className=" text-red-700 gap-2  hover:!text-red-700 hover:!bg-destructive/20"
              >
                <X className=" w-4 h-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <NoteDialog
          disabled={!item.notes}
          item={item}
          open={noteOpen}
          setOpen={setNoteOpen}
        />
        <DeleteBtn item={item} open={deleteOpen} setOpen={setDeleteOpen} />
      </div>
      {withForm && (
        <div onClick={(e) => e.stopPropagation()} className=" absolute">
          <GenerationForm
            genToEdit={item}
            open={openGen}
            setOpen={setOpenGen}
            model={model}
          />
        </div>
      )}
    </li>
  );
};

function DeleteBtn({
  item,

  open,
  setOpen,
}: {
  item: CarGenerationProps;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { toast } = useToast();
  const { deleteGeneration, isDeleting } = useDeleteCarGenerations();
  const [isOpen, setIsOpen] = useState(false);

  const diaOpen = open || isOpen;

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setOpen?.(false);
  }, [setOpen, setIsOpen]);
  return (
    <div onClick={(e) => e.stopPropagation()} className=" absolute">
      <Dialog open={diaOpen} onOpenChange={handleClose}>
        {/* <DialogTrigger asChild>
        <button className=" absolute right-2 top-2  rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground  -mr-1">
        {isDeleting ? (
          <Spinner className=" h-full" size={14} />
          ) : (
            <Cross2Icon className="h-4 w-4" />
            )}
            
            </button>
      </DialogTrigger> */}

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
                deleteGeneration(
                  { id: item.id, imageToDelete: item.image || "" },
                  {
                    onSuccess: () => {
                      handleClose();

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
                  }
                );
              }}
            >
              {isDeleting ? <Spinner className=" h-full" /> : "Confrim"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NoteDialog({
  item,
  disabled = false,
  open,
  setOpen,
}: {
  item: CarGenerationProps;
  disabled?: boolean;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div onClick={(e) => e.stopPropagation()} className=" absolute">
      <Dialog open={open} onOpenChange={setOpen}>
        {/* <TooltipProvider>
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
        </TooltipProvider> */}

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
    </div>
  );
}

export default GenerationItem;
