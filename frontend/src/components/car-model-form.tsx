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
import {
  CarMaker,
  CarModel,
  CarModelProps,
  CreateCarModelSchema,
} from "@lib/types";
import { Textarea } from "@components/ui/textarea";

import Spinner from "@components/Spinner";

import { useToast } from "@hooks/use-toast";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";

import {
  createCarModelAction,
  editCarModelAction,
} from "@lib/actions/carModelsActions";
import { MakerCombobox } from "./maker-combobox";
import useObjectCompare from "@hooks/use-compare-objs";
import DialogComponent from "./dialog-component";
import { useQueryClient } from "@tanstack/react-query";

const CarModelForm = ({
  modelToEdit,
  carMakers,
}: {
  modelToEdit?: CarModelProps;
  carMakers: CarMaker[];
}) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const defaultValues = {
    name: modelToEdit?.name || "",
    notes: modelToEdit?.notes || "",
    carMakerId: modelToEdit ? 1 : 0,
  };

  const form = useForm<z.infer<typeof CreateCarModelSchema>>({
    resolver: zodResolver(CreateCarModelSchema),
    defaultValues,
  });

  const isEqual = useObjectCompare(form.getValues(), defaultValues);
  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    form.reset(defaultValues);
  }, [open, form]);

  const handleClose = useCallback(() => {
    setOpen(false);
    // form.reset(defaultValues);
  }, [open]);

  async function onSubmit(carModelData: z.infer<typeof CreateCarModelSchema>) {
    try {
      if (isEqual) throw new Error("Data hasn't changed.");

      if (modelToEdit) {
        const carModel = { name: carModelData.name, notes: carModelData.notes };
        const data = await editCarModelAction({
          carModel,
          id: modelToEdit.id,
        });
        if (data?.error) throw new Error(data?.error);
      } else {
        const { error } = await createCarModelAction(carModelData);
        if (error) throw new Error(error);
      }

      handleClose();
      queryClient.invalidateQueries({ queryKey: ["carModels"] });

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
    <DialogComponent open={open} onOpenChange={handleClose}>
      {modelToEdit ? (
        <button onClick={() => setOpen(true)}>{modelToEdit.name}</button>
      ) : (
        <Button size="sm" className=" w-full" onClick={() => setOpen(true)}>
          Create car model
        </Button>
      )}

      <DialogComponent.Content className="  max-h-[65vh]  sm:max-h-[76vh] overflow-y-auto max-w-[1000px] border-none sm:p-14">
        <DialogComponent.Header>
          <DialogComponent.Title>Car Model</DialogComponent.Title>
          <DialogComponent.Description>
            {modelToEdit ? "Edit car model" : "Create a new car model"}.
          </DialogComponent.Description>
        </DialogComponent.Header>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 ">
            <div className=" flex flex-col xs:flex-row items-center gap-3">
              <FormField
                disabled={isLoading}
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className=" w-full mb-auto">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="name" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the name of the product.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!modelToEdit && (
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="carMakerId"
                  render={({ field }) => (
                    <FormItem className=" w-full mb-auto">
                      <FormLabel>Car maker</FormLabel>
                      <FormControl>
                        <MakerCombobox
                          options={carMakers}
                          setValue={field.onChange}
                          value={field.value}
                        />
                      </FormControl>
                      <FormDescription>Add a maker logo.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
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

            <DialogComponent.Footer>
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
                ) : modelToEdit ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </DialogComponent.Footer>
          </form>
        </Form>
      </DialogComponent.Content>
    </DialogComponent>
  );
};

export default CarModelForm;
