import type { CreateServiceSchema } from "@/schemas/service.schema"
import type { Car } from "@/types/carTypes"
import React from "react"
import { Controller, useFieldArray, type UseFormReturn } from "react-hook-form"
import { motion } from "framer-motion"
import { ProFormSlideVariants, ProFormTransition } from "@/lib/constants"
import { formatCurrency } from "@/lib/client-helpers"
import type { Product } from "@/types"
import { cn } from "@/lib/utils"
import { Cross2Icon } from "@radix-ui/react-icons"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import CurrencyInput from "react-currency-input-field"
import { ProductsComboBox } from "@/components/proudcts-combo-box"
import { Button } from "@/components/ui/button"
import type z from "zod"

type Form = UseFormReturn<z.infer<typeof CreateServiceSchema>, any>

interface StepThreeProps {
  form: Form
  currentStep: [number, number]
  isLoading: boolean
  products: (Product | null)[]
  setProducts: React.Dispatch<React.SetStateAction<(Product | null)[]>>
  car: Car
  totalProductSoldAmounts: {
    totalPrice: number
    totalDiscount: number
    totalCount: number
  }
  productsSold: {
    product: string
    pricePerUnit: number
    discountPerUnit: number
    count: number
    isReturned: boolean
    note: string
  }[]
}

