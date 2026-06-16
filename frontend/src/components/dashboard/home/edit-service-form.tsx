import React, {
  type SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"

import Spinner from "@/components/Spinner"

import DialogComponent from "@/components/dialog-component"

import { Textarea } from "@/components/ui/textarea"
import { ServiceStatusCombobox } from "@/components/service-status-combobox"
// import { editServiceAction } from "@lib/actions/serviceActions"
import { ClientsComboBox } from "@/components/clients-combobox"
// import { CarsComboBox } from "@/components/car-combo-box"
import type { Service, ServiceStatus } from "@/types"
import { EditServiceSchema } from "@/schemas/service.schema"

import type z from "zod"
import { toast } from "sonner"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import CurrencyInput from "react-currency-input-field"
import PrioritySelect from "@/components/priority-select"
import { Input } from "@/components/ui/input"
import DatePicker from "@/components/DatePicker"
import { useQueryClient } from "@tanstack/react-query"
import { Switch } from "@/components/ui/switch"
import { AnimatePresence } from "framer-motion"
import FormErrorMessage from "@/components/form-error-message"
import { formatCurrency } from "@/lib/client-helpers"
import useUpdateService from "@/features/services/useUpdateService"

const EditServiceForm = ({
  // clients,
  // cars,
  status,
  service,
  open,
  setOpen,
  setIsLoading,
}: {
  // clients: User[]
  // cars: CarI[]
  open: boolean
  setOpen: React.Dispatch<SetStateAction<"edit" | "delete" | "note" | "">>
  setIsLoading: React.Dispatch<SetStateAction<boolean>>
  service: Service
  status: ServiceStatus[]
}) => {
  const { mutateAsync: updateService } = useUpdateService()
  const defaultValues = {
    serviceDate: new Date(service.serviceDate),
    user: service.user._id || "",
    car: service.car._id || "",
    serviceStatus: service.serviceStatus._id || "",
    odometer: service.odometer || "",
    amountReceived: service.amountReceived || 0,
    paymentStatus: service.paymentStatus || "unpaid",
    priority: service.priority || "low",
    laborTime: service.laborTime || 0,
    technician: service.technician.map((t) => t._id) || [],
    note: service.note || "",

    // isReturned: service.isReturned,
  }
  const form = useForm<z.infer<typeof EditServiceSchema>>({
    mode: "onChange",
    resolver: zodResolver(EditServiceSchema),
    defaultValues,
  })

  const isEqual =
    Object.entries(form.formState.errors).length > 0 || !form.formState.isDirty
  useEffect(() => {
    form.reset(defaultValues)

    const body = document.querySelector("body")
    if (body) {
      body.style.pointerEvents = "auto"
    }
    return () => {
      if (body) body.style.pointerEvents = "auto"
    }
  }, [open])
  const isLoading = form.formState.isSubmitting

  async function onSubmit(data: z.infer<typeof EditServiceSchema>) {
    try {
      if (isEqual) throw new Error("You haven't changed anything.")
      setIsLoading(true)

      await updateService({ service: data, id: service._id })

      setOpen("")
      toast.success("Serivce details has been updated")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <DialogComponent
      open={open}
      onOpenChange={() => setOpen((open) => (open === "edit" ? "" : "edit"))}
    >
      <DialogComponent.Content className="max-h-[65vh] max-w-[1000px] overflow-y-auto sm:max-h-[76vh] sm:p-14">
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

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex flex-col gap-2 space-y-4 sm:flex-row sm:space-y-0">
            <div className="group/field flex w-full flex-col gap-3 *:w-full data-[invalid=true]:text-destructive [&>.sr-only]:w-auto">
              <FieldLabel>Client</FieldLabel>
              <Input
                disabled
                placeholder="Client"
                value={service.user.username}
              />
              <FieldDescription>Car owner.</FieldDescription>
            </div>

            <div className="group/field flex w-full flex-col gap-3 *:w-full data-[invalid=true]:text-destructive [&>.sr-only]:w-auto">
              <FieldLabel>Car</FieldLabel>
              <Input
                disabled
                placeholder="Car"
                value={service.car.plateNumber}
              />
              <FieldDescription>
                Plate number of the car being serviced.
              </FieldDescription>
            </div>
            <Controller
              name="odometer"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="mb-auto">
                  <FieldLabel htmlFor={field.name}>Km Count</FieldLabel>
                  <CurrencyInput
                    id={field.name}
                    name={field.name}
                    placeholder={field.name}
                    decimalsLimit={2} // Max number of decimal places
                    prefix="Km " // Currency symbol (e.g., Egyptian Pound)
                    decimalSeparator="." // Use dot for decimal
                    groupSeparator="," // Use comma for thousands
                    value={field.value || ""}
                    onValueChange={(formattedValue, name, value) => {
                      // setFormattedListing(formattedValue || "");

                      field.onChange(formattedValue || "")
                    }}
                    className="input-field"
                  />

                  <FieldDescription>
                    Enter the distance traveled in kilometers.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <div className="flex flex-col gap-2 space-y-4 sm:flex-row sm:space-y-0">
            <Controller
              name="serviceStatus"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="mb-auto">
                  <FieldLabel htmlFor={field.name}>Service Status</FieldLabel>
                  <ServiceStatusCombobox
                    setValue={field.onChange}
                    value={field.value}
                    disabled={isLoading}
                  />
                  <FieldDescription>
                    Select the status of the service.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="priority"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="mb-auto">
                  <FieldLabel htmlFor={field.name}>Priority</FieldLabel>
                  <PrioritySelect
                    value={field.value}
                    onChange={field.onChange}
                    className="flex w-full items-center"
                  />
                  <FieldDescription>
                    Select the priority of the service.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="amountReceived"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="mb-auto">
                  <FieldLabel htmlFor={field.name}>Amount Received</FieldLabel>
                  <CurrencyInput
                    id={field.name}
                    name={field.name}
                    placeholder={field.name}
                    decimalsLimit={2} // Max number of decimal places
                    prefix="EGP " // Currency symbol (e.g., Egyptian Pound)
                    decimalSeparator="." // Use dot for decimal
                    groupSeparator="," // Use comma for thousands
                    value={field.value || ""}
                    onValueChange={(formattedValue, name, value) => {
                      // setFormattedListing(formattedValue || "");

                      field.onChange(Number(value?.value) || 0)
                    }}
                    className="input-field"
                  />

                  <FieldDescription>
                    Enter the amount received from the grand total of the
                    service{" "}
                    <span className="font-semibold text-green-600">
                      {formatCurrency(Math.floor(service.grandTotal))}
                    </span>
                    .
                    <AnimatePresence>
                      {Math.floor(field.value) >
                        Math.floor(service.grandTotal) && (
                        <FormErrorMessage className="text-yellow-600">
                          Amount received shouldn't be greater than the grand
                          total. But you can proceed anyways.
                        </FormErrorMessage>
                      )}
                    </AnimatePresence>
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
          <div className="flex flex-col gap-2 space-y-4 sm:flex-row sm:space-y-0">
            <Controller
              name="technician"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="mb-auto">
                  <FieldLabel htmlFor={field.name}>Tecnician</FieldLabel>
                  <ClientsComboBox
                    setValue={(value) => field.onChange([value])}
                    value={field.value[0]}
                    disabled={isLoading}
                    adminOnly
                  />

                  <FieldDescription>
                    Enter the tecnician performing the service.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="laborTime"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="mb-auto">
                  <FieldLabel htmlFor={field.name}>Labor Time</FieldLabel>
                  <CurrencyInput
                    id="labor-time"
                    name="labor-time"
                    placeholder="labor-time"
                    decimalsLimit={2} // Max number of decimal places
                    prefix="Hrs " // Currency symbol (e.g., Egyptian Pound)
                    decimalSeparator="." // Use dot for decimal
                    groupSeparator="," // Use comma for thousands
                    value={field.value || ""}
                    onValueChange={(formattedValue, name, value) => {
                      // setFormattedListing(formattedValue || "");

                      field.onChange(Number(formattedValue) || 0)
                    }}
                    className="input-field"
                  />

                  <FieldDescription>
                    Enter the labor time in hours.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="serviceDate"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="mb-auto">
                  <FieldLabel htmlFor={field.name}>Service Date</FieldLabel>
                  <DatePicker
                    disabled={isLoading}
                    placeholder="Service Date"
                    date={field.value}
                    setDate={field.onChange}
                  />
                  <FieldDescription>
                    Enter the date when the service was initalized.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
          <Controller
            name="note"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="mb-auto">
                <FieldLabel htmlFor={field.name}>Note</FieldLabel>
                <Textarea
                  disabled={isLoading}
                  placeholder="Additional details..."
                  {...field}
                />

                <FieldDescription>
                  Enter the tecnician performing the service.
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          {/* <Controller
            name="isReturned"
            control={form.control}
            render={({ field }) => (
              <FieldLabel htmlFor="switch-notifications" className="mt-8">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Is Returned?</FieldTitle>
                    <FieldDescription>
                      Toggle if the service and it's products have been returned
                      by the coustomer.
                      <p className="text-xs text-yellow-600">
                        This will exclude the service from the revenue report.
                        And it will restock the products.
                      </p>
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="switch-notifications"
                    defaultChecked
                  />
                </Field>
              </FieldLabel>
            )}
          /> */}
          <DialogComponent.Footer>
            <Button
              onClick={() => setOpen("")}
              disabled={isLoading}
              type="reset"
              variant="secondary"
              size="sm"
              className="w-full sm:w-[unset]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || isEqual}
              className="w-full sm:w-[unset]"
            >
              {isLoading ? <Spinner className="h-full" /> : "Update"}
            </Button>
          </DialogComponent.Footer>
        </form>
      </DialogComponent.Content>
    </DialogComponent>
  )
}

export default EditServiceForm
