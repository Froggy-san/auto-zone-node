import { CarGenerationProps, CarModelProps } from "@lib/types";
import React, { useMemo, useState } from "react";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { NotepadText } from "lucide-react";
import GenerationItem from "./generation-item";
import { GiTumbleweed } from "react-icons/gi";
import { Button } from "@components/ui/button";
import { GenerationForm } from "./generation-form";
import { AnimatePresence, motion } from "framer-motion";
export default function MoreDetails({
  open,
  setOpen,
  item,
  disabled = false,
  setGentoEdit,
  setAddGenOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  item: CarModelProps | undefined;
  disabled?: boolean;
  setGentoEdit: React.Dispatch<
    React.SetStateAction<{
      modelId: number;
      genId: number;
    } | null>
  >;

  setAddGenOpen: React.Dispatch<React.SetStateAction<number | null>>;
}) {
  // const [open, setOpen] = useState(false);
  // const [genToEdit, setGenToEdit] = useState<CarGenerationProps | null>(null);
  // const [addGenOpen, setAddGenOpen] = useState(false);
  const generations = useMemo(() => {
    return item?.carGenerations.sort((a, b) => a.id - b.id);
  }, [item?.carGenerations]);
  return (
    <div className=" absolute">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-[500px]  max-h-[55vh]
        overflow-y-auto
        border-none"
        >
          <DialogHeader>
            <DialogTitle className=" break-all  pr-5">
              <AnimatePresence mode="wait">
                {item?.name && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.09 }}
                  >
                    {item.name}&apos;s details.
                  </motion.span>
                )}
              </AnimatePresence>
            </DialogTitle>
            <DialogDescription className="hidden"></DialogDescription>
          </DialogHeader>
          <AnimatePresence mode="wait">
            {item?.notes && (
              <motion.div
                key="note"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.09 }}
                className="grid gap-2 p-2  rounded-md bg-accent/50 overflow-hidden  text-center sm:text-left break-all"
              >
                <h2 className=" text-md font-semibold flex items-center gap-1">
                  {" "}
                  <NotepadText className="h-5 w-5" /> Note.
                </h2>
                <p className="     indent-5  "> {item.notes}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <Accordion type="single" defaultValue="item-1" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>Related Generations</AccordionTrigger>
              <AccordionContent>
                <AnimatePresence mode="wait">
                  {generations?.length && item ? (
                    <motion.ul
                      key="gen-list"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.09 }}
                      className=" grid  grid-cols-2 sm:grid-cols-3  gap-2"
                    >
                      {generations.map((gen) => (
                        <GenerationItem
                          key={gen.id}
                          item={gen}
                          model={item}
                          setGenToEdit={() =>
                            setGentoEdit({ modelId: item.id, genId: gen.id })
                          }
                          setOpen={setOpen}
                          withForm={false}
                        />
                      ))}
                    </motion.ul>
                  ) : (
                    <motion.div
                      key="empty"
                      className=" flex   justify-center item-center gap-1"
                    >
                      {" "}
                      Empty <GiTumbleweed className=" w-4 h-4" />{" "}
                    </motion.div>
                  )}
                </AnimatePresence>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <DialogClose asChild>
            <Button
              onClick={() => {
                if (item) setAddGenOpen(item.id);
              }}
              size="sm"
              className=" w-full"
            >
              Add a new generation
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
      {/* {item && (
        <GenerationForm
          open={!!genToEdit || addGenOpen}
          setOpen={() => {
            setGenToEdit(null);
            setAddGenOpen(false);
          }}
          genToEdit={genToEdit || undefined}
          model={item}
          // open={!!genToEdit}

          setMainOpen={setOpen}
        />
      )} */}
    </div>
  );
}
