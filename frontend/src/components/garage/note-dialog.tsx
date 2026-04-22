"use client";
import React, { SetStateAction, useEffect } from "react";
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
import { NotepadTextDashed } from "lucide-react";
import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import { AnimatePresence, motion } from "framer-motion";
function NoteDialog({
  title,
  description,
  content,
  className,
  open,
  onOpenChange,
}: {
  className?: string;
  open?: boolean;
  onOpenChange?: React.Dispatch<SetStateAction<boolean>>;
  content: React.ReactNode;
  title?: string;
  description?: React.ReactNode;
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <button
                className={cn(
                  "flex items-center justify-center rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground  ",
                  className
                )}
              >
                <NotepadTextDashed className=" w-5 h-5" />
              </button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>View notes</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-[500px]  max-h-[55vh] overflow-y-auto     border-none">
        <DialogHeader>
          <DialogTitle className=" break-all  pr-5">
            {title ? title : "Note."}
          </DialogTitle>
          <DialogDescription className={`${!description && "hidden"}`}>
            {description ? description : null}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence>
          {content && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="grid gap-4 py-4  indent-4  whitespace-pre-wrap   text-left break-all"
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>

        <DialogClose asChild>
          <Button size="sm" variant="secondary" className=" w-full">
            Cancel
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

export default NoteDialog;
