import { ProFormSlideVariants, ProFormTransition } from "@/lib/constants"
import type { CreateServiceSchema } from "@/schemas/service.schema"
import type { Car } from "@/types/carTypes"
import React, { useEffect } from "react"
import { Controller, useFieldArray, type UseFormReturn } from "react-hook-form"
import { motion } from "framer-motion"
import type z from "zod"
import { cn } from "@/lib/utils"
import { Cross2Icon } from "@radix-ui/react-icons"
import CurrencyInput from "react-currency-input-field"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { ComboBox } from "@/components/combo-box"
import useCategories from "../categories/useCategories"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency } from "@/lib/client-helpers"
import { Button } from "@/components/ui/button"

type Form = UseFormReturn<z.infer<typeof CreateServiceSchema>, any>

interface StepTwoProps {
  form: Form
  currentStep: [number, number]
  isLoading: boolean
  car: Car
  totalFees: { totalPrice: number; totalDiscount: number }
  serviceFees: {
    category: string
    price: number
    discount: number
    isReturned: boolean
    note: string
  }[]
}

const StepTwo = ({
  form,
  currentStep,
  isLoading,
  car,
  serviceFees,
  totalFees,
}: StepTwoProps) => {
  const [step, direction] = currentStep
  const { categories, isLoading: catgoryLoading, error } = useCategories()
  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
    { rules: { minLength: 1 }, name: "serviceFees", control: form.control }
  )

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
      <ul className="space-y-10">
        {fields.map((item, i) => (
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
            key={item.id}
            className="space-y-6"
          >
            <h2>{i + 1}.</h2>
            <div
              className={cn("relative space-y-4", {
                "rounded-xl border p-3": i !== 0,
              })}
            >
              {i !== 0 && (
                <button
                  onClick={() => {
                    remove(i)
                  }}
                  className="absolute top-5 right-5 rounded-sm opacity-70 transition-opacity outline-none hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                  type="button"
                >
                  <Cross2Icon className="h-4 w-4" />
                </button>
              )}
              <div className="flex flex-col gap-2 sm:flex-row">
                <Controller
                  name={`serviceFees.${i}.price`}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
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
                          form.trigger(`serviceFees.${i}.discount`)
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
                  name={`serviceFees.${i}.discount`}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Discount</FieldLabel>
                      <CurrencyInput
                        id="discount"
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
                        Enter the service fee discount.
                      </FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name={`serviceFees.${i}.category`}
                  control={form.control}
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
                        }}
                      />
                      <FieldDescription>
                        Chose the relevant category to the service fee provided.
                      </FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
              <Controller
                name={`serviceFees.${i}.note`}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Note</FieldLabel>
                    <Textarea
                      disabled={isLoading}
                      placeholder="Additional details..."
                      {...field}
                    />
                    <FieldDescription>
                      Enter any additional details about the service fee.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <div className="text-sm text-muted-foreground">
                Total:{" "}
                {formatCurrency(
                  serviceFees[i]?.price - serviceFees[i]?.discount
                )}
              </div>
            </div>
          </motion.li>
        ))}
        {/* {serviceFees.length && ( */}
        <Button
          size="sm"
          // variant="orange"
          type="button"
          className="w-full"
          onClick={() =>
            append({
              price: 0,
              discount: 0,
              category: "",
              note: "",
              isReturned: false,
            })
          }
        >
          ADD A FEE
        </Button>
        {/* )} */}

        <div className="w-[280px]">
          <h3 className="text-sm">Total:</h3>
          <div className="space-y-2 border-t border-b py-2 text-xs text-muted-foreground">
            <div>
              Total fees:{" "}
              <span className="dark:after:text-dashboard-orange relative after:absolute after:-top-1 after:-right-7 after:text-orange-400 after:content-['fees']">
                {formatCurrency(totalFees.totalPrice)}
              </span>
            </div>
            <div>
              Total fees discount: {formatCurrency(totalFees.totalDiscount)}
            </div>
            <div className="border-t pt-1">
              Net:{" "}
              {formatCurrency(totalFees.totalPrice - totalFees.totalDiscount)}
            </div>
          </div>
        </div>
      </ul>
    </motion.div>
  )
}

export default StepTwo
