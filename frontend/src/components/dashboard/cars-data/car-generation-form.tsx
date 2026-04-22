"use client";
import React, { cloneElement, useCallback, useState } from "react";
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
  CarModelProps,
  CarGenerationsSchema,
  CarMaker,
  CarGenerationProps,
  CarMakersData,
} from "@lib/types";
import { Textarea } from "@components/ui/textarea";
import Spinner from "@components/Spinner";
import { useToast } from "@hooks/use-toast";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";
import { ModelCombobox } from "@components/model-combobox";
import useObjectCompare from "@hooks/use-compare-objs";
import DialogComponent from "@components/dialog-component";
import { MakerCombobox } from "@components/maker-combobox";
import useCreateGeneration from "@lib/queries/car-generation/useCreateGeneration";
import useEditGeneration from "@lib/queries/car-generation/useEditGeneration";

const CarGenerationForm = ({
  generationToEdit,
  openBtn,
  carModels,
  carMakers,
}: {
  generationToEdit?: CarGenerationProps;
  openBtn?: React.ReactElement;
  carMakers: CarMakersData[];
  carModels: CarModelProps[];
}) => {
  const [open, setOpen] = useState(false);
  const [carMaker, setCarMaker] = useState(0);
  const { createGeneration } = useCreateGeneration();
  const { editGeneration } = useEditGeneration();
  const { toast } = useToast();

  const defaultValues = {
    name: generationToEdit ? generationToEdit.name : "",
    notes: generationToEdit ? generationToEdit.notes : "",
    carModelId: generationToEdit ? generationToEdit.carModelId : 0,
  };

  const carModelsArr =
    carMaker && carModels.length
      ? carModels.filter((model) => model.carMakerId === carMaker)
      : carModels;
  const form = useForm<z.infer<typeof CarGenerationsSchema>>({
    resolver: zodResolver(CarGenerationsSchema),
    defaultValues,
  });

  const isEqual = useObjectCompare(form.getValues(), defaultValues);
  const isLoading = form.formState.isSubmitting;
  const handleClose = () => {
    setOpen(false);
    setCarMaker(0);
    form.reset();
  };
  async function onSubmit(carGeneration: z.infer<typeof CarGenerationsSchema>) {
    try {
      if (isEqual) throw new Error("You haven't changed anything.");
      if (generationToEdit) {
        await editGeneration({
          generation: carGeneration,
          id: generationToEdit.id,
        });
      } else {
        await createGeneration(carGeneration);
      }

      handleClose();

      form.reset();
      toast({
        className: "bg-primary  text-primary-foreground",
        title: "Success!.",
        description: (
          <SuccessToastDescription message="A new car generation has been created." />
        ),
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Had truble creating a new car generation.",
        description: <ErorrToastDescription error={error.message} />,
      });
    }
  }
  return (
    <DialogComponent open={open} onOpenChange={handleClose}>
      {openBtn ? (
        cloneElement(openBtn, { onClick: () => setOpen(true) })
      ) : (
        <Button onClick={() => setOpen(true)} size="sm" className=" w-full">
          Create car generation
        </Button>
      )}

      <DialogComponent.Content className="  max-h-[65vh]  sm:max-h-[76vh] overflow-y-auto max-w-[1000px] sm:p-14">
        <DialogComponent.Header>
          <DialogComponent.Title>Car generations</DialogComponent.Title>
          <DialogComponent.Description>
            Create a new car generation.
          </DialogComponent.Description>
        </DialogComponent.Header>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 ">
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
            <div className=" flex flex-col xs:flex-row items-center gap-3">
              <FormItem className=" w-full mb-auto">
                <FormLabel>Car maker</FormLabel>
                <FormControl>
                  {/* <MakerCombobox
                    setValue={(value) => {
                      setCarMaker(value);
                      form.setValue("carModelId", 0);
                    }}
                    value={carMaker}
                    options={carMakers}
                  /> */}
                </FormControl>
                <FormDescription>
                  Enter the name of the product.
                </FormDescription>
                <FormMessage />
              </FormItem>

              <FormField
                disabled={isLoading}
                control={form.control}
                name="carModelId"
                render={({ field }) => (
                  <FormItem className=" w-full mb-auto min-w-[250px]">
                    <FormLabel>Car models</FormLabel>
                    <FormControl>
                      <ModelCombobox
                        disabled={isLoading || !carMaker}
                        options={carModelsArr}
                        setValue={field.onChange}
                        value={field.value}
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
                {isLoading ? <Spinner className=" h-full" /> : "Create"}
              </Button>
            </DialogComponent.Footer>
          </form>
        </Form>
      </DialogComponent.Content>
    </DialogComponent>
  );
};

export default CarGenerationForm;
