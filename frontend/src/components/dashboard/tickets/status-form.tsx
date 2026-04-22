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
import { FormLabel } from "@components/ui/form";
import { cn } from "@lib/utils";
import FormErrorMessage from "@components/form-error-message";
const StatusForm = ({
  statusToEdit,
  showBtn = true,
  isOpen,
  setIsOpen,
}: {
  statusToEdit?: any;
  showBtn?: boolean;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [nameIsDirty, setNameIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();

  const diaOpen = isOpen !== undefined ? isOpen : open;

  const defaultValues = {
    name: statusToEdit?.name || "",
    description: statusToEdit?.description || "",
  };

  const isEqual = useObjectCompare(defaultValues, { name, description });

  const reset = useCallback(() => {
    setName(defaultValues.name);
    setDescription(defaultValues.description);
    setNameError("");
    setDescriptionError("");
    setNameIsDirty(false);
  }, [defaultValues]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setIsOpen?.(false);
    reset();
  }, [setOpen, reset]);

  const handleOpenChange = useCallback(() => {
    setOpen((open) => !open);
    setIsOpen?.(!diaOpen);
    reset();
  }, [setOpen, reset]);
  useEffect(() => {
    if (!nameIsDirty) return;
    if (name.length <= 3) setNameError("Status name is too short.");
    if (name.length > 200) setNameError("Status name is too long.");
    if (name.length >= 3 && name.length < 200) setNameError("");
  }, [name]);

  useEffect(() => {
    // if(description.length < 3) setNameError("Status description is too short.")
    if (description.length > 200)
      setDescriptionError("Status description is too long.");
    else setDescriptionError("");
  }, [description]);

  useEffect(() => {
    if (isLoading) return;
    reset();
  }, [diaOpen]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (statusToEdit) {
        const { error } = await editTicketStatusAction({
          id: statusToEdit.id,
          name,
          description,
        });
        if (error) throw new Error(error);

        toast({
          className: "bg-primary  text-primary-foreground",
          title: "Done.",
          description: (
            <SuccessToastDescription message="Ticket status has been updated." />
          ),
        });
      } else {
        const { error } = await createTicketStatusAction({ name, description });
        if (error) throw new Error(error);

        toast({
          className: "bg-primary  text-primary-foreground",
          title: "Done.",
          description: (
            <SuccessToastDescription message="New ticket status created." />
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
          <DialogTitle>Create a new status</DialogTitle>
          <DialogDescription>
            Create a new status for the tickets page such as
            &#x2772;&apos;Open&apos;, &apos;In Progress&apos;, &apos;Awaiting
            Client&apos;s Response&apos;, &apos;Solved&apos;,
            &apos;Closed&apos;&#x2773;.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className=" space-y-5">
          <div className=" space-y-2 w-full mb-auto">
            <label
              htmlFor="name"
              className={cn(
                nameError && "text-destructive ",
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
                setNameIsDirty(true);
                setName(e.target.value);
              }}
            />

            <p className="text-[0.8rem] text-muted-foreground">
              Enter the name of the status or what should the status say.
            </p>
            <AnimatePresence>
              {nameError && <FormErrorMessage>{nameError}</FormErrorMessage>}
            </AnimatePresence>
          </div>

          <div className=" space-y-2 w-full mb-auto">
            <label
              htmlFor="description"
              className={cn(
                descriptionError && "text-destructive ",
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              )}
            >
              Description
            </label>

            <Textarea
              id="description"
              disabled={isLoading}
              placeholder="Status Name..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <p className="text-[0.8rem] text-muted-foreground">
              Descripe what the status is about.
            </p>
            <AnimatePresence>
              {descriptionError && (
                <FormErrorMessage>{descriptionError}</FormErrorMessage>
              )}
            </AnimatePresence>
          </div>
          <div className=" relative flex flex-col-reverse sm:flex-row items-center justify-end  gap-3">
            <Button
              onClick={reset}
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
              disabled={isLoading || isEqual}
              className=" w-full sm:w-[unset]"
            >
              {isLoading ? (
                <Spinner className=" h-full" />
              ) : statusToEdit ? (
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

export default StatusForm;
