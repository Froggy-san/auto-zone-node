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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CarModelProps } from "@lib/types";
import { useToast } from "@hooks/use-toast";
import Spinner from "@components/Spinner";
import { Cross2Icon } from "@radix-ui/react-icons";
import { NotepadText } from "lucide-react";
import CarModelForm from "@components/car-model-form";
import { GiTumbleweed } from "react-icons/gi";
import { CgDetailsLess } from "react-icons/cg";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import GenerationItem from "./generation-item";
import { deleteCarModelAction } from "@lib/actions/carModelsActions";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";
import { useQueryClient } from "@tanstack/react-query";
const ModelItem = ({
  item,
  handleResetPage,
}: {
  handleResetPage: () => void;
  item: CarModelProps;
}) => {
  const [loading, setLoading] = useState(false);
  return (
    <li className=" w-full  sm:w-fit px-3 py-2 flex items-center gap-2   justify-between text-sm border rounded-lg">
      {/* <EditCarGenerationForm item={item} /> */}
      <CarModelForm modelToEdit={item} carMakers={[]} />
      {/* {item.name} */}
      <div className=" flex items-center  gap-2">
        <NoteDialog item={item} />
        {loading ? (
          <Spinner className=" h-full ml-auto" size={10} />
        ) : (
          <DeleteBtn
            isDeleting={loading}
            setIsDeleting={setLoading}
            handleResetPage={handleResetPage}
            item={item}
          />
        )}
      </div>
    </li>
  );
};

function NoteDialog({
  item,
  disabled = false,
}: {
  item: CarModelProps;
  disabled?: boolean;
}) {
  return (
    <Dialog>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <button className="  flex items-center justify-center rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground  ">
                <CgDetailsLess className="h-4 w-4" />
              </button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>View Details</p>
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
            {item.name}&apos;s details.
          </DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 p-2  rounded-md bg-accent/50 overflow-hidden  text-center sm:text-left break-all">
          <h2 className=" text-md font-semibold flex items-center gap-1">
            {" "}
            <NotepadText className="h-5 w-5" /> Note.
          </h2>
          <p className="     indent-5  "> {item.notes}</p>
        </div>
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Related Generations</AccordionTrigger>
            <AccordionContent>
              {item.carGenerations.length ? (
                <ul className=" flex  flex-wrap gap-2">
                  {item.carGenerations.map((gen, i) => (
                    <GenerationItem key={i} item={gen} />
                  ))}
                </ul>
              ) : (
                <div className=" flex   justify-center item-center gap-1">
                  {" "}
                  Empty <GiTumbleweed className=" w-4 h-4" />{" "}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <DialogClose asChild>
          <Button size="sm" variant="secondary" className=" w-full">
            Cancel
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

function DeleteBtn({
  item,
  isDeleting,
  setIsDeleting,
  handleResetPage,
}: {
  handleResetPage: () => void;
  isDeleting: boolean;
  setIsDeleting: React.Dispatch<SetStateAction<boolean>>;
  item: CarModelProps;
}) {
  const { toast } = useToast();
  // const { deleteCargeneration, isDeleting } = useDeleteCarGenerations();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const handleDelete = useCallback(async () => {
    try {
      setIsDeleting(true);
      const error = await deleteCarModelAction(item.id);
      if (error) throw new Error(error);
      setOpen(false);
      handleResetPage();
      queryClient.invalidateQueries({ queryKey: ["carModels"] });

      toast({
        className: "bg-primary  text-primary-foreground",
        title: "Done.",
        description: (
          <SuccessToastDescription message="Car model has been deleted." />
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
  }, []);

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
            onClick={async () => handleDelete()}
          >
            {isDeleting ? <Spinner className=" h-full" /> : "Confrim"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ModelItem;
