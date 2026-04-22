"use client";
import {
  CreateTicket,
  CreateTicketSchema,
  Ticket,
  TicketCategory,
  TicketPriority,
  TicketStatus as TicketStatusProps,
} from "@lib/types";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { useToast } from "@hooks/use-toast";
import useObjectCompare from "@hooks/use-compare-objs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";
import useCurrUser from "@lib/queries/useCurrUser";
import { cn } from "@lib/utils";
import Spinner from "@components/Spinner";
import { UserX } from "lucide-react";
import ErrorMessage from "@components/error-message";
import {
  createTicketAction,
  editTicketAction,
} from "@lib/actions/tickets-actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Priority } from "@components/priority-select";
import TicketStatus from "@components/ticket-status";
import useClientById from "@lib/queries/client/useClient";
interface Props {
  ticketToEdit?: Ticket;
  showBtn?: boolean;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  ticketCategories: TicketCategory[];
  ticketPriorities: TicketPriority[];
  ticketStatus: TicketStatusProps[];
}
const TicketForm = ({
  ticketToEdit,
  showBtn = true,
  isOpen,
  setIsOpen,
  ticketCategories,
  ticketPriorities,
  ticketStatus,
}: Props) => {
  const [open, setOpen] = useState(false);
  const { user, isLoading, error } = useCurrUser();
  const {
    clientById: client,
    error: clientError,
    isLoading: clientLoading,
  } = useClientById({ id: user?.id, getBy: "user_id" });

  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const diaOpen = isOpen !== undefined ? isOpen : open;
  const isAdmin = user?.user_metadata.role === "Admin";

  const deafultStatus = ticketStatus.find(
    (status) => status.name.toLowerCase() === "open",
  )?.id;

  const defaultPriority = ticketPriorities.find(
    (proio) => proio.name.toLowerCase() === "medium",
  )?.id;
  const defaultValues = useMemo(() => {
    return {
      subject: ticketToEdit?.subject || "",
      description: ticketToEdit?.description || "",
      client_id: client?.id,
      admin_assigned_to: null,
      updated_at: "",
      ticketStatus_id: ticketToEdit?.ticketStatus_id.id || deafultStatus,
      ticketPriority_id: ticketToEdit?.ticketPriority_id.id || defaultPriority,
      ticketCategory_id: ticketToEdit?.ticketCategory_id.id,
    };
  }, [ticketToEdit, client]);

  const form = useForm<z.infer<typeof CreateTicketSchema>>({
    mode: "onChange",
    resolver: zodResolver(CreateTicketSchema),
    defaultValues,
    // shouldUnregister: true,
  });

  const formValues = form.getValues();
  const isEqual = useObjectCompare(formValues, defaultValues);
  const isSubmitting = form.formState.isSubmitting;
  const errors = form.formState.errors;

  // const userError = error || "";
  const handleReset = useCallback(() => {
    if (isSubmitting) return;
    form.reset(defaultValues);
  }, [defaultValues, isSubmitting]);

  const handleOpenChange = useCallback(() => {
    setOpen((open) => !open);
    setIsOpen?.(!diaOpen);
    // handleReset();
  }, [diaOpen, setOpen, setIsOpen, handleReset]);

  function handleClose() {
    setOpen(false);
    setIsOpen?.(false);
  }

  useEffect(() => {
    handleReset();
  }, [diaOpen]);
  async function onSubmit(data: CreateTicket) {
    try {
      if (error || !user || isSubmitting) return;
      const updated_at = new Date().toISOString();
      if (ticketToEdit) {
        const { error } = await editTicketAction({
          id: ticketToEdit.id,
          ...data,
          updated_at,
        });
        if (error) throw Error(error);
      } else {
        const { error } = await createTicketAction({ ...data, updated_at });
        if (error) throw Error(error);
      }

      handleClose();
      toast({
        className: "bg-primary  text-primary-foreground",
        title: `Done.`,
        description: (
          <SuccessToastDescription
            message={`${
              ticketToEdit
                ? "Ticket has been updated."
                : "A new ticket has been opened."
            }`}
          />
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
        <DialogTrigger asChild>
          <Button size="sm">Create Ticket</Button>
        </DialogTrigger>
      )}
      <DialogContent className="  max-h-[80vh] overflow-y-auto">
        <div className=" relative">
          {isLoading && <LoadingCurrUser />}
          {clientError && (
            <ErrorMessage className=" text-sm">
              {" "}
              {clientError.message}{" "}
            </ErrorMessage>
          )}
          {!client && !clientLoading && <FailedToLoadUser />}
          <DialogHeader>
            <DialogTitle>
              {ticketToEdit
                ? ` Edit tickt #${ticketToEdit.id}`
                : `Create a new ticket`}
            </DialogTitle>
            <DialogDescription className=" hidden">
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              ref={formRef}
              onSubmit={form.handleSubmit(onSubmit)}
              className={cn(
                "space-y-4  px-6   relative  py-4 overflow-y-auto overscroll-contain overflow-x-hidden",
              )}
            >
              <div className="  flex flex-col sm:flex-row gap-x-2 gap-y-3 ">
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="ticketCategory_id"
                  render={({ field }) => (
                    <FormItem className=" w-full">
                      <FormLabel>Ticket Category</FormLabel>
                      <FormControl>
                        <Select
                          defaultValue={
                            field.value ? `${field.value}` : undefined
                          }
                          onValueChange={(value) => {
                            field.onChange(Number(value));
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {ticketCategories.length ? (
                              ticketCategories.map((cat) => (
                                <SelectItem key={cat.id} value={`${cat.id}`}>
                                  {cat.name}
                                </SelectItem>
                              ))
                            ) : (
                              <p className=" text-muted-foreground text-center w-full">
                                No ticket categories
                              </p>
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        Enter what category does the ticket fall under.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                disabled={isLoading}
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem className=" w-full">
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Subject..." />
                    </FormControl>
                    <FormDescription className=" hidden">
                      Enter what category does the ticket fall under.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isAdmin && (
                <>
                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="ticketStatus_id"
                    render={({ field }) => (
                      <FormItem className=" w-full">
                        <FormLabel>Ticket Status</FormLabel>
                        <FormControl>
                          <Select
                            defaultValue={
                              field.value ? `${field.value}` : undefined
                            }
                            onValueChange={(value) => {
                              field.onChange(Number(value));
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Ticket Status" />
                            </SelectTrigger>
                            <SelectContent>
                              {ticketStatus.length ? (
                                ticketStatus.map((status) => (
                                  <SelectItem
                                    key={status.id}
                                    value={`${status.id}`}
                                  >
                                    <TicketStatus ticketStatus={status} />
                                  </SelectItem>
                                ))
                              ) : (
                                <p className=" text-muted-foreground text-center w-full">
                                  No ticket status
                                </p>
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          Enter the status of the ticket, ( &apos;Open&apos;,
                          &apos;Solved&apos;, &apos;close&apos;, est... ).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="ticketPriority_id"
                    render={({ field }) => (
                      <FormItem className=" w-full">
                        <FormLabel>Ticket Priority</FormLabel>
                        <FormControl>
                          <Select
                            defaultValue={
                              field.value ? `${field.value}` : undefined
                            }
                            onValueChange={(value) => {
                              field.onChange(Number(value));
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Ticket Status" />
                            </SelectTrigger>
                            <SelectContent>
                              {ticketPriorities.length ? (
                                ticketPriorities.map((prio) => (
                                  <SelectItem
                                    key={prio.id}
                                    value={`${prio.id}`}
                                  >
                                    <Priority priority={prio.name} />
                                  </SelectItem>
                                ))
                              ) : (
                                <p className=" text-muted-foreground text-center w-full">
                                  No ticket priorities
                                </p>
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          Enter the priority level of the ticket, (
                          &apos;Low&apos;, &apos;Meduim&apos;, &apos;High&apos;,
                          est... ).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                disabled={isLoading}
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className=" w-full">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter describe the problem you are facing.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <div className=" flex flex-col gap-2">
          <Button
            size="sm"
            type="button"
            disabled={isSubmitting || isEqual}
            onClick={() => {
              formRef.current?.requestSubmit();
            }}
          >
            {isSubmitting ? <Spinner className=" h-full" /> : "Continue"}
          </Button>
          <Button size="sm" variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

function LoadingCurrUser({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        " w-full h-full absolute left-0 top-0 bg-accent/35 flex items-center justify-center",
        className,
      )}
    >
      <p className=" text-sm font-semibold text-center">Loading User</p>
      <Spinner className=" w-7 h-7" />
    </div>
  );
}

function FailedToLoadUser({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        " w-full h-full absolute left-0 top-0 bg-destructive/40 flex items-center gap-1 justify-center",
        className,
      )}
    >
      <p className=" text-sm font-semibold text-center mb-2">
        Faield to load the current user, please refresh the page or attempt to
        re-login.
      </p>
      <UserX className=" w-7 h-7" />
    </div>
  );
}

export default TicketForm;
