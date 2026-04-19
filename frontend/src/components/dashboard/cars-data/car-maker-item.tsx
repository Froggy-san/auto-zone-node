import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { CarMaker } from "@lib/types";

import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";
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
import {
  Car,
  EllipsisVertical,
  ImageOff,
  Menu,
  NotepadTextDashed,
  Trash2,
} from "lucide-react";
import React, { SetStateAction, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Spinner from "@components/Spinner";
import { useQueryClient } from "@tanstack/react-query";
import { deleteCarMakerAction } from "@lib/actions/carMakerActions";
import useDeleteCarMaker from "@lib/queries/useDeleteCarMakers";
interface CarMakerItem {
  className?: string;
  carMaker: CarMaker;
  handleResetPage: () => void;
  carMakerToEdit?: CarMaker;
  setCarMakerToEdit?: React.Dispatch<SetStateAction<CarMaker | undefined>>;
}

const CarMakerItem = ({
  className,
  carMaker,
  handleResetPage,
  carMakerToEdit,
  setCarMakerToEdit,
}: CarMakerItem) => {
  const [loading, setLoading] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  return (
    <Card className=" flex flex-col relative">
      {carMaker.logo ? (
        <img
          src={carMaker.logo}
          alt=" Maker logo "
          className=" h-[150px] xs:h-[200px] object-cover  rounded-t-sm select-none"
        />
      ) : (
        <div className=" h-[150px] xs:h-[200px] flex items-center justify-center  bg-foreground/10   rounded-t-sm ">
          <ImageOff className=" w-20 h-20" />
        </div>
      )}
      <div className=" flex flex-wrap items-center px-2 py-3  gap-3 justify-between">
        <div className=" text-sm text-muted-foreground pr-7 break-all">
          Name: {carMaker.name}
        </div>

        {/* <NoteDialog content={carMaker.notes} /> */}
        {loading ? (
          <Spinner className=" w-7 h-7  absolute right-2 bottom-2" size={15} />
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className=" w-7 h-7 rounded-full p-0 absolute right-2 bottom-2     "
              >
                <EllipsisVertical className=" w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                disabled={!carMaker.notes}
                className=" gap-2"
                onClick={() => setNoteOpen(true)}
              >
                <NotepadTextDashed className=" h-4 w-4 " /> Show note
              </DropdownMenuItem>
              <DropdownMenuItem
                className=" gap-2"
                onClick={() => setCarMakerToEdit?.(carMaker)}
              >
                <Car className=" h-4 w-4 " /> Edit car maker
              </DropdownMenuItem>
              <DropdownMenuItem
                className=" gap-2"
                onClick={() => setOpenDelete(true)}
              >
                <Trash2 className=" h-4 w-4 " /> Delete{" "}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <DeleteDialog
        open={openDelete}
        setOpen={setOpenDelete}
        carMaker={carMaker}
        handleResetPage={handleResetPage}
        loading={loading}
        setLoading={setLoading}
      />
      <NoteDialog carMaker={carMaker} open={noteOpen} setOpen={setNoteOpen} />
    </Card>
  );
};

function NoteDialog({
  open,
  setOpen,
  carMaker,
}: {
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
  carMaker: CarMaker | null;
}) {
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]  max-h-[55vh] overflow-y-auto    ">
        <DialogHeader>
          <DialogTitle>&apos;{carMaker?.name}&apos; note.</DialogTitle>
          <DialogDescription className=" text-left">
            {carMaker?.notes}
          </DialogDescription>
        </DialogHeader>

        <DialogClose asChild>
          <Button size="sm" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({
  open,
  setOpen,
  carMaker,
  loading,
  setLoading,
  handleResetPage,
}: {
  loading: boolean;
  setLoading: React.Dispatch<SetStateAction<boolean>>;
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
  carMaker: CarMaker | null;
  handleResetPage: () => void;
}) {
  const { deleteMaker } = useDeleteCarMaker();
  const { toast } = useToast();

  async function handleDelete() {
    try {
      setLoading(true);
      if (carMaker) {
        await deleteMaker(carMaker);
      }
      handleResetPage();
      setOpen(false);

      toast({
        className: "bg-primary  text-primary-foreground",
        title: `Car maker deleted!`,
        description: (
          <SuccessToastDescription
            message={`'${carMaker?.name}'s data has been deleted`}
          />
        ),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Faild to delete car maker data",
        description: <ErorrToastDescription error={error.message} />,
      });
    } finally {
      setLoading(false);
    }
  }
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. You are about to delete &apos;
            {carMaker?.name}&apos; data.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="   gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button size="sm" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={async () => handleDelete()}
          >
            {loading ? <Spinner className=" h-full" /> : "Confrim"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CarMakerItem;
