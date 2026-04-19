"use client";
import React, { SetStateAction, useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
  CarItem,
  ClientWithPhoneNumbers,
  EditService,
  EditServiceSchema,
  Service,
  ServiceStatus,
} from "@lib/types";

import Spinner from "@components/Spinner";

import { useToast } from "@hooks/use-toast";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";

import useObjectCompare from "@hooks/use-compare-objs";
import DialogComponent from "@components/dialog-component";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon, ReceiptText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@components/ui/textarea";
import { ServiceStatusCombobox } from "@components/service-status-combobox";
import { editServiceAction } from "@lib/actions/serviceActions";
import { ClientsComboBox } from "@components/clients-combobox";
import { CarsComboBox } from "@components/car-combo-box";

const EditServiceForm = ({
  clients,
  cars,
  status,
  service,
  open,
  setOpen,
  setIsLoading,
}: {
  clients: ClientWithPhoneNumbers[];
  cars: CarItem[];
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<"edit" | "delete" | "note" | "">>;
  setIsLoading: React.Dispatch<SetStateAction<boolean>>;
  service: Service;
  status: ServiceStatus[];
}) => {
  const { toast } = useToast();

  const defaultValues = {
    created_at: new Date(service.created_at),
    clientId: service.clients.id || 0,
    carId: service.cars.id || 0,
    serviceStatusId: service.serviceStatuses.id || 0,
    note: service.note || "",
  };
  const form = useForm<EditService>({
    mode: "onChange",
    resolver: zodResolver(EditServiceSchema),
    defaultValues,
  });

  const isEqual = useObjectCompare(form.getValues(), defaultValues);
  useEffect(() => {
    form.reset(defaultValues);

    const body = document.querySelector("body");
    if (body) {
      body.style.pointerEvents = "auto";
    }
    return () => {
      if (body) body.style.pointerEvents = "auto";
    };
  }, [open]);
  const isLoading = form.formState.isSubmitting;

  async function onSubmit(data: EditService) {
    // format(value, "yyyy-MM-dd")
    const editedData = {
      ...data,
      created_at: data.created_at.toISOString(),
      id: service.id,
    };

    try {
      if (isEqual) throw new Error("You haven't changed anything.");
      setIsLoading(true);

      const { error } = await editServiceAction(editedData);
      if (error) throw new Error(error);
      setOpen("");
      toast({
        className: "bg-primary  text-primary-foreground",
        title: "Success!.",
        description: (
          <SuccessToastDescription message="Service data has been updated." />
        ),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Something went wrong while updating the service fee data.",
        description: <ErorrToastDescription error={error.message} />,
      });
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <DialogComponent
      open={open}
      onOpenChange={() => setOpen((open) => (open === "edit" ? "" : "edit"))}
    >
      <DialogComponent.Content className="  max-h-[65vh]  sm:max-h-[76vh] overflow-y-auto max-w-[1000px] sm:p-14">
        <DialogComponent.Header>
          <DialogComponent.Title>
            {service
              ? "Add more product sold to the service."
              : "Edit product sold."}
          </DialogComponent.Title>
          <DialogComponent.Description className="hidden">
            Create a new car information.
          </DialogComponent.Description>
        </DialogComponent.Header>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 ">
            <div className=" flex    items-center gap-3">
              <FormField
                disabled={isLoading}
                control={form.control}
                name="carId"
                render={({ field }) => (
                  <FormItem className=" w-full mb-auto">
                    <FormLabel>Car</FormLabel>
                    <FormControl>
                      <CarsComboBox
                        value={field.value}
                        setValue={field.onChange}
                        options={cars}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                disabled={isLoading}
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem className=" w-full mb-auto">
                    <FormLabel>Client</FormLabel>
                    <FormControl>
                      <ClientsComboBox
                        value={field.value}
                        setValue={field.onChange}
                        options={clients}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex  flex-col xs:flex-row    items-center gap-3">
              <FormField
                disabled={isLoading}
                control={form.control}
                name="created_at"
                render={({ field }) => (
                  <FormItem className=" w-full mb-auto">
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              " w-full justify-start text-left gap-2 font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon />
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                disabled={isLoading}
                control={form.control}
                name="serviceStatusId"
                render={({ field }) => (
                  <FormItem className=" w-full mb-auto">
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <ServiceStatusCombobox
                        value={field.value}
                        setValue={field.onChange}
                        options={status}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              disabled={isLoading}
              control={form.control}
              name={`note`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="note..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter any additional detials.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogComponent.Footer>
              <Button
                onClick={() => setOpen("")}
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
                {isLoading ? <Spinner className=" h-full" /> : "Update"}
              </Button>
            </DialogComponent.Footer>
          </form>
        </Form>
      </DialogComponent.Content>
    </DialogComponent>
  );
};

export default EditServiceForm;
