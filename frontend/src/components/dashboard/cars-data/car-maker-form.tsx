"use client";
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CarMaker, CarMakersData, CreateCarMakerScehma } from "@lib/types";
import { Textarea } from "@components/ui/textarea";

import Spinner from "@components/Spinner";
import { useToast } from "@hooks/use-toast";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileUploader } from "../../file-uploader";

import useObjectCompare from "@hooks/use-compare-objs";
import { useQueryClient } from "@tanstack/react-query";
import { createCarMaker, editCarMaker } from "@lib/services/car-maker-services";

const CarkMakerForm = ({
  carMakerToEdit,
  showOpenButton = true,
  handleCloseEdit,
}: {
  carMakerToEdit?: CarMakersData;
  showOpenButton?: boolean;
  handleCloseEdit?: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const open = carMakerToEdit ? true : isOpen;
  const defaultValues = {
    name: carMakerToEdit?.name || "",
    notes: carMakerToEdit?.notes || "",
    logo: [],
  };
  const form = useForm<z.infer<typeof CreateCarMakerScehma>>({
    resolver: zodResolver(CreateCarMakerScehma),
    defaultValues,
  });

  const isEqual = useObjectCompare(form.getValues(), defaultValues);

  useEffect(() => {
    const body = document.querySelector("body");
    form.reset(defaultValues);

    if (body) {
      body.style.pointerEvents = "auto";
    }
    return () => {
      if (body) body.style.pointerEvents = "auto";
    };
  }, [open]);

  function handleClose() {
    // form.reset(defaultValues);
    handleCloseEdit?.();
    setIsOpen(false);
  }

  const isLoading = form.formState.isSubmitting;

  async function onSubmit({
    name,
    notes,
    logo,
  }: z.infer<typeof CreateCarMakerScehma>) {
    try {
      if (isEqual) throw new Error("You haven't changed anything.");
      if (carMakerToEdit) {
        // const formData = new FormData();
        // formData.append("name", name);
        // formData.append("notes", notes);
        // if (logo.length) formData.append("logo", logo[0]);

        // const res = await editCarMakerAction(formData, carMakerToEdit.id);

        const newCarMaker = {
          id: carMakerToEdit.id,
          name,
          notes,
          logo: carMakerToEdit.logo,
        };

        await editCarMaker({ carMakerToEdit: newCarMaker, newLogo: logo?.[0] });
        queryClient.invalidateQueries({ queryKey: ["carMakers"] });
      } else {
        // const formData = new FormData();
        // formData.append("name", name);
        // formData.append("notes", notes);
        // formData.append("logo", logo[0]);
        // const res = await createCarMakerAction(formData);
        // if (res.error) throw new Error(res.error);

        await createCarMaker({ name, notes, logo: logo?.[0] });

        queryClient.invalidateQueries({ queryKey: ["carMakers"] });
      }
      handleClose();
      toast({
        className: "bg-primary  text-primary-foreground",
        title: "Success.",
        description: (
          <SuccessToastDescription message="Car maker has been created." />
        ),
      });
      setIsOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: <ErorrToastDescription error={error.message} />,
      });
    }
  }
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      {showOpenButton && (
        <Button onClick={() => setIsOpen(true)} size="sm" className=" w-full">
          Create car maker
        </Button>
      )}

      <DialogContent className=" max-h-[65vh]   sm:max-h-[76vh]  overflow-y-auto max-w-[1000px] sm:p-14">
        <DialogHeader>
          <DialogTitle>Car makers</DialogTitle>
          <DialogDescription>Create a new car maker.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 ">
            <FormField
              disabled={isLoading}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} placeholder="name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the name of the product.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              disabled={isLoading}
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isLoading}
                      placeholder="Additional notes..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter any additional notes regarding the car maker.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              disabled={isLoading}
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo</FormLabel>
                  <FormControl>
                    <FileUploader
                      mediaUrl={carMakerToEdit?.logo ? carMakerToEdit.logo : ""}
                      fieldChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>Add a maker logo.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className=" flex flex-col-reverse sm:flex-row items-center justify-end  gap-3">
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
                ) : carMakerToEdit ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CarkMakerForm;
