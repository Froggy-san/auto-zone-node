import React, { useCallback, useEffect, useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"

import { AnimatePresence, motion } from "framer-motion"

import Spinner from "@/components/Spinner"

// import SuccessToastDescription, {
//   ErorrToastDescription,
// } from "@components/toast-items"

import useObjectCompare from "@/hooks/use-compare-objs"
import { Cross2Icon } from "@radix-ui/react-icons"
import {
  AlertTriangle,
  Info,
  RotateCcw,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
// import {
//   createProductBoughtBulkAction,
//   editProductBoughtAction,
// } from "@lib/actions/productBoughtActions"
import { ProductsComboBox } from "@/components/proudcts-combo-box"
// import { RestockingComboBox } from "@components/restocking-combo-box"

import DialogComponent from "@/components/dialog-component"

import { Switch } from "@/components/ui/switch"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import CurrencyInput from "react-currency-input-field"

import { Link, useLocation, useNavigate, useSearchParams } from "react-router"
import useSupplierInvoiceById from "./useSupplierInvoiceById"
import {
  CreateSupplierInvoiceSchema,
  type CreateSupplierInvoiceInput,
} from "@/schemas/supplierInvoice.schema"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import type { Product } from "@/types"
import { TAX_PER } from "@/lib/constants"
import { SupplierStatusSelector } from "./SupplierStatusSelector"
import CloseButton from "@/components/close-button"
import FormErrorMessage from "@/components/form-error-message"
import { formatCurrency } from "@/lib/helper"
import { cn } from "@/lib/utils"
import useCreateSupplierInvoice from "./useCreateSupplierInvoice"

const SupplierInvoiceForm = () => {
  const [products, setProducts] = useState<(Product | null)[]>([])
  const [isOpen, setIsOpen] = useState(false)
  // const [isReturned, setIsReturned] = useState<boolean>(
  //   proBoughtToEdit?.isReturned ? proBoughtToEdit.isReturned : false
  // )

  const [searchParam, setSearchParam] = useSearchParams()
  const navigate = useNavigate()
  const pathname = useLocation().pathname

  const supplierInvoiceId = searchParam.get("supplierInvoiceId") // this is for adding a new item to a supplier invoice
  const supplierItemId = searchParam.get("edit")

  const open = supplierItemId || supplierInvoiceId

  const {
    data: supplierById,
    isLoading: supplierByIdLoading,
    error: supplierByIdError,
  } = useSupplierInvoiceById(supplierItemId)
  const { mutateAsync: createSupplierInvoice } = useCreateSupplierInvoice()
  const itemToEdit = supplierById?.items.find(
    (i) => i.product._id === supplierItemId
  )

  const editProBught = useMemo(() => {
    if (!itemToEdit) return {}
    return {
      costBeforeTax: itemToEdit.costPriceBeforeTax,
      discountPercentage: itemToEdit.discountPercentage,
      taxRatePercentage: itemToEdit.taxRatePercentage,
      orderedQuantity: itemToEdit.orderedQuantity,
      quantity: itemToEdit.quantity,
      product: itemToEdit.product._id,
      newRetailPrice: itemToEdit.newRetailPrice,
      newSalePrice: itemToEdit.newSalePrice,
    }
  }, [itemToEdit])

  const defaultValues = useMemo(() => {
    return {
      invoiceNumber: supplierById?.invoiceNumber || "",
      supplierName: supplierById
        ? supplierById.supplierName
        : supplierInvoiceId
          ? "RANDOM STRING: because in case the user is adding another item into the supplier invoice the shop name isn't allowed to be edited"
          : "",
      shippingAndFees: supplierById?.shippingAndFees || 0,
      amountPaid: supplierById?.amountPaid || 0,
      items: supplierById ? [editProBught] : [],
      fulfillmentStatus: supplierById?.fulfillmentStatus || "pending",
      paymentStatus: supplierById?.paymentStatus || "unpaid",
      notes: supplierById?.notes || "",
    }
  }, [supplierById, editProBught, supplierInvoiceId])

  const form = useForm<CreateSupplierInvoiceInput>({
    mode: "onChange",
    resolver: zodResolver(CreateSupplierInvoiceSchema),
    defaultValues,
  })

  const isEqual = useObjectCompare(form.getValues(), defaultValues)

  const disabled = !form.formState.isValid || !form.formState.isDirty

  const shippingAndFees = form.watch("shippingAndFees")
  const itemsArr = useWatch({
    control: form.control,
    name: "items",
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const totalFormQuantity = itemsArr.reduce(
    (sum, item) => sum + (Number(item?.quantity) || 0),
    0
  )
  const shippingAndFeesPerUnit =
    totalFormQuantity > 0 ? shippingAndFees / totalFormQuantity : 0

  const handleAddItem = useCallback(() => {
    {
      setProducts((prev) => {
        return [...prev, null]
      }) // initalize the prodcut value for the added item in the products array.
      append({
        product: "",
        costPriceBeforeTax: 0,
        quantity: 0,
        orderedQuantity: 0,
        discountPercentage: 0,
        taxRatePercentage: TAX_PER,
        newRetailPrice: 0,
        newSalePrice: 0,
        isReturned: false,
      })
    }
  }, [append])
  const handleRemoveItem = useCallback(
    (index: number) => {
      setProducts((prev) => {
        const next = [...prev]
        next.splice(index, 1)
        return next
      })
      remove(index)
    },
    [remove]
  )

  const handleClose = useCallback(() => {
    setIsOpen(false)
    searchParam.delete("supplierInvoiceId")
    searchParam.delete("edit")
    setSearchParam(searchParam)
    setProducts([])
    navigate(`${pathname}?${searchParam.toString()}`, {
      replace: true,
    })
    if (isLoading) return
    form.reset(defaultValues)
  }, [searchParam, pathname])

  const isLoading = form.formState.isSubmitting

  useEffect(() => {
    if (open) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [open])

  // useEffect(() => {
  //   const body = document.querySelector("body")
  //   form.reset(defaultValues)
  //   if (body) {
  //     body.style.pointerEvents = "auto"
  //   }
  //   return () => {
  //     if (body) body.style.pointerEvents = "auto"
  //   }
  // }, [isOpen])

  async function onSubmit(data: CreateSupplierInvoiceInput) {
    try {
      await createSupplierInvoice(data)
    } catch (err) {}
  }
  return (
    <DialogComponent open={isOpen} onOpenChange={handleClose}>
      <Button onClick={() => setIsOpen(true)} size="sm" className="w-full">
        Create supplier invoice
      </Button>

      <DialogComponent.Content className="max-h-[70vh] max-w-[1000px] overflow-y-auto sm:max-h-[76vh] sm:p-14">
        <DialogComponent.Header>
          <DialogComponent.Title>
            {supplierInvoiceId
              ? "Add more inventory"
              : supplierItemId
                ? "Edit inventory"
                : "Add inventory"}
          </DialogComponent.Title>
          <DialogComponent.Description>
            {supplierInvoiceId
              ? `You are adding a new item to the supplier invoice #${supplierInvoiceId}`
              : supplierById
                ? `You are updating the details of an item belonging to the supplier invoice #${supplierById._id}. `
                : "Create a new supplier invoice."}
          </DialogComponent.Description>
        </DialogComponent.Header>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-12">
            <div className="space-y-7">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Controller
                  name="invoiceNumber"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="invoice-number">
                        Invoice number
                      </FieldLabel>
                      <Input
                        {...field}
                        id="invoice-number"
                        aria-invalid={fieldState.invalid}
                        placeholder="Invoice number..."
                      />
                      <FieldDescription>
                        Enter the supplier invoice number.
                      </FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="supplierName"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="supplier-name">
                        Supplier name
                      </FieldLabel>
                      <Input
                        {...field}
                        id="supplier-name"
                        aria-invalid={fieldState.invalid}
                        placeholder="Supplier name..."
                      />
                      <FieldDescription>
                        Enter the supplier name where you bought the item from.
                      </FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Controller
                  name="shippingAndFees"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="shipping-and-fees">
                        Shipping and extra fees
                      </FieldLabel>
                      <CurrencyInput
                        id="shipping-and-fees"
                        name="shippingAndFees"
                        placeholder="Amount Paid..."
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
                        Enter the shipping and extra costs for the invoice.
                      </FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="amountPaid"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="amount-paid">Amount paid</FieldLabel>
                      <CurrencyInput
                        id="amount-paid"
                        name="amountPaid"
                        placeholder="Amount Paid..."
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
                        Enter the supplier name where you bought the item from.
                      </FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
              <Controller
                name="fulfillmentStatus"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="fulfillment-status">
                      Fulfillment status
                    </FieldLabel>
                    <SupplierStatusSelector
                      value={field.value}
                      setValue={field.onChange}
                    />
                    <FieldDescription>
                      Enter the supplier invoice number.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border px-4 py-2">
              <span className="text-sm text-muted-foreground">
                Add new supplier items
              </span>
              <Button
                size="sm"
                type="button"
                className="text-xs"
                onClick={handleAddItem}
              >
                ADD
              </Button>
            </div>
            <ul className="space-y-16">
              {fields.map((field, i) => {
                const selectedProdcut = products[i]
                const currItem = itemsArr[i]
                const isFirstRestock = !selectedProdcut?.weightedAverageCost // This is important because if the item doesn't have the lastCost property that means that there are no losses to be calculated or adjusted here, so we can prevent the loss warrning from poping up to the user.

                // Old values
                const previousCost = selectedProdcut?.weightedAverageCost || 0
                const preivousStock = selectedProdcut?.stock || 0
                const oldPrice = selectedProdcut?.listPrice || 0
                // New values

                const newPrice = currItem?.newRetailPrice || 0
                const newCostPrice = currItem?.costPriceBeforeTax || 0
                const newQuantity = currItem?.quantity || 0

                const discountPercentage =
                  (currItem?.discountPercentage || 0) / 100
                const taxRatePercentage =
                  (currItem?.taxRatePercentage || 0) / 100

                const discountAmount = newCostPrice * discountPercentage
                const taxAmount = newCostPrice * taxRatePercentage

                // Base retail target should always prioritize a new retail override, fallback to historical listPrice
                const finalPrice = newPrice || oldPrice

                // 1. Core Landed Cost for this exact incoming batch
                const newCostAfterTaxAndDis =
                  newCostPrice +
                  taxAmount -
                  discountAmount +
                  shippingAndFeesPerUnit

                // 2. Predict the new Blended WAC asset value if saved
                const totalStockAfterRestock = preivousStock + newQuantity
                const weightedAverageCost =
                  totalStockAfterRestock > 0
                    ? (previousCost * preivousStock +
                        newCostAfterTaxAndDis * newQuantity) /
                      totalStockAfterRestock
                    : newCostAfterTaxAndDis

                const previousProfitMargin = oldPrice - previousCost

                const instantBatchProfitMargin =
                  finalPrice - newCostAfterTaxAndDis // Compare final price to THIS batch's cost

                const changeInProfitMargin =
                  instantBatchProfitMargin - previousProfitMargin

                const diffInPrice = finalPrice - newCostAfterTaxAndDis // this is wrong i think, it should be - the new lost price

                console.log(changeInProfitMargin, "MARGIN DIFF")
                console.log("New cost after", newCostAfterTaxAndDis)
                console.log("WAC", weightedAverageCost)
                console.log("Discount percentage", discountPercentage)
                console.log("Tax rate", taxRatePercentage)
                console.log("Tax amount", taxAmount)
                console.log("Discount amount", discountAmount)
                console.log("Previous last cost", previousCost)
                console.log("Previous profit margin:", previousProfitMargin)
                console.log("New profit margin", instantBatchProfitMargin)
                console.log("Changes in profit margin:", changeInProfitMargin)

                console.log("Difference in price", diffInPrice)
                return (
                  <motion.li
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
                  >
                    <div className="relative space-y-7">
                      <CloseButton
                        onClick={() => handleRemoveItem(i)}
                        className="-top-1 right-2"
                      />

                      <div className="text-lg font-semibold">{i + 1}.</div>
                      <Controller
                        name={`items.${i}.product`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="form-rhf-textarea-about">
                              Select Product
                            </FieldLabel>
                            <ProductsComboBox
                              value={products[i]}
                              // productArr={products}
                              // setProductArr={setProducts}
                              productToSell={[]}
                              setValue={(product) => {
                                field.onChange(product?._id || "")

                                setProducts((prev) => {
                                  const newArr = [...prev]
                                  newArr[i] = product || null
                                  return newArr
                                })
                                if (product) {
                                  const averageCost =
                                    product.weightedAverageCost
                                  const discountPercentage = Math.ceil(
                                    ((product.listPrice - product.salePrice) /
                                      product.listPrice) *
                                      100
                                  )

                                  form.setValue(
                                    `items.${i}.costPriceBeforeTax`,
                                    averageCost
                                  )
                                  form.setValue(
                                    `items.${i}.newRetailPrice`,
                                    product.listPrice
                                  )
                                  form.setValue(
                                    `items.${i}.newSalePrice`,
                                    product.salePrice || 0
                                  )
                                  // form.setValue(
                                  //   `items.${i}.discountPercentage`,
                                  //   Math.ceil(discountPercentage)
                                  // )
                                } else {
                                  form.setValue(
                                    `items.${i}.costPriceBeforeTax`,
                                    0
                                  )
                                  form.setValue(
                                    `items.${i}.discountPercentage`,
                                    0
                                  )
                                  form.setValue(`items.${i}.newRetailPrice`, 0)
                                  form.setValue(`items.${i}.newSalePrice`, 0)
                                }

                                form.trigger(`items.${i}.costPriceBeforeTax`)
                              }}
                            />
                            <FieldDescription>
                              Select the product you are currently restocking.{" "}
                              <span className="text-yellow-600">
                                If you can't find it in the list go the{" "}
                                <Link
                                  to="/products#"
                                  className="text-muted-foreground underline"
                                >
                                  Products page
                                </Link>{" "}
                                and create the new product and then come back to
                                restock it here.
                              </span>
                            </FieldDescription>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Controller
                          name={`items.${i}.costPriceBeforeTax`}
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor="cost-price-before-tax">
                                Cost before tax
                              </FieldLabel>
                              <CurrencyInput
                                autoFocus
                                id="cost-price-before-tax"
                                name="costPriceBeforeTax"
                                placeholder="Cost price before price"
                                decimalsLimit={2} // Max number of decimal places
                                prefix="EGP " // Currency symbol (e.g., Egyptian Pound)
                                decimalSeparator="." // Use dot for decimal
                                groupSeparator="," // Use comma for thousands
                                value={field.value || ""}
                                onValueChange={(
                                  formattedValue,
                                  name,
                                  value
                                ) => {
                                  // setFormattedListing(formattedValue || "");

                                  field.onChange(Number(value?.value) || 0)
                                }}
                                className="input-field"
                              />
                              <FieldDescription>
                                Enter the cost price of the price before tax.
                              </FieldDescription>
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />

                        <Controller
                          name={`items.${i}.discountPercentage`}
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor="discount-precentage">
                                Discount precentage
                              </FieldLabel>
                              <CurrencyInput
                                id="discount-precentage"
                                name="discountPercentage"
                                placeholder="Discount precentage"
                                decimalsLimit={2} // Max number of decimal places
                                prefix="% " // Currency symbol (e.g., Egyptian Pound)
                                decimalSeparator="." // Use dot for decimal
                                groupSeparator="," // Use comma for thousands
                                value={field.value || ""}
                                onValueChange={(
                                  formattedValue,
                                  name,
                                  value
                                ) => {
                                  // setFormattedListing(formattedValue || "");

                                  field.onChange(Number(value?.value) || 0)
                                }}
                                className="input-field"
                              />
                              <FieldDescription>
                                Enter the discount precentage you received on
                                the bought item.
                              </FieldDescription>
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />
                        <Controller
                          name={`items.${i}.taxRatePercentage`}
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor="tax-rate">
                                Tax rate
                              </FieldLabel>
                              <CurrencyInput
                                id="tax-rate"
                                name="taxRatePercentage"
                                placeholder="Tax rate"
                                decimalsLimit={2} // Max number of decimal places
                                prefix="% " // Currency symbol (e.g., Egyptian Pound)
                                decimalSeparator="." // Use dot for decimal
                                groupSeparator="," // Use comma for thousands
                                value={field.value || ""}
                                onValueChange={(
                                  formattedValue,
                                  name,
                                  value
                                ) => {
                                  // setFormattedListing(formattedValue || "");

                                  field.onChange(Number(value?.value) || 0)
                                }}
                                className="input-field"
                              />
                              <FieldDescription>
                                Enter the tax rate you received on the bought
                                item.
                              </FieldDescription>
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Controller
                          name={`items.${i}.orderedQuantity`}
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor="ordered-quantity">
                                Ordered quantity
                              </FieldLabel>
                              <CurrencyInput
                                id="ordered-quantity"
                                name="orderedQuantity"
                                placeholder="Ordered quantity"
                                decimalsLimit={2} // Max number of decimal places
                                prefix={
                                  selectedProdcut
                                    ? selectedProdcut.unitOfMeasurement?.toUpperCase() +
                                      "S "
                                    : "UNITS "
                                }
                                decimalSeparator="."
                                groupSeparator=","
                                value={field.value || ""}
                                onValueChange={(
                                  formattedValue,
                                  name,
                                  value
                                ) => {
                                  // setFormattedListing(formattedValue || "");

                                  field.onChange(Number(value?.value) || 0)
                                }}
                                className="input-field"
                              />
                              <FieldDescription>
                                Enter the amount of {products[i]?.name || null}{" "}
                                unit ordered.
                              </FieldDescription>
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />
                        <Controller
                          name={`items.${i}.quantity`}
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor="quantity">
                                Quantity
                              </FieldLabel>
                              <CurrencyInput
                                id="quantity"
                                name="quantity"
                                placeholder="Quantity received"
                                decimalsLimit={2} // Max number of decimal places
                                prefix={
                                  selectedProdcut
                                    ? selectedProdcut?.unitOfMeasurement.toUpperCase() +
                                      "S "
                                    : "UNITS "
                                }
                                decimalSeparator="."
                                groupSeparator=","
                                value={field.value || ""}
                                onValueChange={(
                                  formattedValue,
                                  name,
                                  value
                                ) => {
                                  // setFormattedListing(formattedValue || "");

                                  field.onChange(Number(value?.value) || 0)
                                }}
                                className="input-field"
                              />
                              <FieldDescription>
                                Enter the amount of {products[i]?.name || null}{" "}
                                unit reveived.
                              </FieldDescription>
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                              <AnimatePresence>
                                {itemsArr[i]?.orderedQuantity < field.value && (
                                  <FormErrorMessage className="text-yellow-600">
                                    Amount received shouldn't be greater than
                                    the grand total. But you can proceed
                                    anyways.
                                  </FormErrorMessage>
                                )}
                              </AnimatePresence>
                            </Field>
                          )}
                        />
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Controller
                          name={`items.${i}.newRetailPrice`}
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor="new-retail-price">
                                New retail price
                              </FieldLabel>
                              <CurrencyInput
                                id="new-retail-price"
                                name="newRetailPrice"
                                placeholder="New retail price"
                                decimalsLimit={2} // Max number of decimal places
                                prefix="UNITS " // Currency symbol (e.g., Egyptian Pound)
                                decimalSeparator="." // Use dot for decimal
                                groupSeparator="," // Use comma for thousands
                                value={field.value || ""}
                                onValueChange={(
                                  formattedValue,
                                  name,
                                  value
                                ) => {
                                  // setFormattedListing(formattedValue || "");

                                  field.onChange(Number(value?.value) || 0)
                                }}
                                className="input-field"
                              />

                              <FieldDescription>
                                Enter the new list price for{" "}
                                {products[i]?.name || "selected product"} after
                                restocking.
                              </FieldDescription>
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />
                        <Controller
                          name={`items.${i}.newSalePrice`}
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor="new-sale-price">
                                New sale price
                              </FieldLabel>
                              <CurrencyInput
                                id="new-sale-price"
                                name="newSalePrice"
                                placeholder="New sale price"
                                decimalsLimit={2} // Max number of decimal places
                                prefix="EGP " // Currency symbol (e.g., Egyptian Pound)
                                decimalSeparator="." // Use dot for decimal
                                groupSeparator="," // Use comma for thousands
                                value={field.value || ""}
                                onValueChange={(
                                  formattedValue,
                                  name,
                                  value
                                ) => {
                                  // setFormattedListing(formattedValue || "");

                                  field.onChange(Number(value?.value) || 0)
                                }}
                                className="input-field"
                              />
                              <FieldDescription>
                                Enter the new sale price for{" "}
                                {products[i]?.name || "selected product"} after
                                restocking.
                              </FieldDescription>
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />
                      </div>
                      {/* <div>
                      Total amount spent:
                      <span className="ml-3">
                        {formatCurrency(
                          (productBoughtArr[i]?.pricePerUnit -
                            productBoughtArr[i]?.discount) *
                            productBoughtArr[i]?.count
                        )}
                      </span>
                    </div> */}
                      {supplierById && (
                        <Controller
                          name={`items.${i}.isReturned`}
                          control={form.control}
                          render={({ field }) => (
                            <FieldLabel
                              htmlFor="switch-notifications"
                              className="mt-8"
                            >
                              <Field orientation="horizontal">
                                <FieldContent>
                                  <FieldTitle>Is Returned?</FieldTitle>
                                  <FieldDescription>
                                    Mark this bought item as returned.
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

                      <AnimatePresence mode="wait">
                        {selectedProdcut && newQuantity > 0 && (
                          <motion.div
                            key={`${selectedProdcut._id}-${changeInProfitMargin}`}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className={cn(
                              "mt-4 space-y-4 rounded-xl border bg-muted/30 p-4",
                              {
                                "border-destructive/40 bg-destructive/5":
                                  diffInPrice <= 0,
                                "border-yellow-500/40 bg-yellow-500/5":
                                  diffInPrice > 0 && changeInProfitMargin < 0,
                                "border-emerald-500/40 bg-emerald-500/5":
                                  changeInProfitMargin > 0,
                              }
                            )}
                          >
                            {/* Top Section: Quick Metrics Grid */}
                            <div className="grid grid-cols-2 gap-4 text-xs md:grid-cols-4">
                              <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">
                                  Landed Cost (This Batch)
                                </span>
                                <span className="font-mono text-sm font-semibold">
                                  {newCostAfterTaxAndDis.toFixed(2)}
                                </span>
                              </div>

                              <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">
                                  Predicted New WAC
                                </span>
                                <span className="font-mono text-sm font-semibold">
                                  {weightedAverageCost.toFixed(2)}
                                </span>
                              </div>

                              <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">
                                  Previous Margin
                                </span>
                                <span className="font-mono text-sm font-semibold">
                                  {previousProfitMargin.toFixed(2)}
                                </span>
                              </div>

                              <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">
                                  Instant Batch Margin
                                </span>
                                <span
                                  className={cn(
                                    "font-mono text-sm font-semibold",
                                    {
                                      "text-destructive":
                                        instantBatchProfitMargin <= 0,
                                      "text-yellow-600":
                                        instantBatchProfitMargin > 0 &&
                                        changeInProfitMargin < 0,
                                      "text-emerald-600":
                                        changeInProfitMargin >= 0,
                                    }
                                  )}
                                >
                                  {instantBatchProfitMargin.toFixed(2)}
                                </span>
                              </div>
                            </div>

                            <hr className="border-border/60" />

                            {/* Bottom Section: Dynamic Smart Alerts */}
                            <div className="flex items-start gap-2.5 text-sm">
                              {diffInPrice <= 0 ? (
                                <>
                                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                                  <div className="space-y-1">
                                    <p className="font-semibold text-destructive">
                                      Operating at a Loss!
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      This batch costs more than your retail
                                      price by{" "}
                                      <span className="font-mono font-semibold text-destructive">
                                        {Math.abs(diffInPrice).toFixed(2)}
                                      </span>{" "}
                                      per unit. Adjust your retail/sale values
                                      below to protect your margins.
                                    </p>
                                  </div>
                                </>
                              ) : changeInProfitMargin < 0 ? (
                                <>
                                  <TrendingDown className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
                                  <div className="space-y-1">
                                    <p className="font-semibold text-yellow-700">
                                      Margin Squeeze Notice
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Your profit margin on this incoming
                                      shipment dropped by{" "}
                                      <span className="font-mono font-semibold text-yellow-700">
                                        {Math.abs(changeInProfitMargin).toFixed(
                                          2
                                        )}
                                      </span>{" "}
                                      due to supplier cost changes. Consider
                                      adjusting pricing.
                                    </p>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                                  <div className="space-y-1">
                                    <p className="font-semibold text-emerald-700">
                                      Healthy Margins
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      This batch maintains or improves your
                                      previous profit trends by{" "}
                                      <span className="font-mono font-semibold text-emerald-700">
                                        +{changeInProfitMargin.toFixed(2)}
                                      </span>
                                      !
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.li>
                )
              })}
            </ul>
          </div>

          {/* {form.getValues().productBought.length ? (
                <>
                  <Accordion
                    type="single"
                    collapsible
                    className="mx-auto max-w-[450px]"
                    defaultValue="item-4"
                  >
                    <AccordionItem value="item-4">
                      <AccordionTrigger className="font-semibold text-muted-foreground">
                        Summary
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="mx-auto max-w-[500px]">
                          <div className="space-y-2 border-t py-2 text-xs text-muted-foreground">
                            <div className="flex flex-col justify-between gap-5 xs:flex-row xs:items-center">
                              <div className="space-y-2">
                                <div>
                                  Total Entries:{" "}
                                  <span className="relative text-orange-400 after:absolute after:-top-1 after:-right-8 after:content-['entry'] dark:after:text-dashboard-orange">
                                    {productBoughtArr.length}
                                  </span>
                                </div>
                                <div>
                                  Total Units:{" "}
                                  <span className="relative after:absolute after:-top-1 after:-right-8 after:text-indigo-800 after:content-['units'] dark:after:text-dashboard-indigo">
                                    {total.totalCount}
                                  </span>
                                </div>

                                <div>
                                  Total Price:{" "}
                                  {formatCurrency(total.totalPrice)}
                                </div>
                                <div>
                                  Total Discount:{" "}
                                  {formatCurrency(total.totalDiscount)}
                                </div>
                                <div className="w-fit border-y py-2 text-xs">
                                  Total Price After Discount:{" "}
                                  <span className="text-indigo-800 dark:text-dashboard-indigo">
                                    {" "}
                                    {formatCurrency(
                                      total.totalPrice - total.totalDiscount
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <Button
                    size="sm"
                    type="button"
                    className="w-full text-xs"
                    onClick={() =>
                      append({
                        pricePerUnit: 0,
                        discount: 0,
                        count: 0,
                        note: "",
                        productId: 0,
                        productsRestockingBillId: "",
                      })
                    }
                  >
                    ADD
                  </Button>
                </>
              ) : null} */}

          <div className="relative flex flex-col-reverse items-center justify-end gap-3 sm:flex-row">
            <Button
              onClick={() => form.reset()}
              type="button"
              className="absolute bottom-0 left-5 hidden h-6 w-6 p-0 sm:flex"
              variant="outline"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
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
              disabled={isLoading || disabled}
              className="w-full sm:w-[unset]"
            >
              {isLoading ? (
                <Spinner className="h-full" />
              ) : supplierInvoiceId ? (
                "Add"
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </form>
      </DialogComponent.Content>
    </DialogComponent>
  )
}

export default SupplierInvoiceForm
// <React.Fragment key={field.id}>
//   <h2>{i + 1}.</h2>
//   <motion.div
//     initial={{
//       opacity: 0.2,
//       y: -20,
//     }}
//     animate={{
//       opacity: 1,
//       y: 0,
//       transition: { duration: 0.6, type: "spring" },
//     }}
//     exit={{
//       opacity: 0.2,
//       y: -150,
//       transition: { duration: 0.1, type: "spring" },
//     }}
//     key={field.id}
//     className=" space-y-4  border p-3 rounded-xl relative "
//   >
//     <button
//       onClick={() => {
//         remove(i);
//       }}
//       className="  absolute  top-3 right-4 rounded-sm outline-none opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground  "
//       type="button"
//     >
//       <Cross2Icon className="h-4 w-4" />
//       {/* <span className="sr-only">Close</span> */}
//     </button>

//     <div className=" flex  flex-col gap-2 sm:flex-row">
//       <FormField
//         disabled={isLoading}
//         control={form.control}
//         name={`productBought.${i}.productId`}
//         render={({ field }) => (
//           <FormItem className=" flex-1">
//             <FormLabel>Product</FormLabel>
//             <FormControl>
//               <ProductsComboBox
//                 value={field.value}
//                 setValue={(value) => {
//                   const proBoughtById = products.find(
//                     (pro) => pro.id === value
//                   );
//                   field.onChange(value);
//                   if (proBoughtById)
//                     form.setValue(
//                       `productBought.${i}.pricePerUnit`,
//                       proBoughtById.salePrice
//                     );
//                 }}
//                 options={products}
//               />
//             </FormControl>
//             <FormDescription>
//               Enter what product you bought.
//             </FormDescription>
//             <FormMessage />
//           </FormItem>
//         )}
//       />
//       <FormField
//         disabled={isLoading}
//         control={form.control}
//         name="shopName"
//         render={({ field }) => (
//           <FormItem className=" flex-1">
//             <FormLabel>Shop</FormLabel>
//             <FormControl>
//               {reStockingBillId ? (
//                 <RestockingComboBox
//                   value={Number(reStockingBillId)}
//                   setValue={field.onChange}
//                   options={restockings}
//                   disabled={true}
//                 />
//               ) : (
//                 <Input
//                   type="text"
//                   placeholder="Shop name..."
//                   {...field}
//                 />
//               )}
//               {/* <RestockingComboBox
//               value={24}
//               setValue={field.onChange}
//               options={restockings}
//               disabled={true}
//             /> */}
//             </FormControl>
//             <FormDescription>
//               Enter shop name.
//             </FormDescription>
//             <FormMessage />
//           </FormItem>
//         )}
//       />
//     </div>
//     <div className=" flex  flex-col gap-2  sm:flex-row  ">
//       <FormField
//         disabled={isLoading}
//         control={form.control}
//         name={`productBought.${i}.pricePerUnit`}
//         render={({ field }) => (
//           <FormItem className="  w-full mb-auto ">
//             <FormLabel>Price per unit</FormLabel>
//             <FormControl>
//               <Input
//                 type="text"
//                 disabled={isLoading}
//                 value={field.value}
//                 onChange={(e) => {
//                   const inputValue = e.target.value;
//                   if (/^\d*$/.test(inputValue)) {
//                     field.onChange(Number(inputValue));
//                   }
//                 }}
//                 placeholder="Additional notes..."
//                 // {...field}
//               />
//             </FormControl>
//             <FormDescription>
//               Enter the cost of each unit.
//             </FormDescription>
//             <FormMessage />
//           </FormItem>
//         )}
//       />
//       <FormField
//         disabled={isLoading}
//         control={form.control}
//         name={`productBought.${i}.discount`}
//         render={({ field }) => (
//           <FormItem className="  w-full mb-auto">
//             <FormLabel>Discount</FormLabel>
//             <FormControl>
//               <Input
//                 type="text"
//                 disabled={isLoading}
//                 value={field.value}
//                 onChange={(e) => {
//                   const inputValue = e.target.value;
//                   if (/^\d*$/.test(inputValue)) {
//                     field.onChange(Number(inputValue));
//                   }
//                 }}
//                 placeholder="Additional notes..."
//                 // {...field}
//               />
//             </FormControl>
//             <FormDescription>
//               Enter the total discount you got.
//             </FormDescription>
//             <FormMessage />
//           </FormItem>
//         )}
//       />
//       <FormField
//         disabled={isLoading}
//         control={form.control}
//         name={`productBought.${i}.count`}
//         render={({ field }) => (
//           <FormItem className=" w-full  mb-auto">
//             <FormLabel>Count</FormLabel>
//             <FormControl>
//               <Input
//                 type="text"
//                 disabled={isLoading}
//                 value={field.value}
//                 onChange={(e) => {
//                   const inputValue = e.target.value;
//                   if (/^\d*$/.test(inputValue)) {
//                     field.onChange(Number(inputValue));
//                   }
//                 }}
//                 placeholder="Additional notes..."
//                 // {...field}
//               />
//             </FormControl>
//             <FormDescription>
//               Enter the amount you bought.
//             </FormDescription>
//             <FormMessage />
//           </FormItem>
//         )}
//       />
//     </div>

//     <FormField
//       disabled={isLoading}
//       control={form.control}
//       name={`productBought.${i}.note`}
//       render={({ field }) => (
//         <FormItem className=" flex-1">
//           <FormLabel>Notes</FormLabel>
//           <FormControl>
//             <Textarea placeholder="note..." {...field} />
//           </FormControl>
//           <FormDescription>
//             Enter additional detials.
//           </FormDescription>
//           <FormMessage />
//         </FormItem>
//       )}
//     />

//     <div>
//       Total amount spent:
//       <span className=" ml-3">
//         {formatCurrency(
//           (productBoughtArr[i]?.pricePerUnit -
//             productBoughtArr[i]?.discount) *
//             productBoughtArr[i]?.count
//         )}
//       </span>
//     </div>
//   </motion.div>
// </React.Fragment>
