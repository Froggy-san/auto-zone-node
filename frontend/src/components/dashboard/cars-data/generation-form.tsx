import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@components/ui/textarea";

import Spinner from "@components/Spinner";
import { useToast } from "@hooks/use-toast";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";
import useObjectCompare from "@hooks/use-compare-objs";
import { editCarGenerationAction } from "@lib/actions/carGenerationsActions";
import { useQueryClient } from "@tanstack/react-query";
import useDeleteCarGenerations from "@lib/queries/car-generation/useDeleteCarGenerations";
import {
  CarGenerationProps,
  CarGenerationsSchema,
  CarModelProps,
  EditNameAndNote,
} from "@lib/types";
import React, { cloneElement, useCallback, useEffect, useState } from "react";
import { Button } from "../../ui/button";
import useEditGeneration from "@lib/queries/car-generation/useEditGeneration";
import useCreateGeneration from "@lib/queries/car-generation/useCreateGeneration";
import { FileUploader } from "@components/file-uploader";
import { Link2 } from "lucide-react";
import { Checkbox } from "@components/ui/checkbox";

export function GenerationForm({
  setMainOpen,
  open,
  setOpen,
  genToEdit,
  model,
  openBtn,
}: {
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  open?: boolean;
  setMainOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  genToEdit?: CarGenerationProps;
  openBtn?: React.ReactElement;
  model: CarModelProps | undefined;
}) {
  // const [isOpen, setIsOpen] = useState(false);
  // const isOpen = open === "editGen";
  const [imageAs, setImageAs] = useState<"url" | "file">("file");
  const { editGeneration } = useEditGeneration();
  const { createGeneration } = useCreateGeneration();
  const { toast } = useToast();

  const defaultValues = {
    name: genToEdit?.name || "",
    notes: genToEdit?.notes || "",
    carModelId: genToEdit?.carModelId || model?.id || 0,
    image: [],
  };
  const form = useForm<z.infer<typeof CarGenerationsSchema>>({
    resolver: zodResolver(CarGenerationsSchema),
    defaultValues,
  });
  const isEqual = useObjectCompare(form.getValues(), defaultValues);
  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    setImageAs("file");
    form.reset(defaultValues);
  }, [open, form]);

  useEffect(() => {
    form.setValue("image", []);
  }, [imageAs]);
  function handleClose() {
    setOpen?.(false);
    setMainOpen?.(true);
  }

  async function onSubmit(generation: z.infer<typeof CarGenerationsSchema>) {
    try {
      if (isEqual) throw new Error("You haven't changed anything.");

      if (genToEdit) {
        await editGeneration({
          generation,
          id: genToEdit.id,
          imageToDelete: genToEdit.image || "",
        });
        handleClose();

        toast({
          className: "bg-primary  text-primary-foreground",
          title: "Done.",
          description: (
            <SuccessToastDescription message="Car generation as been updated." />
          ),
        });
      } else {
        await createGeneration(generation);
      }
      handleClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Something went wrong.",
        description: <ErorrToastDescription error={error.message} />,
      });
    }
  }
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      {/* <button
        onClick={() => setIsOpen(true)}
        className=" w-full break-all text-left"
      >
        {openBtn
          ? cloneElement(openBtn, { onClick: () => setMainOpen?.("editGen") })
          : item.name}
      </button> */}

      <DialogContent className=" max-h-[76vh]  overflow-y-auto max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {genToEdit ? "Edit car Generation" : `Add a new generation`}
          </DialogTitle>
          <DialogDescription>
            {genToEdit
              ? "Change the car generation's data."
              : `Add a new generation to the car model (${model?.name})`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 ">
            <div className=" flex items-center gap-2">
              <div className=" space-y-2 w-full mb-auto">
                <FormLabel>Car model</FormLabel>

                <div className="flex items-center h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-not-allowed opacity-50">
                  {model?.name}
                </div>

                <FormDescription>Current car model.</FormDescription>
              </div>

              <FormField
                disabled={isLoading}
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className=" w-full mb-auto">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="name"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the name of the product.
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
            <div className=" space-y-4">
              <div className=" flex justify-end items-center gap-2">
                <FormLabel htmlFor="check">Set image as a url</FormLabel>
                <Checkbox
                  id="check"
                  onCheckedChange={(checked) =>
                    setImageAs(checked ? "url" : "file")
                  }
                />
              </div>

              <FormField
                disabled={isLoading}
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Generation image</FormLabel>
                    <FormControl>
                      {imageAs === "url" ? (
                        <div className=" space-y-3 text-muted-foreground">
                          <div className="  p-4 w-full rounded-xl h-fit border ">
                            {typeof field.value[0] === "string" ? (
                              <img
                                className=" object-contain h-48 w-full "
                                src={field.value[0]}
                              />
                            ) : (
                              <p className="  flex flex-col items-center text-center   gap-2 text-md font-semibold ">
                                Fill the input below with an image link.
                                <Link2 className=" w-8 h-8" />
                              </p>
                            )}
                          </div>
                          <Input
                            onChange={(e) => {
                              field.onChange([e.target.value]);
                            }}
                            placeholder="Paste image url..."
                          />
                        </div>
                      ) : (
                        <FileUploader
                          mediaUrl={genToEdit?.image ? genToEdit.image : ""}
                          fieldChange={field.onChange}
                        />
                      )}
                    </FormControl>
                    <FormDescription>Add a maker logo.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                ) : genToEdit ? (
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
}
