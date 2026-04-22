"use client";
import React, { useCallback, useEffect, useState } from "react";
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
import { CarMakersData, CarModelProps, CreateCarModelSchema } from "@lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@components/ui/textarea";

import Spinner from "@components/Spinner";

import { useToast } from "@hooks/use-toast";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";

import useObjectCompare from "@hooks/use-compare-objs";

import useCreateModel from "@lib/queries/car-models/useCreateModel";
import useEditModel from "@lib/queries/car-models/useEditModel";
import { FileUploader } from "./file-uploader";

const CarModelForm = ({
  open,
  setOpen,
  modelToEdit,
  carMaker,
  trigger,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  modelToEdit?: CarModelProps;
  carMaker: CarMakersData;
  trigger?: React.ReactNode;
}) => {
  const { toast } = useToast();
  const { isCreating, createModel } = useCreateModel();
  const { isEditing, editModel } = useEditModel();

  const defaultValues = {
    name: modelToEdit?.name || "",
    notes: modelToEdit?.notes || "",
    carMakerId: carMaker.id,
    image: [],
  };

  const form = useForm<z.infer<typeof CreateCarModelSchema>>({
    resolver: zodResolver(CreateCarModelSchema),
    defaultValues,
  });

  const isEqual = useObjectCompare(form.getValues(), defaultValues);
  const isLoading = form.formState.isSubmitting || isCreating || isEditing;

  useEffect(() => {
    form.reset(defaultValues);
  }, [open, form]);

  const handleClose = useCallback(() => {
    setOpen(false);
    // form.reset(defaultValues);
  }, [open]);

  async function onSubmit(carModelData: z.infer<typeof CreateCarModelSchema>) {
    try {
      if (isEqual) throw new Error("Model data hasn't change.");

      if (modelToEdit) {
        await editModel({
          carModel: { ...carModelData, id: modelToEdit.id },
          imageToDelete: modelToEdit.image || "",
        });
      } else {
        await createModel(carModelData);
      }

      handleClose();

      toast({
        className: "bg-primary  text-primary-foreground",
        title: "Success!.",
        description: (
          <SuccessToastDescription
            message={
              modelToEdit
                ? "Car model has been updated."
                : "A new car model has been create."
            }
          />
        ),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Something went wrong!.",
        description: <ErorrToastDescription error={error.message} />,
      });
    }
  }
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      {/* {trigger ? (
        <div className=" flex" onClick={() => setOpen(true)}>
          {trigger}
        </div>
      ) : (
        <Button size="sm" className=" w-full" onClick={() => setOpen(true)}>
          Create car model
        </Button>
      )} */}

      <DialogContent className="  sm:p-7 max-h-[65vh]  sm:max-h-[76vh] overflow-y-auto max-w-[500px] border-none ">
        <DialogHeader>
          <DialogTitle>Car Model</DialogTitle>
          <DialogDescription>
            {modelToEdit ? "Edit car model" : "Create a new car model"}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 ">
            <div className=" flex flex-col xs:flex-row items-center gap-3">
              <div className=" space-y-2 w-full mb-auto">
                <FormLabel>Car maker</FormLabel>

                <div className="flex items-center gap-2 h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-not-allowed opacity-50">
                  {carMaker.logo ? (
                    <img
                      src={carMaker.logo}
                      alt={`${carMaker.name} logo`}
                      className=" w-8 h-8 object-contain"
                    />
                  ) : null}{" "}
                  <span>{carMaker.name}</span>
                </div>

                <FormDescription>The Brand/Maker of the car.</FormDescription>
                <FormMessage />
              </div>

              <FormField
                disabled={isLoading}
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className=" w-full mb-auto">
                    <FormLabel>Model name</FormLabel>
                    <FormControl>
                      <Input placeholder="Model name" {...field} />
                    </FormControl>
                    <FormDescription>Model of the car.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              disabled={isLoading}
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes..." {...field} />
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
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model image</FormLabel>
                  <FormControl>
                    <FileUploader
                      mediaUrl={modelToEdit?.image ? modelToEdit.image : ""}
                      fieldChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>Add a maker logo.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className=" flex  gap-2 flex-col-reverse">
              <Button
                onClick={handleClose}
                disabled={isLoading}
                type="reset"
                variant="secondary"
                size="sm"
                className=" w-full  "
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isLoading || isEqual}
                className=" w-full  "
              >
                {isLoading ? (
                  <Spinner className=" h-full" />
                ) : modelToEdit ? (
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

export default CarModelForm;
