"use client";
import React, { useCallback, useState } from "react";
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

import {
  CarModelProps,
  CarMaker,
  CarGenerationProps,
  CarInfoSchema,
} from "@lib/types";

import Spinner from "@components/Spinner";

import { useToast } from "@hooks/use-toast";

import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";

import { MakerCombobox } from "@components/maker-combobox";
import { ModelCombobox } from "@components/model-combobox";
import { GenerationComboBox } from "@components/generation-combobox";
import { createCarInfoAction } from "@lib/actions/carInfoActions";
import useObjectCompare from "@hooks/use-compare-objs";
import DialogComponent from "@components/dialog-component";

interface CarInfoFormProps {
  carModels: CarModelProps[];
  carMakers: CarMaker[];
  carGenerations: CarGenerationProps[];
}

export const CarInfoForm: React.FC<CarInfoFormProps> = ({
  carModels,
  carMakers,
  carGenerations,
}) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const defaultValues = {
    carMakerId: 0,
    carGenerationId: 0,
    carModelId: 0,
  };

  const form = useForm<z.infer<typeof CarInfoSchema>>({
    resolver: zodResolver(CarInfoSchema),
    defaultValues,
  });

  const { carMakerId, carModelId, carGenerationId } = form.watch();
  const isEqual = useObjectCompare(form.getValues(), defaultValues);

  const modelArr = carMakerId
    ? carModels.filter((model) => model.carMakerId === carMakerId)
    : carModels;

  const generationsArr = carModelId
    ? carGenerations.filter((gen) => gen.carModelId === carModelId)
    : carGenerations;

  const handleClose = useCallback(() => {
    setOpen(false);
    form.reset();
  }, [open]);

  const isLoading = form.formState.isSubmitting;

  async function onSubmit(carInfo: z.infer<typeof CarInfoSchema>) {
    try {
      if (isEqual) throw new Error("You haven't changed anything.");
      await createCarInfoAction(carInfo);
      form.reset();
      setOpen(false);
      toast({
        className: "bg-primary  text-primary-foreground",
        title: "Success!.",
        description: (
          <SuccessToastDescription message="A new car information has been create." />
        ),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Something went wrong while creating a new car information.",
        description: <ErorrToastDescription error={error.message} />,
      });
    }
  }
  return (
    <DialogComponent open={open} onOpenChange={handleClose}>
      <Button onClick={() => setOpen(true)} size="sm" className=" w-full">
        New car information
      </Button>

      <DialogComponent.Content className="  max-h-[65vh]  sm:max-h-[76vh] overflow-y-auto max-w-[1000px] sm:p-14">
        <DialogComponent.Header>
          <DialogComponent.Title>Car information</DialogComponent.Title>
          <DialogComponent.Description>
            Create a new car information.
          </DialogComponent.Description>
        </DialogComponent.Header>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 ">
            <div className=" flex flex-col sm:flex-row   items-center gap-3">
              <FormField
                disabled={isLoading}
                control={form.control}
                name="carMakerId"
                render={({ field }) => (
                  <FormItem className=" w-full mb-auto">
                    <FormLabel>Car Maker</FormLabel>
                    <FormControl>
                      <MakerCombobox
                        value={field.value}
                        setValue={(id) => {
                          field.onChange(id);
                          form.setValue("carModelId", 0);
                        }}
                        options={carMakers}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the name of the car maker.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                disabled={isLoading}
                control={form.control}
                name="carModelId"
                render={({ field }) => (
                  <FormItem className=" w-full mb-auto">
                    <FormLabel>Car models</FormLabel>
                    <FormControl>
                      <ModelCombobox
                        disabled={isLoading || !carMakerId}
                        value={field.value}
                        setValue={(id) => {
                          field.onChange(id);
                          form.setValue("carGenerationId", 0);
                        }}
                        options={modelArr}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the model of the car.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="carGenerationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Car generation</FormLabel>
                  <FormControl>
                    <GenerationComboBox
                      disabled={isLoading || !carModelId}
                      value={field.value}
                      setValue={field.onChange}
                      options={generationsArr}
                    />
                  </FormControl>
                  <FormDescription>Enter car generation.</FormDescription>
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
                {isLoading ? <Spinner className=" h-full" /> : "Create"}
              </Button>
            </DialogComponent.Footer>
          </form>
        </Form>
      </DialogComponent.Content>
    </DialogComponent>
  );
};

export default CarInfoForm;
