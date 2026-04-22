import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { CarMaker, CarMakersData, CarModelProps } from "@lib/types";

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
  MoveLeft,
  NotepadTextDashed,
  Trash2,
} from "lucide-react";
import React, { SetStateAction, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Spinner from "@components/Spinner";
import { useQueryClient } from "@tanstack/react-query";
import { deleteCarMakerAction } from "@lib/actions/carMakerActions";
import useDeleteCarMaker from "@lib/queries/useDeleteCarMakers";

const SLIDE_TRANSITION = { ease: "backInOut" };

interface CarMakerItem {
  className?: string;
  carMaker: CarMakersData;
  handleResetPage: () => void;
  carMakerToEdit?: CarMakersData;
  setCarMakerToEdit?: React.Dispatch<SetStateAction<CarMakersData | undefined>>;
  setCarMaker: React.Dispatch<SetStateAction<number | null>>;

  setNoteOpen: React.Dispatch<React.SetStateAction<number | null>>;
}

const CarMakerItem = ({
  className,
  carMaker,
  handleResetPage,
  carMakerToEdit,
  setCarMakerToEdit,
  setCarMaker,
  setNoteOpen,
}: CarMakerItem) => {
  const [loading, setLoading] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  // const [noteOpen, setNoteOpen] = useState(false);
  return (
    <div
      onClick={() => setCarMaker(carMaker.id)}
      className=" group flex flex-col relative "
    >
      {carMaker.logo ? (
        <img
          src={carMaker.logo}
          alt=" Maker logo "
          className=" h-[80px] xs:h-[100px] object-contain  rounded-t-sm group-hover:scale-95 transition-all ease-in   select-none"
        />
      ) : (
        <div className=" h-[150px] xs:h-[200px] flex items-center justify-center  bg-foreground/10   rounded-t-sm ">
          <ImageOff className=" w-20 h-20" />
        </div>
      )}
      <div className="    py-3">
        <p className=" font-semibold text-sm text-muted-foreground  text-center px-8   break-all">
          {carMaker.name}
        </p>

        {/* <NoteDialog content={carMaker.notes} /> */}
        {loading ? (
          <Spinner className=" w-7 h-7  absolute right-2 bottom-2" size={15} />
        ) : (
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
            className=" absolute right-2 bottom-2     "
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className=" w-6 h-6 rounded-full p-0    "
                >
                  <EllipsisVertical className=" w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  disabled={!carMaker.notes}
                  className=" gap-2"
                  onClick={() => {
                    if (!carMaker.notes.length) return;
                    setNoteOpen(carMaker.id);
                  }}
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
          </div>
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
      {/* <NoteDialog carMaker={carMaker} open={noteOpen} setOpen={setNoteOpen} /> */}
    </div>
  );
};

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
  carMaker: CarMakersData | null;
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
    <div onClick={(e) => e.stopPropagation()} className="  absolute">
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
    </div>
  );
}

export default CarMakerItem;

/*

  {modelId && chosenModel ? (
          <motion.div
            key="model-details" // <--- Add a unique key here
            layout
            initial={{
              opacity: 0,
              x: 30,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ ease: "circOut" }}
          >
            {chosenModel.name}
          </motion.div>
        ) : (
          <motion.div
            key="model-list" // <--- Add another unique key here
            layout
            initial={{
              opacity: 0,
              x: -30,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ ease: "circOut" }}
            className="space-y-9"
          >
            <div>
              <h3 className="sm:text-xl md:text-2xl font-semibold mb-3">
                Models
              </h3>
              <ul className="flex items-center gap-3 flex-wrap">
                {carMaker.carModels.length ? (
                  carMaker.carModels.map((model, i) => (
                    <ModelItem
                      key={model.id}
                      item={model}
                      setModelId={() => setModelId(model.id)}
                      handleResetPage={handleResetPage}
                    />
                  ))
                ) : (
                  <p className="text-muted-foreground w-full text-center">
                    No Models
                  </p>
                )}
              </ul>
            </div>

            <div>
              <h3 className="sm:text-xl md:text-2xl font-semibold mb-3">
                Generations
              </h3>
              <ul className="flex flex-wrap">
                {generaitons.map((item) => (
                  <GenerationItem
                    key={item.id}
                    handleResetPage={handleResetPage}
                    item={item}
                  />
                ))}
              </ul>
            </div>
          </motion.div>
        )}
*/
