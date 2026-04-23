import { Controller, type Control, type UseFormReturn } from "react-hook-form"
import { z } from "zod"
import { motion } from "framer-motion"
import { ProFormSlideVariants, ProFormTransition } from "@/lib/constants"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ComboBox } from "@/components/combo-box"
import { Textarea } from "@/components/ui/textarea"
import { MultiFileUploader } from "./multi-file-uploader"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown, Trash2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import CarBrandsCombobox from "@/components/car-brands-combobox"

import { useEffect, useMemo, useState } from "react"
import { ModelCombobox } from "@/components/model-combobox"
import GenerationsTagInput from "@/components/generations-tag-input"
import InputMask from "react-input-mask"
import CurrencyInput, {
  type CurrencyInputOnChangeValues,
} from "react-currency-input-field"
import type { FileWithPreview, ProductsSchema } from "@/lib/types"
import type {
  Category,
  ProductBrand,
  ProductImage,
  ProductWithDetails,
} from "@/types"
import type { CarMaker } from "@/types/carMaker"

type Form = UseFormReturn<z.infer<typeof ProductsSchema>, any>

type HandleNumber = (
  formattedValue: string | undefined,
  name?: string,
  values?: CurrencyInputOnChangeValues,
  onChange?: React.Dispatch<React.SetStateAction<number>>
) => void

interface StepOneProps {
  form: Form
  control: Control<z.infer<typeof ProductsSchema>>
  isLoading: boolean
  categories: Category[]
  productBrand: ProductBrand[]
  isMainImage: number | ProductImage | null
  mediaUrls: ProductImage[]
  productToEdit?: ProductWithDetails
  currStep: number[]
  carMaker: CarMaker | undefined
  handleDeleteMedia(productImage?: ProductImage): void
  setIsMainImage: React.Dispatch<
    React.SetStateAction<number | ProductImage | null>
  >
  setDeletedMedia: React.Dispatch<React.SetStateAction<ProductImage[]>>
  carMakers: CarMaker[]
}

