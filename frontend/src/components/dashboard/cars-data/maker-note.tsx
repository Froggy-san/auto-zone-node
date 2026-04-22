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
import { CarMakersData } from "@lib/types";
import { Button } from "@components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
const MakerNote = ({
  open,
  setOpen,
  carMaker,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  carMaker: CarMakersData | null;
}) => {
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
      <DialogContent
        onClick={(e) => e.stopPropagation()}
        className="sm:max-w-[500px]  max-h-[55vh] overflow-y-auto    "
      >
        <DialogHeader>
          <DialogTitle>
            <AnimatePresence>
              {carMaker?.name && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                >
                  &apos;{carMaker?.name}&apos; note.
                </motion.span>
              )}
            </AnimatePresence>
          </DialogTitle>
          <DialogDescription className=" text-left">
            <AnimatePresence>
              {carMaker?.notes && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                >
                  {carMaker?.notes}
                </motion.p>
              )}
            </AnimatePresence>
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
};

export default MakerNote;
