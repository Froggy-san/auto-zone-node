import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import useObjectCompare from "@hooks/use-compare-objs"
import { useToast } from "@hooks/use-toast"
import {
  createStatus,
  editServiceStatus,
} from "@lib/actions/serviceStatusAction"
import {
  ServiceStatusForm as StatusFromValues,
  ServiceStatus,
  ServiceStatusSchema,
} from "@lib/types"
import React, { SetStateAction, useCallback, useEffect } from "react"
import { useForm } from "react-hook-form"
import { SketchPicker } from "react-color"
import ColorPicker from "@components/color-picker"
import { cn } from "@lib/utils"
import { useTheme } from "next-themes"
import { Input } from "@components/ui/input"
import { Textarea } from "@components/ui/textarea"
import { Button } from "@components/ui/button"
import Spinner from "@components/Spinner"
interface Props {
  statusToEdit?: ServiceStatus
  open: boolean
  setOpen: React.Dispatch<SetStateAction<boolean>>
}

const ServiceStatusForm = ({ statusToEdit, setOpen, open }: Props) => {
  const { theme } = useTheme()
  const { toast } = useToast()

  const defaultValues = {
    name: statusToEdit?.name || "",
    colorLight: statusToEdit
      ? JSON.parse(statusToEdit.colorLight)
      : { h: 0, s: 0, l: 0 },
    colorDark: statusToEdit
      ? JSON.parse(statusToEdit.colorDark)
      : { h: 0, s: 0, l: 0 },
    description: statusToEdit?.description || "",
  }
  const form = useForm<StatusFromValues>({
    mode: "onChange",
    resolver: zodResolver(ServiceStatusSchema),
    defaultValues,
  })

  const { colorLight, colorDark, name } = form.watch()
  const isLoading = form.formState.isSubmitting
  const isEqual = useObjectCompare(form.getValues(), defaultValues)

  useEffect(() => {
    form.reset(defaultValues)
  }, [open])

  const handleClose = useCallback(() => {
    if (isLoading) return
    setOpen(false)
    // form.reset(defaultValues);
  }, [open, isLoading, form])

  async function onSubmit({
    colorLight,
    colorDark,
    name,
    description,
  }: StatusFromValues) {
    try {
      // If the user hasn't changed anything about the form values.
      if (isEqual)
        throw new Error(
          statusToEdit ? "You haven't changed anything." : "Invaild inputs."
        )
      const values = {
        colorLight: JSON.stringify(colorLight),
        colorDark: JSON.stringify(colorDark),
        name,
        description,
      }

      // In case of editting service status.
      if (statusToEdit) {
        const { error } = await editServiceStatus({
          statusToEdit: values,
          id: statusToEdit.id,
        })

        if (error) throw new Error(error)
      } else {
        // In case of creating a new service status.
        const { error } = await createStatus(values)
        if (error) throw new Error(error)
      }

      handleClose()

      toast({
        className: "bg-primary  text-primary-foreground",
        title: "Success!.",
        description: (
          <SuccessToastDescription
            message={
              statusToEdit
                ? "A new service status badge has been created."
                : "Service status badge has been updated."
            }
          />
        ),
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Something went wrong.",
        description: <ErorrToastDescription error={error.message} />,
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col flex-wrap items-center justify-center gap-2 sm:flex-row">
          <p className="text-xs text-muted-foreground">Badge preview:</p>
          <div
            className={cn(
              `w-fit max-w-full rounded-lg px-2 py-1 text-center text-xs font-semibold break-all select-none`
            )}
            style={{
              backgroundColor:
                theme === "light"
                  ? `hsla(${colorLight?.h}, ${colorLight?.s}%, ${colorLight?.l}%, 0.4)`
                  : `hsl(${colorDark?.h}, ${colorDark?.s}%, ${colorDark?.l}%)`,
              color:
                theme === "light"
                  ? `hsl(${colorLight?.h}, ${colorLight?.s + 90}%, ${
                      colorLight?.l - 33
                    }%)`
                  : `hsla(${colorDark?.h}, ${colorDark?.s + 55}%, ${
                      colorDark?.l + 55
                    }%)`,
            }}
          >
            {name ? name : "Dummy text"}
          </div>
        </div>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <FormField
            disabled={isLoading}
            control={form.control}
            name="colorLight"
            render={({ field }) => (
              <FormItem className="mb-auto w-full">
                <FormLabel>Light mode color</FormLabel>
                <FormControl>
                  <ColorPicker
                    primaryMode="light"
                    disableAlpha
                    color={field.value}
                    handler={(value) => {
                      const { h, s, l } = value.hsl
                      field.onChange({
                        h: Number(h.toFixed(1)),
                        s: Number((s * 100).toFixed(1)),
                        l: Number((l * 100).toFixed(1)),
                      })
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Enter badge&apos;s color while on light mode.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            disabled={isLoading}
            control={form.control}
            name="colorDark"
            render={({ field }) => (
              <FormItem className="mb-auto w-full">
                <FormLabel>Dark mode color</FormLabel>
                <FormControl>
                  <ColorPicker
                    primaryMode="dark"
                    disableAlpha
                    color={field.value}
                    handler={(value) => {
                      const { h, s, l } = value.hsl
                      field.onChange({
                        h: Number(h.toFixed(1)),
                        s: Number((s * 100).toFixed(1)),
                        l: Number((l * 100).toFixed(1)),
                      })
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Enter badge&apos;s color whole on dark mode.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          disabled={isLoading}
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="mb-auto w-full">
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter the name of the service status..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter the name of the service status.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          disabled={isLoading}
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="mb-auto w-full">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter the name of the service status..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter a description for the service status.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-2">
          <Button className="w-full" size="sm" type="submit">
            {isLoading ? <Spinner className="h-full" /> : "Submit"}
          </Button>
          <Button
            onClick={handleClose}
            variant="secondary"
            className="w-full"
            size="sm"
            type="button"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default ServiceStatusForm
