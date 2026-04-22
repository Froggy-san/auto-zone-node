"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AnimatePresence } from "framer-motion";
import ErrorMessage from "@components/error-message";
import { Input } from "@components/ui/input";

import { Textarea } from "@components/ui/textarea";
import Spinner from "@components/Spinner";
import { Button } from "@components/ui/button";
import { RotateCcw } from "lucide-react";
import useObjectCompare from "@hooks/use-compare-objs";
import {
  createTicketStatusAction,
  editTicketStatusAction,
} from "@lib/actions/ticket-status-actions";
import { useToast } from "@hooks/use-toast";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";
import { cn } from "@lib/utils";
import FormErrorMessage from "@components/form-error-message";
import { TicketCategory } from "@lib/types";
import {
  createTicketCategoryAction,
  editTicketCategoryAction,
} from "@lib/actions/ticket-category-action";
import {
  createTicketPriorityAction,
  editTicketPriorityAction,
} from "@lib/actions/ticket-priority-action";
const TicketPriorityForm = ({
  ticketPriorityToEdit,
  showBtn = true,
  isOpen,
  setIsOpen,
}: {
  ticketPriorityToEdit?: TicketCategory;
  showBtn?: boolean;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}) => {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState(ticketPriorityToEdit?.name || "");
  const [categoryTitleError, setCategoryTitleError] = useState("");

  const [titleDirty, setTitleDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();

  const diaOpen = isOpen !== undefined ? isOpen : open;

  const defaultValues = {
    name: ticketPriorityToEdit?.name || "",
  };

  const isEqual = useObjectCompare(defaultValues, { name });

  const reset = useCallback(() => {
    setName(defaultValues.name);
    setCategoryTitleError("");
    setTitleDirty(false);
  }, [defaultValues]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setIsOpen?.(false);
    // reset();
  }, [setOpen, setIsOpen]);

  const handleOpenChange = useCallback(() => {
    setOpen((open) => !open);
    setIsOpen?.(!diaOpen);
    // reset();
  }, [setOpen, setIsOpen]);

  useEffect(() => {
    if (!titleDirty) return;
    if (name.length <= 3) setCategoryTitleError("Status name is too short.");
    if (name.length > 200) setCategoryTitleError("Status name is too long.");
    if (name.length >= 3 && name.length < 200) setCategoryTitleError("");
  }, [name]);

  useEffect(() => {
    if (isLoading) return;

    reset();
  }, [diaOpen]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (categoryTitleError) return;
    try {
      setIsLoading(true);
      if (ticketPriorityToEdit) {
        const { error } = await editTicketPriorityAction({
          id: ticketPriorityToEdit.id,
          name,
        });
        if (error) throw new Error(error);

        toast({
          className: "bg-primary  text-primary-foreground",
          title: "Done.",
          description: (
            <SuccessToastDescription message="Ticket priority has been updated." />
          ),
        });
      } else {
        const { error } = await createTicketPriorityAction({ name });
        if (error) throw new Error(error);

        toast({
          className: "bg-primary  text-primary-foreground",
          title: "Done.",
          description: (
            <SuccessToastDescription message="New ticket priority created." />
          ),
        });
      }

      handleClose();
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

  return (
    <Dialog open={diaOpen} onOpenChange={handleOpenChange}>
      {showBtn && (
        <DialogTrigger asChild>
          <Button size="sm" className=" w-full">
            {" "}
            Create New Ticket{" "}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new ticket category</DialogTitle>
          <DialogDescription>
            Create a new status for the tickets page such as &#x2772;&apos;Order
            Issue&apos;, &apos;Technical Support&apos;, &apos;Billing&apos;,
            &apos;Service Appointment&apos;.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className=" space-y-5">
          <div className=" space-y-2 w-full mb-auto">
            <label
              htmlFor="name"
              className={cn(
                categoryTitleError && "text-destructive ",
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              )}
            >
              Name
            </label>

            <Input
              id="name"
              disabled={isLoading}
              placeholder="Status Name..."
              value={name}
              onChange={(e) => {
                setTitleDirty(true);
                setName(e.target.value);
              }}
            />

            <p className="text-[0.8rem] text-muted-foreground">
              Enter the name of the ticket cateogry.
            </p>
            <AnimatePresence>
              {categoryTitleError && (
                <FormErrorMessage>{categoryTitleError}</FormErrorMessage>
              )}
            </AnimatePresence>
          </div>

          <div className=" relative flex flex-col-reverse sm:flex-row items-center justify-end  gap-3">
            <Button
              onClick={reset}
              disabled={isLoading}
              type="button"
              className=" p-0 h-6 w-6  absolute left-5 bottom-0"
              variant="outline"
            >
              <RotateCcw className=" w-4 h-4" />
            </Button>
            <Button
              onClick={handleClose}
              disabled={isLoading}
              type="reset"
              variant="secondary"
              size="sm"
              className=" w-full sm:w-[unset]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || isEqual || categoryTitleError.length > 1}
              className=" w-full sm:w-[unset]"
            >
              {isLoading ? (
                <Spinner className=" h-full" />
              ) : ticketPriorityToEdit ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TicketPriorityForm;
