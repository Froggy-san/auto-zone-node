import React, { useCallback, useEffect, useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"

import Spinner from "@/components/Spinner"

import { useToast } from "@/hooks/use-toast"

import useObjectCompare from "@/hooks/use-compare-objs"
import DialogComponent from "@/components/dialog-component"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

import { ProductsComboBox } from "@/components/proudcts-combo-box"
import { formatCurrency } from "@/lib/client-helpers"
import { cn } from "@/lib/utils"

import CurrencyInput from "react-currency-input-field"
import { useLocation, useNavigate, useSearchParams } from "react-router"
import useProductSoldById from "@/features/services/useProductSoldById"
import type z from "zod"
import { productSoldSchema } from "@/schemas/productSold.schema"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import type { Product } from "@/types/product"
import ErrorMessage from "@/components/error-message"
import { BASE_URL } from "@/lib/constants"

import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import useCreateProSold from "@/features/services/useCreateProSold"
import useUpdateProSold from "@/features/services/useUpdateProSold"

const EditSoldForm = (
  {
    // open,
    // proSold,
    // addSoldId,
    // products,
    // service,
  }: {
    // open: boolean
    // proSold: ProductToSell | undefined | null
    // addSoldId?: string
    // products: ProductWithCategory[]
    // service: { id: number; totalPrice: number } | null
  }
) => {
  const [product, setProduct] = useState<Product | null>(null)
  const [maxAmount, setMaxAmount] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const pathname = useLocation().pathname
  const [searchParams] = useSearchParams()
  const productToEditId = searchParams.get("editSold") ?? ""
  const addSoldId = searchParams.get("addSoldId") ?? ""
  const open = productToEditId !== "" || addSoldId !== ""
  const { mutateAsync: createProSold } = useCreateProSold()
  const { mutateAsync: updateProSold } = useUpdateProSold()
  const queryClient = useQueryClient()
  const {
    data: proSold,
    isLoading: isLoadingProductSold,
    error: proSoldError,
  } = useProductSoldById(productToEditId)

  const relatedProduct = proSold?.product
  const proImage = relatedProduct?.productImages[0]?.imageUrl

  const defaultValues = useMemo(() => {
    setMaxAmount(proSold?.product.stock || 0)
    return {
      pricePerUnit: proSold?.pricePerUnit || 0,
      discountPerUnit: proSold?.discountPerUnit || 0,
      count: proSold?.count || 0,
      isReturned: proSold?.isReturned || false,
      note: proSold?.note || "",
      product: proSold ? proSold.product._id : "",
    }
  }, [proSold])
  const form = useForm<z.infer<typeof productSoldSchema>>({
    mode: "onChange",
    resolver: zodResolver(productSoldSchema),
    defaultValues,
  })

  const { pricePerUnit, count, discountPerUnit } = form.watch()
  useEffect(() => {
    setMaxAmount(0)
    setProduct(null)
    form.reset(defaultValues)
  }, [open, defaultValues])

  useEffect(() => {
    form.reset(defaultValues)
  }, [open])

  const isEqual = productToEditId
    ? !form.formState.isValid || !form.formState.isDirty
    : !form.formState.isValid
  const handleClose = useCallback(() => {
    const params = new URLSearchParams(searchParams)
    params.delete("editSold")
    params.delete("addSoldId")
    navigate(`${pathname}?${String(params)}`)
    form.reset()
  }, [open])

  const isLoading = form.formState.isSubmitting

  async function onSubmit(data: z.infer<typeof productSoldSchema>) {
    try {
      if (isEqual) throw new Error("You haven't changed anything.")

      if (addSoldId) {
        // const chosenProduct = products.find((pro) => pro.id === productId) // get the data of the chosen product.

        // if (!chosenProduct)
        //   throw new Error(`There was a problem with picking the product sold.`)

        // const { categories, productImages, ...product } = chosenProduct
        // const proToUpdate = product as Product
        // const newSerivceAmount = service.totalPrice + totalPriceAfterDiscount
        //   const stockUpdates = {
        // id:proToUpdate.id,
        //     quantity: proToUpdate.stock - count,
        //   }; // Calc the the new stock number.
        // const { error } = await createProductToSellAction(
        //   addSoldProduct,
        //   newSerivceAmount
        // )
        // if (error) throw new Error(error)
        await createProSold({ ...data, service: addSoldId })
      }

      // If the admin wants to edit a product sold entry of a service that is already performed
      if (proSold) {
        await updateProSold({
          ...data,
          service: proSold.service,
          _id: proSold._id,
        })
        queryClient.invalidateQueries({
          queryKey: ["productSold", productToEditId],
        })
      }

      handleClose()
      toast.success(
        addSoldId
          ? "Product sold added successfully."
          : "Product sold updated successfully."
      )
    } catch (error: any) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred."
      )
      console.error("Error submitting the form:", error)
    }
  }

  //   if (!feesToEdit) return <p>Something went wrong</p>;

  return (
    <DialogComponent open={open} onOpenChange={handleClose}>
      <DialogComponent.Content className="max-h-[65vh] max-w-[1000px] overflow-y-auto pb-0 sm:max-h-[76vh] sm:p-14 sm:pb-0">
        <DialogComponent.Header>
          <DialogComponent.Title>
            {!addSoldId && !productToEditId ? (
              <p className="text-destructive-foreground font-semibold">
                Something went wrong!
              </p>
            ) : addSoldId ? (
              "Add more product sold to the service."
            ) : (
              "Edit product sold."
            )}
          </DialogComponent.Title>
          <DialogComponent.Description className="hidden">
            Create a new car information.
          </DialogComponent.Description>
        </DialogComponent.Header>

        {isLoadingProductSold ? (
          <Spinner className="h-[300px]" size={35} />
        ) : proSoldError ? (
          <ErrorMessage>
            {proSoldError instanceof Error
              ? proSoldError.message
              : "Something went wrong while fetching the product sold data."}
          </ErrorMessage>
        ) : (
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className={cn("space-y-8", {
              "pointer-events-none opacity-45 blur-sm hover:cursor-not-allowed":
                !addSoldId && !proSold,
            })}
          >
            {addSoldId && (
              <Controller
                name="product"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="flex-1" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Product</FieldLabel>
                    <ProductsComboBox
                      productToSell={[form.getValues()]}
                      disabled={isLoading}
                      value={product}
                      setValue={(selectedProduct) => {
                        field.onChange(selectedProduct?.id ?? "")
                        setProduct(selectedProduct)

                        if (selectedProduct) {
                          setMaxAmount(selectedProduct.stock)
                          form.setValue(
                            "pricePerUnit",
                            selectedProduct.listPrice
                          )
                          form.setValue(
                            "discountPerUnit",
                            selectedProduct.listPrice -
                              selectedProduct.salePrice
                          )
                        }
                      }}
                    />
                    <FieldDescription>
                      Enter what product you bought.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            )}
            {relatedProduct && (
              <div className="flex items-center justify-center gap-3 text-sm sm:text-sm">
                {proImage ? (
                  <img
                    src={`${BASE_URL}${proImage}`}
                    alt="Product"
                    className="h-12 w-12 rounded-sm object-cover"
                  />
                ) : null}{" "}
                <span>{relatedProduct.name}</span>{" "}
                <span>Stock: {relatedProduct.stock}</span>{" "}
                <span>Price Per Unit: {relatedProduct.listPrice}</span>{" "}
                <span>
                  Discount Per Unit:{" "}
                  {relatedProduct.listPrice - relatedProduct.salePrice}
                </span>
              </div>
            )}
            {/* ROW FOR PRICING AND QUANTITY COUNTS */}
            <div className="flex items-center gap-1 xs:gap-3">
              {/* PRICE PER UNIT FIELD */}
              <Controller
                name="pricePerUnit"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    className="mb-auto w-full"
                    data-invalid={fieldState.invalid}
                  >
                    <FieldLabel htmlFor={field.name}>Price per unit</FieldLabel>
                    <CurrencyInput
                      id={field.name}
                      disabled={isLoading}
                      placeholder="Price-per-unit"
                      decimalsLimit={2}
                      prefix="EGP "
                      decimalSeparator="."
                      groupSeparator=","
                      className="input-field"
                      aria-invalid={fieldState.invalid}
                      value={field.value || ""}
                      onValueChange={(formattedValue, name, values) => {
                        field.onChange(Number(values?.value) || 0)
                        form.trigger("discountPerUnit")
                      }}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* DISCOUNT FIELD */}
              <Controller
                name="discountPerUnit"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    className="mb-auto w-full"
                    data-invalid={fieldState.invalid}
                  >
                    <FieldLabel htmlFor={field.name}>
                      Discount per unit
                    </FieldLabel>
                    <CurrencyInput
                      id={field.name}
                      disabled={isLoading}
                      placeholder="Discount-per-unit"
                      decimalsLimit={2}
                      prefix="EGP "
                      decimalSeparator="."
                      groupSeparator=","
                      className="input-field"
                      aria-invalid={fieldState.invalid}
                      value={field.value || ""}
                      onValueChange={(formattedValue, name, values) => {
                        field.onChange(Number(values?.value) || 0)
                      }}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* QUANTITY COUNT FIELD */}
              <Controller
                name="count"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    className="mb-auto w-full"
                    data-invalid={fieldState.invalid}
                  >
                    <FieldLabel htmlFor={field.name}>Count</FieldLabel>
                    <CurrencyInput
                      id={field.name}
                      disabled={isLoading}
                      placeholder="Available Stock"
                      decimalsLimit={2}
                      prefix="UNITS "
                      decimalSeparator="."
                      groupSeparator=","
                      className="input-field"
                      aria-invalid={fieldState.invalid}
                      value={field.value || ""}
                      onValueChange={(formattedValue, name, values) => {
                        const newValue = Number(values?.value) || 0
                        const isMaxAmount = newValue > maxAmount

                        field.onChange(isMaxAmount ? maxAmount : newValue)

                        // if (isMaxAmount) {
                        //   toast({
                        //     variant: "destructive",
                        //     title: "Maximum amount.",
                        //     description: (
                        //       <ErorrToastDescription
                        //         error={`Count number must be lower than ${maxAmount}`}
                        //       />
                        //     ),
                        //   })
                        // }
                      }}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            {/* NOTES TEXTAREA FIELD */}
            <Controller
              name="note"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Notes</FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    disabled={isLoading}
                    placeholder="note..."
                    aria-invalid={fieldState.invalid}
                    value={field.value || ""}
                  />
                  <FieldDescription>
                    Enter any additional details.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* DYNAMIC RETURN SWITCH FIELD */}
            {!addSoldId && (
              <Controller
                name="isReturned"
                control={form.control}
                render={({ field }) => (
                  <FieldLabel htmlFor="switch-notifications" className="mt-8">
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle>Is Returned?</FieldTitle>
                        <FieldDescription>
                          Mark this product sold as returned.
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
            )}

            <div className="w-[300px]">
              <h3 className="text-sm">Summary:</h3>
              <div className="space-y-2 border-t border-b py-2 text-xs text-muted-foreground">
                <div>
                  Amount:{" "}
                  <span className="relative after:absolute after:-top-1 after:-right-8 after:text-dashboard-indigo after:content-['units']">
                    {count}
                  </span>
                </div>
                <div>Price per unit: {formatCurrency(pricePerUnit)}</div>
                <div>
                  Total price before discount:{" "}
                  {formatCurrency(pricePerUnit * count)}
                </div>
                <div>
                  Total discount: {formatCurrency(discountPerUnit * count)}
                </div>
                <div className="border-t pt-1">
                  Net:{" "}
                  {formatCurrency((pricePerUnit - discountPerUnit) * count)}
                </div>
              </div>
            </div>
            <DialogComponent.Footer className="sticky bottom-0 z-50 !mt-4 w-full bg-background pt-4 pb-5 sm:pb-14">
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
                disabled={isLoading || isEqual}
                className="w-full sm:w-[unset]"
              >
                {isLoading ? (
                  <Spinner className="h-full" />
                ) : addSoldId ? (
                  "Add"
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

export default EditSoldForm
