"use client";
import SubmitButton from "@components/submit-button";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import useObjectCompare from "@hooks/use-compare-objs";
import { useToast } from "@hooks/use-toast";
import { Category, CategoryProps, CategorySchema } from "@lib/types";

import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@components/ui/button";
import { FileUploader } from "@components/file-uploader";
import Spinner from "@components/Spinner";
import { createCategory, editCategory } from "@lib/services/categories";

const CategroyForm = ({
  categoryToEdit,
  showBtn = false,
  open,
  setOpen,
}: {
  categoryToEdit?: CategoryProps;
  showBtn?: boolean;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const diaOpen = open !== undefined ? open : isOpen;
  const { toast } = useToast();

  const defaultValues = {
    name: categoryToEdit?.name || "",
    image: [],
  };
  const form = useForm<z.infer<typeof CategorySchema>>({
    resolver: zodResolver(CategorySchema),
    defaultValues,
  });

  const isEqual = useObjectCompare(form.getValues(), defaultValues);
  const isLoading = form.formState.isSubmitting;
  const disabled = isEqual || isLoading;

  const handleOpenChange = useCallback(() => {
    setIsOpen((open) => !open);
    setOpen?.((open) => !open);
  }, [setIsOpen, setOpen]);

  useEffect(() => {
    form.reset(defaultValues);
    return () => {
      const body = document.querySelector("body");
      if (body) body.style.pointerEvents = "auto";
    };
  }, [diaOpen, form]);

  async function onSubmit(category: Category) {
    try {
      if (categoryToEdit) {
        // Editing process
        await editCategory({
          ...category,
          imageToDelete: categoryToEdit.image || "",
          id: categoryToEdit.id,
        });
      } else {
        await createCategory(category);
      }
      handleOpenChange();
      toast({
        className: "bg-primary  text-primary-foreground",
        title: "Done.",
        description: (
          <SuccessToastDescription message="A new category has been created." />
        ),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Something went wrong.",
        description: <ErorrToastDescription error={error.message} />,
      });
    }
  }
  return (
    <Dialog open={diaOpen} onOpenChange={handleOpenChange}>
      {showBtn && (
        <Button
          size="sm"
          onClick={() => {
            setIsOpen(true);
            setOpen?.(true);
          }}
          className=" w-full break-all text-left"
        >
          {categoryToEdit ? "Edit Category" : "Create Categroy"}
        </Button>
      )}

      <DialogContent className=" max-h-[76vh]  overflow-y-auto max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {categoryToEdit ? "Edit car Generation" : `Add a new generation`}
          </DialogTitle>
          <DialogDescription>
            {categoryToEdit
              ? "Change category details."
              : `Add a new category.`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 ">
            <FormField
              disabled={isLoading}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className=" w-full mb-auto">
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
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Generation image</FormLabel>
                  <FormControl>
                    <FileUploader
                      mediaUrl={
                        categoryToEdit?.image ? categoryToEdit.image : ""
                      }
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
                onClick={() => {
                  setOpen?.(false);
                  setIsOpen(false);
                }}
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
                ) : categoryToEdit ? (
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

export default CategroyForm;