const StepThree = ({
  form,
  products,
  setProducts,
  currentStep,
  isLoading,
  car,
  productsSold,
  totalProductSoldAmounts,
}: StepThreeProps) => {
  const [step, direction] = currentStep

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
    { rules: { minLength: 1 }, name: "productsSold", control: form.control }
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
      <div className="space-y-8 py-10">
        <ul className="space-y-10">
          {fields.map((item, i) => {
            const maxAmount =
              products.find(
                (product) => product?._id === productsSold[i]?.product
              )?.stock || 0

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
                key={item.id}
                className="space-y-6"
              >
                <h2>{i + 1}.</h2>
                <div className={cn("relative space-y-4 rounded-xl border p-3")}>
                  <button
                    onClick={() => {
                      remove(i)
                    }}
                    className="absolute top-5 right-5 rounded-sm opacity-70 transition-opacity outline-none hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                    type="button"
                  >
                    <Cross2Icon className="h-4 w-4" />
                  </button>
                  <Controller
                    control={form.control}
                    name={`productsSold.${i}.product`}
                    disabled={isLoading}
                    render={({ field, fieldState }) => (
                      <Field
                        className="mb-auto w-full"
                        data-invalid={fieldState.invalid}
                      >
                        <FieldLabel htmlFor={field.name}>Product</FieldLabel>
                        <ProductsComboBox
                          value={products[i]}
                          // productArr={products}
                          // setProductArr={setProducts}
                          productToSell={productsSold}
                          setValue={(product) => {
                            field.onChange(product?._id || "")

                            setProducts((prev) => {
                              const newArr = [...prev]
                              newArr[i] = product || null
                              return newArr
                            })
                            if (product) {
                              console.log("Selected Product ID:", product?._id)
                              console.log("Selected Product Object:", product)
                              if (product) {
                                form.setValue(
                                  `productsSold.${i}.pricePerUnit`,
                                  product.listPrice
                                )
                                form.setValue(
                                  `productsSold.${i}.discountPerUnit`,
                                  product.listPrice - product.salePrice
                                )
                              }
                            }
                          }}
                        />
                        <FieldDescription>
                          Enter which product you are selling.
                        </FieldDescription>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Controller
                      control={form.control}
                      name={`productsSold.${i}.pricePerUnit`}
                      disabled={isLoading}
                      render={({ field, fieldState }) => (
                        <Field
                          className="mb-auto w-full"
                          data-invalid={fieldState.invalid}
                        >
                          <FieldLabel htmlFor={field.name}>
                            Price per unit
                          </FieldLabel>
                          <CurrencyInput
                            id={field.name}
                            aria-invalid={fieldState.invalid}
                            placeholder="Price-per-unit"
                            decimalsLimit={2}
                            prefix="EGP "
                            decimalSeparator="."
                            groupSeparator=","
                            className="input-field"
                            value={field.value || ""}
                            onValueChange={(formattedValue, name, value) => {
                              field.onChange(Number(value?.value) || 0)
                              form.trigger(`productsSold.${i}.discountPerUnit`)
                            }}
                          />
                          <FieldDescription>
                            Enter the cost of each unit.
                          </FieldDescription>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />

                    <Controller
                      control={form.control}
                      name={`productsSold.${i}.discountPerUnit`}
                      disabled={isLoading}
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
                            aria-invalid={fieldState.invalid}
                            placeholder="Discount-per-unit"
                            decimalsLimit={2}
                            prefix="EGP "
                            decimalSeparator="."
                            groupSeparator=","
                            className="input-field"
                            value={field.value || ""}
                            onValueChange={(formattedValue, name, value) => {
                              console.log("Discount per unit value:", value)
                              field.onChange(Number(value?.value) || 0)
                            }}
                          />
                          <FieldDescription>
                            Enter the discount per unit.
                          </FieldDescription>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />

                    <Controller
                      control={form.control}
                      name={`productsSold.${i}.count`}
                      disabled={isLoading}
                      render={({ field, fieldState }) => (
                        <Field
                          className="mb-auto w-full"
                          data-invalid={fieldState.invalid}
                        >
                          <FieldLabel htmlFor={field.name}>Count</FieldLabel>
                          <CurrencyInput
                            id={field.name}
                            aria-invalid={fieldState.invalid}
                            placeholder="Available Stock"
                            decimalsLimit={2}
                            prefix="UNITS "
                            decimalSeparator="."
                            groupSeparator=","
                            className="input-field"
                            value={field.value || ""}
                            onValueChange={(asloidk, idk, value) => {
                              const newValue = value ? Number(value.value) : 0
                              const isMaxAmount = newValue > maxAmount

                              field.onChange(
                                isMaxAmount
                                  ? Number(maxAmount)
                                  : Number(newValue)
                              )

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
                          <FieldDescription>
                            Enter the amount of units sold.
                          </FieldDescription>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </div>

                  <Controller
                    control={form.control}
                    name={`productsSold.${i}.note`}
                    disabled={isLoading}
                    render={({ field, fieldState }) => (
                      <Field
                        className="mb-auto w-full"
                        data-invalid={fieldState.invalid}
                      >
                        <FieldLabel htmlFor={field.name}>Notes</FieldLabel>
                        <Textarea
                          {...field}
                          id={field.name}
                          aria-invalid={fieldState.invalid}
                          placeholder="Additional details..."
                        />
                        <FieldDescription>
                          Enter car&apos;s information.
                        </FieldDescription>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <div className="mt-6">
                    <div className="text-sm">
                      <span> Total price before discount:</span>
                      <span className="ml-3 text-muted-foreground">
                        {formatCurrency(
                          productsSold[i]?.pricePerUnit * productsSold[i]?.count
                        )}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span> Total discount: </span>
                      <span className="ml-3 text-muted-foreground">
                        {formatCurrency(
                          productsSold[i]?.discountPerUnit *
                            productsSold[i]?.count
                        )}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span> Total price after discount: </span>
                      <span className="ml-3 text-muted-foreground">
                        {formatCurrency(
                          (productsSold[i]?.pricePerUnit -
                            productsSold[i]?.discountPerUnit) *
                            productsSold[i]?.count
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.li>
            )
          })}

          <Button
            size="sm"
            variant="secondary"
            type="button"
            className="w-full"
            onClick={() =>
              append({
                pricePerUnit: 0,
                discountPerUnit: 0,
                count: 0,
                product: "",
                note: "",
                isReturned: false,
              })
            }
          >
            ADD PRODUCT SOLD
          </Button>

          <div className="w-[280px]">
            <h3 className="text-sm">Total:</h3>
            <div className="space-y-2 border-t border-b py-2 text-xs text-muted-foreground">
              <div>
                Amount:{" "}
                <span className="dark:after:text-dashboard-indigo relative after:absolute after:-top-1 after:-right-8 after:text-indigo-800 after:content-['units']">
                  {totalProductSoldAmounts.totalCount}
                </span>
              </div>
              <div>
                Total price:{" "}
                {formatCurrency(totalProductSoldAmounts.totalPrice)}
              </div>
              <div>
                Total discount:{" "}
                {formatCurrency(totalProductSoldAmounts.totalDiscount)}
              </div>
              <div className="border-t pt-1">
                Net:{" "}
                {formatCurrency(
                  totalProductSoldAmounts.totalPrice -
                    totalProductSoldAmounts.totalDiscount
                )}
              </div>
            </div>
          </div>
        </ul>
      </div>
    </motion.div>
  )
}

export default StepThree