function StepOne({
  form,
  currStep,
  control,
  isLoading,
  categories,
  productBrand,
  isMainImage,
  setIsMainImage,
  handleDeleteMedia,
  mediaUrls,
  setDeletedMedia,
  productToEdit,
  carMaker: unUsedField,
  carMakers,
}: StepOneProps) {
  const [step, direction] = currStep
  // const { carBrands, isLoading: searching, error } = useCarBrands(searchTerm);
  const { carMaker, carModel, generations, category } = form.watch()
  const carModels =
    carMaker && carMakers?.find((car) => car._id === carMaker)?.carModels
  const carGenerations =
    carModel &&
    carModels &&
    carModels.find((model) => model._id === carModel)?.carGenerations

  const productTypes = useMemo(() => {
    return categories.find((cat) => cat._id === category)?.productTypes || []
  }, [category])

  return (
    <motion.div
      custom={direction}
      variants={ProFormSlideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={ProFormTransition}
      className="space-y-7"
    >
      <div className="flex flex-col gap-x-2 gap-y-3 sm:flex-row">
        <Controller
          disabled={isLoading}
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                disabled={isLoading}
                aria-invalid={fieldState.invalid}
                placeholder="Name of the product"
                autoComplete="off"
              />
              <FieldDescription>
                Enter the name of the product.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {/* <FormField
          disabled={isLoading}
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input disabled={isLoading} placeholder="name" {...field} />
              </FormControl>
              <FormDescription>Enter the name of the product.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        /> */}
        <Controller
          disabled={isLoading || !categories.length}
          control={form.control}
          name="category"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Category</FieldLabel>
              <ComboBox
                placeholder="Select category..."
                disabled={isLoading || !categories.length}
                options={categories}
                value={field.value}
                setValue={(value) => {
                  field.onChange(value)
                  form.setValue("productType", "")
                }}
              />
              <FieldDescription>
                Enter what category does the product belong to.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {/* <FormField
          disabled={isLoading || !categories.length}
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Category</FormLabel>
              <FormControl className=" ">
                <ComboBox
                  placeholder="Select category..."
                  disabled={isLoading || !categories.length}
                  options={categories}
                  value={field.value}
                  setValue={(value) => {
                    field.onChange(value)
                    form.setValue("productTypeId", 0)
                  }}
                />
              </FormControl>
              <FormDescription>
                Enter what category does the product belong to.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        /> */}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Controller
          disabled={isLoading || !productTypes.length}
          control={form.control}
          name="productType"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="w-full">
              <FieldLabel htmlFor={field.name}>Product type</FieldLabel>
              <ComboBox
                placeholder="Select type..."
                disabled={isLoading || !productTypes.length}
                options={productTypes}
                value={field.value}
                setValue={field.onChange}
              />
              <FieldDescription>
                Enter what type of product it is.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          disabled={isLoading || !productBrand.length}
          control={form.control}
          name="productBrand"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="w-full">
              <FieldLabel htmlFor={field.name}>Product brand</FieldLabel>
              <ComboBox
                placeholder="Select Brand..."
                disabled={isLoading || !productBrand.length}
                options={productBrand}
                value={field.value}
                setValue={field.onChange}
              />
              <FieldDescription>
                Enter the brand of the product.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/*
        <FormField
          disabled={isLoading || !productTypes.length}
          control={form.control}
          name="productTypeId"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Product type</FormLabel>
              <FormControl>
                <ComboBox
                  placeholder="Select type..."
                  disabled={isLoading || !productTypes.length}
                  options={productTypes}
                  value={field.value}
                  setValue={field.onChange}
                />
              </FormControl>
              <FormDescription>
                Enter what type of product it is.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          disabled={isLoading || !productBrand.length}
          control={form.control}
          name="productBrandId"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Product brand</FormLabel>
              <FormControl>
                <ComboBox
                  placeholder="Select Brand..."
                  disabled={isLoading || !productBrand.length}
                  options={productBrand}
                  value={field.value}
                  setValue={field.onChange}
                />
              </FormControl>
              <FormDescription>Enter the brand of the product.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        */}
      </div>
      <div className="flex flex-row flex-wrap gap-x-2 gap-y-3">
        <Controller
          disabled={isLoading}
          control={form.control}
          name="listPrice"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="w-full flex-1">
              <FieldLabel htmlFor="listPrice">List price</FieldLabel>
              <CurrencyInput
                id="listPrice"
                name="price"
                placeholder="Original Price"
                decimalsLimit={2}
                prefix="EGP "
                decimalSeparator="."
                groupSeparator=","
                value={field.value || ""}
                onValueChange={(formattedValue, name, value) => {
                  field.onChange(Number(value?.value) || 0)
                }}
                className="input-field"
              />
              <FieldDescription>Enter the listing price.</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* <FormField
          disabled={isLoading}
          control={form.control}
          name="listPrice"
          render={({ field }) => (
            <FormItem className="w-full flex-1">
              <FormLabel htmlFor="listPrice">List price</FormLabel>
              <FormControl>
                <CurrencyField onChange={field.onChange} />

                <CurrencyInput
                  id="listPrice"
                  name="price"
                  placeholder="Original Price"
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
              </FormControl>
              <FormDescription>Enter the listing price.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        */}

        <Controller
          disabled={isLoading}
          control={form.control}
          name="salePrice"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="w-full flex-1">
              <FieldLabel htmlFor="salesInput">Sale price</FieldLabel>
              <CurrencyInput
                id="salesInput"
                name="price"
                placeholder="Discounted Price"
                decimalsLimit={2}
                prefix="EGP "
                decimalSeparator="."
                groupSeparator=","
                value={field.value || ""}
                onValueChange={(formattedValue, name, value) => {
                  field.onChange(Number(value?.value) || 0)
                }}
                className="input-field"
              />
              <FieldDescription>Enter the discounted price.</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {/*
        <FormField
          disabled={isLoading}
          control={form.control}
          name="salePrice"
          render={({ field }) => (
            <FormItem className="w-full flex-1">
              <FormLabel htmlFor="salesInput">Sale price</FormLabel>
              <FormControl>
                <CurrencyInput
                  id="salesInput"
                  name="price"
                  placeholder="Discounted Price"
                  decimalsLimit={2} // Max number of decimal places
                  prefix="EGP " // Currency symbol (e.g., Egyptian Pound)
                  decimalSeparator="." // Use dot for decimal
                  groupSeparator="," // Use comma for thousands
                  value={field.value || ""}
                  onValueChange={(formattedValue, name, value) => {
                    field.onChange(Number(value?.value) || 0)
                  }}
                  className="input-field"
                />
              </FormControl>
              <FormDescription>Enter the discounted price.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        */}
        <Controller
          disabled={isLoading}
          control={form.control}
          name="stock"
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="w-full basis-full sm:flex-1"
            >
              <FieldLabel htmlFor="stockInput">Stock available</FieldLabel>
              <CurrencyInput
                id="stockInput"
                name="price"
                placeholder="Available Stock"
                decimalsLimit={2}
                prefix="UNITS "
                decimalSeparator="."
                groupSeparator=","
                value={field.value || ""}
                onValueChange={(formattedValue, name, value) => {
                  field.onChange(Number(value?.value) || 0)
                }}
                className="input-field"
              />
              <FieldDescription>
                Enter the amount of stock available.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {/*
        <FormField
          disabled={isLoading}
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem className="w-full basis-full sm:flex-1">
              <FormLabel htmlFor="stockInput">Stock available </FormLabel>
              <FormControl>
                <CurrencyInput
                  id="stockInput"
                  name="price"
                  placeholder="Available Stock"
                  decimalsLimit={2} // Max number of decimal places
                  prefix="UNITS " // Currency symbol (e.g., Egyptian Pound)
                  decimalSeparator="." // Use dot for decimal
                  groupSeparator="," // Use comma for thousands
                  value={field.value || ""}
                  onValueChange={(formattedValue, name, value) => {
                    field.onChange(Number(value?.value) || 0)
                  }}
                  className="input-field"
                />
              </FormControl>
              <FormDescription>
                Enter the amount of stock available.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        */}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Controller
          disabled={isLoading}
          control={form.control}
          name="carMaker"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="w-full">
              <FieldLabel>
                Car brand{" "}
                <span className="pl-1 text-xs text-muted-foreground">
                  Optional
                </span>
              </FieldLabel>
              <CarBrandsCombobox
                options={carMakers}
                value={field.value}
                setValue={(value) => {
                  field.onChange(value)
                  form.setValue("carModel", null)
                  form.setValue("generations", [])
                }}
              />
              <FieldDescription>
                Enter the amount of stock available.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {/*
        <FormField
          disabled={isLoading}
          control={form.control}
          name="makerId"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>
                Car brand{" "}
                <span className="pl-1 text-xs text-muted-foreground">
                  Optional
                </span>
              </FormLabel>
              <FormControl>
                <CarBrandsCombobox
                  options={carMakers}
                  value={field.value}
                  setValue={(value) => {
                    field.onChange(value)
                    form.setValue("modelId", null)
                    form.setValue("generationsArr", [])
                  }}
                />
              </FormControl>
              <FormDescription>
                Enter the amount of stock available.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        */}

        <Controller
          disabled={isLoading}
          control={form.control}
          name="carModel"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="w-full">
              <FieldLabel>
                Car model{" "}
                <span className="pl-1 text-xs text-muted-foreground">
                  Optional
                </span>
              </FieldLabel>
              <ModelCombobox
                disabled={!carModels || !carModels.length}
                options={carModels || []}
                value={field.value}
                setValue={(value) => {
                  form.setValue("generations", [])
                  field.onChange(value)
                }}
              />
              <FieldDescription>
                Enter the amount of stock available.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {/*
        <FormField
          disabled={isLoading}
          control={form.control}
          name="modelId"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>
                Car model{" "}
                <span className="pl-1 text-xs text-muted-foreground">
                  Optional
                </span>
              </FormLabel>
              <FormControl>
                <ModelCombobox
                  disabled={!carModels || !carModels.length}
                  options={carModels || []}
                  value={field.value}
                  setValue={(value) => {
                    form.setValue("generationsArr", [])
                    field.onChange(value)
                  }}
                />
              </FormControl>
              <FormDescription>
                Enter the amount of stock available.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        */}
      </div>
      <div>
        <Controller
          disabled={isLoading}
          control={form.control}
          name="generations"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="w-full">
              <FieldLabel>
                Car Generations{" "}
                <span className="pl-1 text-xs text-muted-foreground">
                  Optional
                </span>
              </FieldLabel>
              <GenerationsTagInput
                disabled={!carGenerations || !carGenerations.length}
                setIds={field.onChange}
                ids={field.value}
                generations={carGenerations || []}
              />
              <FieldDescription>
                Enter the amount of stock available.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {/*
        <FormField
          disabled={isLoading}
          control={form.control}
          name="generationsArr"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>
                Car Generations{" "}
                <span className="pl-1 text-xs text-muted-foreground">
                  Optional
                </span>
              </FormLabel>
              <FormControl>
                <GenerationsTagInput
                  disabled={!carGenerations || !carGenerations.length}
                  setIds={field.onChange}
                  ids={field.value}
                  generations={carGenerations || []}
                />
              </FormControl>
              <FormDescription>
                Enter the amount of stock available.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        */}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        {/* <FormField
          disabled={isLoading}
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem className=" w-full">
              <FormLabel>Stock available</FormLabel>
              <FormControl>
                <CurrencyInput
                  id="priceInput"
                  name="price"
                  placeholder="UNITS, 1,234.56"
                  decimalsLimit={2} // Max number of decimal places
                  prefix="UNITS " // Currency symbol (e.g., Egyptian Pound)
                  decimalSeparator="." // Use dot for decimal
                  groupSeparator="," // Use comma for thousands
                  value={formattedStockValue}
                  onValueChange={(formattedValue, name, value) => {
                    setFormattedStock(formattedValue || "");
                    field.onChange(Number(value?.value) || 0);
                  }}
                  className="input-field "
                />

     
              </FormControl>
              <FormDescription>
                Enter the amount of stock available.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        /> */}
      </div>

      <Controller
        disabled={isLoading}
        control={form.control}
        name="description"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Description</FieldLabel>
            <Textarea
              disabled={isLoading}
              cols={6}
              placeholder="Description"
              {...field}
            />
            <FieldDescription>Describe the product.</FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      {/*
      <FormField
        disabled={isLoading}
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                disabled={isLoading}
                cols={6}
                placeholder="Description"
                {...field}
              />
            </FormControl>
            <FormDescription>Describe the product.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      */}
      <Controller
        disabled={isLoading}
        control={form.control}
        name="images"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="w-full">
            <FieldLabel>Product images</FieldLabel>
            <MultiFileUploader
              isMainImage={isMainImage}
              setIsMainImage={setIsMainImage}
              disabled={isLoading}
              handleDeleteMedia={handleDeleteMedia}
              selectedFiles={field.value}
              fieldChange={field.onChange}
              mediaUrl={mediaUrls}
            />
            <FieldDescription className="flex items-center justify-between">
              <span> Add images related to the product.</span>{" "}
              <p className="flex items-center gap-2">
                <span className="text-xs">
                  Images: {field.value.length + mediaUrls?.length}
                </span>
                <Button
                  disabled={
                    (!field.value.length && !mediaUrls.length) || isLoading
                  }
                  onClick={() => {
                    field.onChange((value: any[]) => {
                      value.forEach((image) =>
                        URL.revokeObjectURL(image.preview)
                      )
                      return []
                    })
                    setIsMainImage(null)
                    if (productToEdit)
                      setDeletedMedia(productToEdit.productImages)
                  }}
                  type="button"
                  variant="destructive"
                  className="h-6 w-6 p-0"
                >
                  {" "}
                  <Trash2 className="h-4 w-4 shrink-0" />
                </Button>
              </p>
            </FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      {/*
      <FormField
        disabled={isLoading}
        control={form.control}
        name="images"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>Product images</FormLabel>
            <FormControl>
              <MultiFileUploader
                isMainImage={isMainImage}
                setIsMainImage={setIsMainImage}
                disabled={isLoading}
                handleDeleteMedia={handleDeleteMedia}
                selectedFiles={field.value}
                fieldChange={field.onChange}
                mediaUrl={mediaUrls}
              />
            </FormControl>
            <FormDescription className="flex items-center justify-between">
              <span> Add images related to the product.</span>{" "}
              <p className="flex items-center gap-2">
                <span className="text-xs">
                  Images: {field.value.length + mediaUrls?.length}
                </span>
                <Button
                  disabled={
                    (!field.value.length && !mediaUrls.length) || isLoading
                  }
                  onClick={() => {
                    field.onChange((value: any[]) => {
                      value.forEach((image) =>
                        URL.revokeObjectURL(image.preview)
                      )
                      return []
                    })
                    setIsMainImage(null)
                    if (productToEdit)
                      setDeletedMedia(productToEdit.productImages)
                  }}
                  type="button"
                  variant="destructive"
                  className="h-6 w-6 p-0"
                >
                  {" "}
                  <Trash2 className="h-4 w-4 shrink-0" />
                </Button>
              </p>
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      */}

      <Controller
        disabled={isLoading}
        control={form.control}
        name="isAvailable"
        render={({ field, fieldState }) => (
          <Field
            data-invalid={fieldState.invalid}
            className="flex h-fit w-full flex-row items-center justify-between rounded-lg border p-3 shadow-sm"
          >
            <div className="space-y-0.5">
              <FieldLabel>Availability</FieldLabel>
              <FieldDescription>Is the product available?.</FieldDescription>
            </div>
            <Switch
              disabled={isLoading}
              checked={field.value}
              onCheckedChange={field.onChange}
              aria-readonly
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      {/*
      <FormField
        disabled={isLoading}
        control={form.control}
        name="isAvailable"
        render={({ field }) => (
          <FormItem className="flex h-fit w-full flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <FormLabel>Availability</FormLabel>
              <FormDescription>Is the product available?.</FormDescription>
            </div>
            <FormControl>
              <Switch
                disabled={isLoading}
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-readonly
              />
            </FormControl>
          </FormItem>
        )}
      />
      */}
    </motion.div>
  )
}

export default StepOne
{
  /* <Input
                  type="text"
                  disabled={isLoading}
                  value={field.value}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    if (/^\d*$/.test(inputValue)) {
                      field.onChange(Number(inputValue));
                    }
                  }}
                  placeholder="Sale price"
                  // {...field}
                /> */
}
