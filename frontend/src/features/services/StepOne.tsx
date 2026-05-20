import type { CreateServiceSchema } from "@/schemas/service.schema"
import React from "react"
import { Controller, type UseFormReturn } from "react-hook-form"
import { motion } from "framer-motion"
import { ProFormSlideVariants, ProFormTransition } from "@/lib/constants"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { Car } from "@/types/carTypes"
import { ServiceStatusCombobox } from "@/components/service-status-combobox"
import type z from "zod"
import CurrencyInput from "react-currency-input-field"
import { ClientsComboBox } from "@/components/clients-combobox"
import { Textarea } from "@/components/ui/textarea"
import DatePicker from "@/components/DatePicker"
import PrioritySelect from "@/components/priority-select"

type Form = UseFormReturn<z.infer<typeof CreateServiceSchema>, any>

interface StepOneProps {
  form: Form
  currentStep: [number, number]
  isLoading: boolean
  car: Car
}

const StepOne = ({ form, currentStep, isLoading, car }: StepOneProps) => {
  const [step, direction] = currentStep
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
      <div className="flex flex-col gap-2 space-y-4 sm:flex-row sm:space-y-0">
        <div className="group/field flex w-full flex-col gap-3 *:w-full data-[invalid=true]:text-destructive [&>.sr-only]:w-auto">
          <FieldLabel>Client</FieldLabel>
          <Input disabled placeholder="Client" value={car.user.username} />
          <FieldDescription>Car owner.</FieldDescription>
        </div>

        <div className="group/field flex w-full flex-col gap-3 *:w-full data-[invalid=true]:text-destructive [&>.sr-only]:w-auto">
          <FieldLabel>Car</FieldLabel>
          <Input disabled placeholder="Car" value={car.plateNumber} />
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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="user"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="mb-auto">
              <FieldLabel htmlFor={field.name}>Tecnician</FieldLabel>
              <ClientsComboBox
                setValue={field.onChange}
                value={field.value}
                disabled={isLoading}
                adminOnly
              />

              <FieldDescription>
                Enter the tecnician performing the service.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
      <div className="flex flex-col gap-2 space-y-4 sm:flex-row sm:space-y-0">
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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </motion.div>
  )
}

export default StepOne
