import DialogComponent from "@/components/dialog-component"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Product, Service } from "@/types"
import type { Car } from "@/types/carTypes"
import React, { useCallback, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { CreateServiceSchema } from "@/schemas/service.schema"
import type z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { FieldGroup } from "@/components/ui/field"
import StepOne from "./StepOne"
import { AnimatePresence } from "framer-motion"
import {
  Progress,
  ProgressBarContainer,
  ProgressMeter,
} from "@/components/progress"
import StepTwo from "./StepTwo"
import StepThree from "./StepThree"
import Spinner from "@/components/Spinner"
import { formatCurrency } from "@/lib/client-helpers"
import { motion } from "framer-motion"
import { ProFormSlideVariants, ProFormTransition } from "@/lib/constants"
import { toast } from "sonner"
interface ServiceFormProps {
  car: Car
  open: boolean
  setOpen: (value: boolean) => void
  serviceToEdit?: Service
}

const firstStep = [
  "serviceStatus",
  "technician",
  "odometer",
  "serviceDate",
  "laborTime",
] as const
const secondStep = ["serviceFees"] as const
const thirdStep = [
  "productsSold",
  "subTotal",
  "taxAmount",
  "totalDiscount",
  "grandTotal",
  "amountReceived",
  "paymentStatus",
  "priority",
  "note",
] as const
const stepsFields = [firstStep, secondStep, thirdStep]
const ServiceForm = ({
  car,
  open,
  setOpen,
  serviceToEdit,
}: ServiceFormProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [[step, direction], setStep] = React.useState<[number, number]>([0, 1])
  const [products, setProducts] = React.useState<(Product | null)[]>([])
  const maxNumOfSteps = 3
  const client = car.user
  const formRef = React.useRef<HTMLFormElement>(null)
  const handleOpen = () => setIsOpen(true)
  const handleNext = useCallback(
    (newStep: number) => {
      // Prevent overflow or underflow if needed:
      if (newStep < 0 || newStep > maxNumOfSteps) return

      const newDirection = newStep > step ? 1 : -1

      setStep([newStep, newDirection])
    },
    [step, setStep]
  )
  function handleSubmit() {
    if (formRef.current) {
      formRef.current.requestSubmit()
    }
  }

  const defaultValues = {
    user: serviceToEdit ? serviceToEdit._id : "",
    car: car._id,
    serviceStatus: serviceToEdit ? serviceToEdit.serviceStatus._id : "",
    technician: serviceToEdit
      ? serviceToEdit.technician.map((tech) => tech._id)
      : [],
    odometer: serviceToEdit ? serviceToEdit.odometer : "",
    subTotal: serviceToEdit ? serviceToEdit.subTotal : 0,
    taxAmount: serviceToEdit ? serviceToEdit.taxAmount : 0,
    totalDiscount: serviceToEdit ? serviceToEdit.totalDiscount : 0,
    grandTotal: serviceToEdit ? serviceToEdit.grandTotal : 0,
    amountReceived: serviceToEdit ? serviceToEdit.amountReceived : 0,
    paymentStatus: serviceToEdit ? serviceToEdit.paymentStatus : "unpaid",
    priority: serviceToEdit ? serviceToEdit.priority : "low",
    note: serviceToEdit ? serviceToEdit.note : "",
    serviceFees: serviceToEdit
      ? serviceToEdit.serviceFees
      : [
          {
            price: 0,
            discount: 0,
            category: "",
            note: "",
            isReturned: false,
          },
        ],
    productsSold: serviceToEdit ? serviceToEdit.productsSold : [],
    serviceDate: serviceToEdit
      ? new Date(serviceToEdit.serviceDate)
      : new Date(),
    laborTime: serviceToEdit ? serviceToEdit.laborTime : 0,
  }

  const form = useForm<z.infer<typeof CreateServiceSchema>>({
    mode: "onChange",
    resolver: zodResolver(CreateServiceSchema),
    defaultValues,
  })

  const formValues = form.watch()

  // useEffect(() => {
  //   console.log("EFFECT FIRED")
  //   formValues.serviceFees.forEach((item, index) => {
  //     if (item.price > item.discount) {
  //       form.clearErrors(`serviceFees.${index}.discount`)
  //     }
  //   })
  // }, [formValues.serviceFees, form])

  const totalFees = formValues.serviceFees.reduce(
    (acc, fee) => {
      acc.totalPrice += fee.price
      acc.totalDiscount += fee.discount
      return acc
    },
    { totalPrice: 0, totalDiscount: 0 }
  )
  const totalProductSoldAmounts = formValues.productsSold.reduce(
    (acc, curr) => {
      acc.totalPrice += curr.pricePerUnit * curr.count
      acc.totalDiscount += curr.discountPerUnit * curr.count
      acc.totalCount += curr.count
      return acc
    },
    { totalPrice: 0, totalDiscount: 0, totalCount: 0 }
  )
  const isLoading = form.formState.isSubmitting
  //   const disabled = !form.formState.isValid

  const isInVaild = useMemo(() => {
    const currentStepFields = stepsFields[step]
    if (step === 0) {
      return currentStepFields.some((field) => {
        const fieldError = form.formState.errors[field] || !formValues[field]
        return fieldError
      })
    } else if (step === 1) {
      return formValues.serviceFees.some((fee) => {
        const hasError =
          !fee.category || fee.price <= 0 || fee.discount > fee.price
        return hasError
      })
    } else {
      return formValues.productsSold.some((sold) => {
        const hasError =
          !sold.product ||
          !sold.pricePerUnit ||
          !sold.count ||
          sold.pricePerUnit < sold.discountPerUnit
        return hasError
      })
    }
  }, [step, formValues, form.formState.errors, form.getFieldState])

  const disabled = isLoading || isInVaild

  async function onSubmit(values: z.infer<typeof CreateServiceSchema>) {
    console.log("Form submitted with values:", values)

    try {
    } catch (err) {
      console.error("Error submitting form:", err)
      toast.error(
        `Something went wrong while ${serviceToEdit ? "updating" : "creating"} the service. Please try again: ${err instanceof Error ? err.message : "Unknown error"}`
      )
    }
  }

  useEffect(() => {
    form.reset(defaultValues)
  }, [isOpen])

  return (
    <DialogComponent open={isOpen} onOpenChange={setIsOpen}>
      <Button onClick={handleOpen} size="sm" className="w-full">
        {serviceToEdit ? "Edit" : "Create"} a service
      </Button>
      {/* sm:p-14 pb-0 sm:pb-0 */}
      <DialogComponent.Content className="flex max-h-[85vh] max-w-[1050px] flex-col gap-1 overflow-hidden border border-transparent p-0 sm:rounded-none lg:rounded-lg">
        <DialogComponent.Header>
          <DialogComponent.Title className="text-2xl">
            Service
          </DialogComponent.Title>
          <DialogComponent.Description>
            You are initiating a service for &lsquo;{client?.username || ""}
            &lsquo; on the vehicle with plate number &lsquo;
            {car?.plateNumber || ""}
            &lsquo;.
          </DialogComponent.Description>
        </DialogComponent.Header>

        <form
          ref={formRef}
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn(
            "relative space-y-8 overflow-x-hidden overflow-y-auto overscroll-contain px-6 py-4 sm:px-6 md:px-14",
            {
              "px-2 sm:px-6": step === maxNumOfSteps,
            }
          )}
        >
          <FieldGroup>
            <AnimatePresence mode="wait">
              {step === 0 && (
                <StepOne
                  form={form}
                  isLoading={isLoading}
                  car={car}
                  currentStep={[step, direction]}
                />
              )}

              {step === 1 && (
                <StepTwo
                  isLoading={isLoading}
                  totalFees={totalFees}
                  form={form}
                  car={car}
                  currentStep={[step, direction]}
                  serviceFees={formValues.serviceFees}
                  //   setDeletedDetails={setDeletedDetails}
                />
              )}

              {step === 2 && (
                <StepThree
                  form={form}
                  products={products}
                  setProducts={setProducts}
                  productsSold={formValues.productsSold}
                  totalProductSoldAmounts={totalProductSoldAmounts}
                  currentStep={[step, direction]}
                  isLoading={isLoading}
                  car={car}
                />
              )}

              {step === maxNumOfSteps && (
                <motion.div
                  custom={direction}
                  variants={ProFormSlideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={ProFormTransition}
                  className="space-y-7"
                >
                  <div className="mx-auto max-w-[500px]">
                    <h3 className="text-sm">Total:</h3>
                    <div className="space-y-2 border-t py-2 text-xs text-muted-foreground">
                      <div className="flex flex-col justify-between gap-5 xs:flex-row xs:items-center">
                        <div className="space-y-2">
                          <div>
                            Products amount:{" "}
                            <span className="dark:after:text-dashboard-indigo relative after:absolute after:-top-1 after:-right-8 after:text-indigo-800 after:content-['units']">
                              {totalProductSoldAmounts.totalCount}
                            </span>
                          </div>
                          <div>
                            Total products revenue:{" "}
                            {formatCurrency(totalProductSoldAmounts.totalPrice)}
                          </div>
                          <div>
                            Total product discount:{" "}
                            {formatCurrency(
                              totalProductSoldAmounts.totalDiscount
                            )}
                          </div>
                          <div className="w-fit border-y py-2 text-xs">
                            Net products sold:{" "}
                            <span className="dark:text-dashboard-indigo text-indigo-800">
                              {" "}
                              {formatCurrency(
                                totalProductSoldAmounts.totalPrice -
                                  totalProductSoldAmounts.totalDiscount
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            Fees amount:{" "}
                            <span className="dark:after:text-dashboard-orange relative text-orange-400 after:absolute after:-top-1 after:-right-7 after:content-['fees']">
                              {formValues.serviceFees.length}
                            </span>
                          </div>
                          <div>
                            Total fees revenue:{" "}
                            {formatCurrency(totalFees.totalPrice)}
                          </div>
                          <div>
                            Total fees discount:{" "}
                            {formatCurrency(totalFees.totalDiscount)}
                          </div>
                          <div className="w-fit border-y py-2">
                            Net fees:{" "}
                            <span className="dark:text-dashboard-orange text-xs text-orange-400">
                              {" "}
                              {formatCurrency(
                                totalFees.totalPrice - totalFees.totalDiscount
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="border-t pt-1">
                        <div>
                          {" "}
                          Total Revenue:{" "}
                          {formatCurrency(
                            totalFees.totalPrice +
                              totalProductSoldAmounts.totalPrice
                          )}
                        </div>
                        <div>
                          {" "}
                          Total discount:{" "}
                          {formatCurrency(
                            totalFees.totalDiscount +
                              totalProductSoldAmounts.totalDiscount
                          )}
                        </div>
                        <div>
                          Net:{" "}
                          {formatCurrency(
                            totalProductSoldAmounts.totalPrice +
                              totalFees.totalPrice -
                              (totalProductSoldAmounts.totalDiscount +
                                totalFees.totalDiscount)
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </FieldGroup>
        </form>

        <DialogComponent.Footer className="z-50 border-t bg-background px-6 pt-2 pb-6 sm:px-14 sm:pt-4 sm:pb-8">
          {/* bg-muted-foreground/20 dark:bg-accent */}
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex-1 rounded-md bg-muted-foreground/10 p-3 dark:bg-accent/20">
              <Progress value={step} maxValue={maxNumOfSteps}>
                <ProgressBarContainer className="flex-1 border border-secondary-foreground/20 dark:border-border">
                  <ProgressMeter />
                </ProgressBarContainer>
              </Progress>
            </div>
            <div className="flex w-fit items-center gap-2">
              {/* sm:w-[unset] */}
              <Button
                onClick={() => handleNext(step - 1)}
                type="reset"
                variant="secondary"
                size="sm"
                disabled={isLoading || step === 0}
                className="w-full sm:w-[unset]"
              >
                Back
              </Button>
              <Button
                size="sm"
                disabled={isLoading || disabled}
                className="w-full sm:w-[unset]"
                onClick={() => {
                  if (step < maxNumOfSteps) {
                    handleNext(step + 1)
                  } else {
                    handleSubmit()
                  }
                }}
              >
                {isLoading ? (
                  <Spinner className="h-full" />
                ) : step < maxNumOfSteps ? (
                  "Next"
                ) : serviceToEdit ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </div>
        </DialogComponent.Footer>
      </DialogComponent.Content>
    </DialogComponent>
  )
}

export default ServiceForm
