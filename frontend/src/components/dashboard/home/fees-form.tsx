import React, { useCallback, useEffect, useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"

import Spinner from "@/components/Spinner"

import { useToast } from "@/hooks/use-toast"
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@/components/toast-items"

import useObjectCompare from "@/hooks/use-compare-objs"
import DialogComponent from "@/components/dialog-component"

import { ComboBox } from "@/components/combo-box"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

import CurrencyInput from "react-currency-input-field"
import type { Category, ServiceFee } from "@/types"
import { useLocation, useNavigate, useSearchParams } from "react-router"
import { ServiceFeeSchema } from "@/schemas/serviceFee.schema"

import useServiceFeeById from "@/features/services/useServiceFeeById"
import useCategories from "@/features/categories/useCategories"
import ErrorMessage from "@/components/error-message"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import useCreateServiceFee from "@/features/services/useCreateServiceFee"
import useUpdateServiceFee from "@/features/services/useUpdateServiceFee"

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en", { style: "currency", currency: "egp" }).format(
    value
  )
const FeesForm = (
  {
    // open,
    // feesToEdit,
    // addFeeId,
    // categories,
    // service,
  }: {
    // open?: boolean
    // feesToEdit: ServiceFee
    // addFeeId?: string
    // categories: Category[]
    // service: { id: number; totalPrice: number } | null
  }
) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const pathname = useLocation().pathname
  const [searchParams] = useSearchParams()
  const { mutateAsync: createServiceFee } = useCreateServiceFee()
  const { mutateAsync: updateServiceFee } = useUpdateServiceFee()

  const addFeeId = searchParams.get("addFeeId") ?? "" // This is the ID of the service you want to add the service fee to
  const editFeeId = searchParams.get("editFee") ?? ""

  const isOpen = addFeeId !== "" || editFeeId !== ""
  const {
    data: feesToEdit,
    isLoading: serviceFeeLoading,
    error: seviceFeeError,
  } = useServiceFeeById(editFeeId)

  const {
    categories,
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useCategories()

  const isDataLoading = isCategoriesLoading || serviceFeeLoading
  const isError =
    categoriesError || seviceFeeError || (!feesToEdit && editFeeId !== "")

  const serviceId = addFeeId || feesToEdit?.service
  const defaultValues = useMemo(() => {
    return {
      price: feesToEdit?.price || 0,
      discount: feesToEdit?.discount || 0,
      isReturned: feesToEdit?.isReturned || false,
      category: feesToEdit?.category._id || "",
      note: feesToEdit?.note || "",
    }
  }, [feesToEdit, addFeeId, editFeeId])

  const form = useForm<z.infer<typeof ServiceFeeSchema>>({
    mode: "onChange",
    shouldUnregister: false,
    resolver: zodResolver(ServiceFeeSchema),
    defaultValues,
  })

  const { discount, price } = form.watch()

  // Dynamically determine if we are editing or creating
  const isEditing = editFeeId !== "" && editFeeId !== undefined
  const { isValid, isDirty, errors } = form.formState
  const isSubmitDisabled = isEditing
    ? !isValid || !isDirty // If editing: disable if invalid OR if nothing changed
    : !isValid

  useEffect(() => {
    form.reset(defaultValues)
  }, [isOpen, feesToEdit])

  useEffect(() => {
    if (price > discount) {
      form.clearErrors("discount")
    }
  }, [discount, price, form])

  const handleClose = useCallback(() => {
    const params = new URLSearchParams(searchParams)
    params.delete("editFee")
    params.delete("addFeeId")
    navigate(`${pathname}?${String(params)}`)
    form.reset()
  }, [open, searchParams])

  const isLoading = form.formState.isSubmitting

  async function onSubmit(data: z.infer<typeof ServiceFeeSchema>) {
    try {
      // If the user hasn't changed anything about the form values.
      if (isSubmitDisabled) throw new Error("You haven't changed anything.")
      if (!serviceId)
        throw new Error(`Something went wrong please refresh the page.`)

      if (addFeeId) {
        await createServiceFee({ ...data, service: addFeeId })
      }
      // In the case of editting a serivce fee.
      if (feesToEdit) {
        await updateServiceFee({
          ...data,
          service: feesToEdit.service,
          _id: feesToEdit._id,
        })

        queryClient.invalidateQueries({
          queryKey: ["serviceFee", feesToEdit._id],
        })
      }

      // Close the dialog and reset the form values to the default values.
      handleClose()

      // Display a toast depending on the actions made.
      toast.success(
        addFeeId
          ? "A new service fee as been added"
          : "Service fee has been edited successfuly"
      )
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  //   if (!feesToEdit) return <p>Something went wrong</p>;

  return (
    <DialogComponent open={isOpen} onOpenChange={handleClose}>
      <DialogComponent.Content className="max-h-[65vh] max-w-[1000px] overflow-y-auto sm:max-h-[76vh] sm:p-14">
        <DialogComponent.Header>
          <DialogComponent.Title>
            {addFeeId ? `Add More Service Fees` : "Edit Service Fee"}
          </DialogComponent.Title>
          <DialogComponent.Description className="hidden"></DialogComponent.Description>
        </DialogComponent.Header>

        {isDataLoading ? (
          <Spinner className="h-[250px]" size={30} />
        ) : isError ? (
          <ErrorMessage>
            {categoriesError?.message ||
              seviceFeeError?.message ||
              "Failed to load data"}
          </ErrorMessage>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex items-center gap-3">
              <Controller
                name="price"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="mb-auto">
                    <FieldLabel htmlFor={field.name}>Price</FieldLabel>
                    <CurrencyInput
                      id="fees-price"
                      name="price"
                      placeholder="Price"
                      decimalsLimit={2} // Max number of decimal places
                      prefix="EGP " // Currency symbol (e.g., Egyptian Pound)
                      decimalSeparator="." // Use dot for decimal
                      groupSeparator="," // Use comma for thousands
                      value={field.value || ""}
                      onValueChange={(formattedValue, name, value) => {
                        // setFormattedListing(formattedValue || "");

                        field.onChange(Number(value?.value) || 0)
                        form.trigger("discount")
                      }}
                      className="input-field"
                    />
                    <FieldDescription>
                      Enter service fee price.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="discount"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="mb-auto">
                    <FieldLabel htmlFor={field.name}>Discount</FieldLabel>
                    <CurrencyInput
                      id="fees-discount"
                      name="discount"
                      placeholder="Discount"
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
                      Enter service fee discount.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="category"
              control={form.control}
              render={({ field, fieldState }) => (
                <div
                  className="mb-auto w-full space-y-4"
                  data-invalid={fieldState.invalid}
                >
                  <label className="block text-sm leading-none font-medium">
                    Category
                  </label>
                  {categories && (
                    <ComboBox
                      disabled={isLoading}
                      options={categories}
                      value={field.value}
                      setValue={field.onChange}
                    />
                  )}
                  <p className="block text-xs text-muted-foreground">
                    Select the related category.
                  </p>
                  {fieldState.error && (
                    <p className="block text-sm font-medium text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />
            <Controller
              name="note"
              control={form.control}
              render={({ field, fieldState }) => (
                <div
                  className="mt-8 space-y-4"
                  data-invalid={fieldState.invalid}
                >
                  <label
                    htmlFor={field.name}
                    className="block text-sm leading-none font-medium"
                  >
                    Note
                  </label>
                  <Textarea
                    {...field}
                    id={field.name}
                    disabled={isLoading}
                    placeholder="Add notes..."
                    aria-invalid={fieldState.invalid}
                  />
                  <p className="block text-xs text-muted-foreground">
                    Enter any additional details.
                  </p>
                  {fieldState.error && (
                    <p className="block text-sm font-medium text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />
            <div className="flex flex-wrap-reverse items-center justify-between gap-x-4 gap-y-4">
              <div className="text-xs text-muted-foreground">
                Net: {formatCurrency(price - discount)}
              </div>

              {!addFeeId ? (
                <Controller
                  name="isReturned"
                  control={form.control}
                  render={({ field }) => (
                    <FieldLabel htmlFor="switch-notifications" className="mt-8">
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldTitle>Is Returned?</FieldTitle>
                          <FieldDescription>
                            Mark this service fee as returned.
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
                />
              ) : (
                <div />
              )}
            </div>

            <DialogComponent.Footer>
              <Button
                onClick={handleClose}
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
                disabled={isLoading || isSubmitDisabled}
                className="w-full sm:w-[unset]"
              >
                {isLoading ? (
                  <Spinner className="h-full" />
                ) : addFeeId ? (
                  "add"
                ) : (
                  "Update"
                )}
              </Button>
            </DialogComponent.Footer>
          </form>
        )}
      </DialogComponent.Content>
    </DialogComponent>
  )
}

export default FeesForm
