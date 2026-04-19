"use client";
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
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
  Client,
  ClientWithPhoneNumbers,
  CreateClient,
  CreateClientSchema,
  PhoneNumber,
} from "@lib/types";
import { motion } from "framer-motion";

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

import useObjectCompare from "@hooks/use-compare-objs";
import { Cross2Icon } from "@radix-ui/react-icons";
import {
  createClientAction,
  editClientAction,
} from "@lib/actions/clientActions";
import { RotateCcw } from "lucide-react";

const ClientForm = ({
  open,
  client,
  handleClose: handleCloseExternal,
}: {
  open?: boolean;
  handleClose?: () => void;
  client?: ClientWithPhoneNumbers;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [deletedPhones, setDeletedPhones] = useState<PhoneNumber[]>([]);
  const { toast } = useToast();
  const isItOpen = open !== undefined ? open : isOpen;

  const clientsPhone = client
    ? client.phones.map((phone) => {
        return {
          id: phone.id,
          number: phone.number,
          clientId: phone.clientId,
        };
      })
    : [];

  const defaultValues = {
    name: client?.name || "",
    email: client?.email || "",
    phones: clientsPhone,
  };
  const form = useForm<z.infer<typeof CreateClientSchema>>({
    resolver: zodResolver(CreateClientSchema),
    defaultValues,
  });

  const phonesNumbers = form.getValues("phones");

  const isEqual = useObjectCompare(form.getValues(), defaultValues);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "phones",
  });

  function handleClose() {
    handleCloseExternal?.();
    setIsOpen(false);
  }

  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    const body = document.querySelector("body");
    form.reset(defaultValues);
    if (body) {
      body.style.pointerEvents = "auto";
    }
    return () => {
      if (body) body.style.pointerEvents = "auto";
    };
  }, [isItOpen]);

  async function onSubmit({ name, email, phones }: CreateClient) {
    try {
      if (client) {
        const phonesToAdd = phones.filter(
          (phone) => !phone.clientId && !phone.id
        );

        const phonesToEdit = phones.filter(
          (phone) => phone.id !== undefined && phone.clientId !== undefined
        ) as PhoneNumber[];
        const clientToEdit = { name, email, id: client.id } as Client;

        const { error } = await editClientAction({
          clientToEdit,
          phonesToAdd,
          phonesToDelete: deletedPhones,
          phonesToEdit,
        });
        if (error) throw new Error(error);
      } else {
        const data = await createClientAction({
          name,
          email,
          phones,
          provider: "Email",
        });
        if (data?.error) throw new Error(data.error);
      }
      handleClose();
      setDeletedPhones([]);
      toast({
        className: "bg-primary  text-primary-foreground",
        title: client ? `Data update.` : "New client.",
        description: (
          <SuccessToastDescription
            message={
              client
                ? `'${client.name}' data has been updated.`
                : "A new client has been created."
            }
          />
        ),
      });

      // handleClose();
    } catch (error: any) {
      // form.reset();
      toast({
        variant: "destructive",
        title: "Faild to create a new client.",
        description: <ErorrToastDescription error={error.message} />,
      });
    }
  }
  return (
    <Dialog open={isItOpen} onOpenChange={handleClose}>
      {open === undefined && (
        <Button onClick={() => setIsOpen(true)} size="sm" className=" w-full">
          Create client
        </Button>
      )}

      <DialogContent className=" max-h-[65vh]  sm:max-h-[76vh]  overflow-y-auto max-w-[1000px] sm:p-14">
        <DialogHeader>
          <DialogTitle>Clients</DialogTitle>
          <DialogDescription>Create a new client.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 ">
            <div className=" flex flex-col sm:flex-row  gap-2 space-y-4 sm:space-y-0">
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
                        placeholder="Client's name..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Enter client&apos;s name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                disabled={isLoading}
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className=" w-full mb-auto">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        disabled={isLoading}
                        placeholder="Client's email..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter client&apos;s email.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className=" space-y-4">
              <div className=" border  flex  items-center px-4 py-2 rounded-lg justify-between">
                <span className=" text-muted-foreground text-sm">
                  Add client phone numbers
                </span>
                <Button
                  size="sm"
                  type="button"
                  className=" text-xs"
                  onClick={() => append({ number: "" })}
                >
                  ADD
                </Button>
              </div>

              {fields.map((field, i) => (
                <motion.div
                  initial={{
                    opacity: 0.2,
                    y: -20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, type: "spring" },
                  }}
                  exit={{
                    opacity: 0.2,
                    y: -150,
                    transition: { duration: 0.1, type: "spring" },
                  }}
                  key={field.id}
                  className=" flex items-center gap-3"
                >
                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name={`phones.${i}.number`}
                    render={({ field }) => (
                      <FormItem className=" flex-1">
                        <FormLabel>{`Phone ${i + 1}`}</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            disabled={isLoading}
                            placeholder="Additional notes..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter client&apos;s phone number.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <button
                    onClick={() => {
                      remove(i);
                      if (
                        field.clientId &&
                        phonesNumbers[i].id &&
                        phonesNumbers[i].clientId
                      ) {
                        setDeletedPhones((prev) => [
                          ...prev,
                          phonesNumbers[i] as PhoneNumber,
                        ]);
                      }
                    }}
                    className=" rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground "
                    type="button"
                  >
                    <Cross2Icon className="h-4 w-4" />
                    {/* <span className="sr-only">Close</span> */}
                  </button>
                </motion.div>
              ))}
            </div>
            <div className=" relative flex flex-col-reverse sm:flex-row items-center justify-end  gap-3">
              <Button
                onClick={() => form.reset()}
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
                ) : client ? (
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

export default ClientForm;
