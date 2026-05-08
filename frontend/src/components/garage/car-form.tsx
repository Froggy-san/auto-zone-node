import DialogComponent from "@/components/dialog-component"
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@/components/toast-items"
import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"

import useObjectCompare from "@/hooks/use-compare-objs"
import { useToast } from "@/hooks/use-toast"

import React, { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Key, RotateCcw, Trash2 } from "lucide-react"
import Spinner from "@/components/Spinner"
import { Textarea } from "@/components/ui/textarea"
import { ClientsComboBox } from "@/components/clients-combobox"

import { GarageFileUploader } from "./garage-files-uploader"
import { useQueryClient } from "@tanstack/react-query"
import { ComboBox } from "@/components/combo-box"
import { MakerCombobox } from "@/components/maker-combobox"
import { ModelCombobox } from "@/components/model-combobox"

import CurrencyInput from "react-currency-input-field"
import type { Car, CarImage, CarMaker, CarModel, User } from "@/types"
import { useLocation, useNavigate, useSearchParams } from "react-router"
import { CreateCarSchema, type CreateCar } from "@/lib/types"
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field"
import { createCar, updateCar } from "@/services/carApi"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"

const CarForm = ({
  useParams,
  carToEdit,
  clientId,

  clients,

  open,
  handleClose: handleCloseExternal,
}: {
  useParams?: boolean
  carToEdit?: Car
  clientId?: string
  // carMakers: CarMaker[]
  clients: User[]
  open?: boolean
  handleClose?: () => void
}) => {
  const [searchParam] = useSearchParams()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const pathname = useLocation().pathname
  const edit = searchParam.get("edit") ?? ""
  const carInfo = carToEdit?.carGeneration
  const [isOpen, setIsOpen] = useState(edit ? true : false)
  const [deletedMedia, setDeletedMedia] = useState<CarImage[]>([])
  const [carMakerId, setCarMakerId] = useState<string | null>(
    carInfo?.carModel.carMaker._id || ""
  )
  const [carModelId, setCarModelId] = useState<string>(
    carInfo?.carModel._id || ""
  )
  const [models, setModels] = useState<CarModel[]>([])

  const mediaUrls = useMemo(() => {
    const deletedIds = deletedMedia.map((del) => del._id)
    const mediaArr = carToEdit
      ? carToEdit.carImages.filter(
          (imageObj) => !deletedIds.includes(imageObj._id)
        )
      : []
    return mediaArr
  }, [deletedMedia, carToEdit])

  const isEditing = edit ? true : false || isOpen

  const defaultValues = {
    color: carToEdit?.color || "#d9c814",
    plateNumber: carToEdit?.plateNumber || "",
    chassisNumber: carToEdit?.chassisNumber || "",
    motorNumber: carToEdit?.motorNumber || "",
    odometer: carToEdit?.odometer || "",
    notes: carToEdit?.notes || "",
    user: clientId || "",
    carGeneration: carInfo?._id || "",
    images: [],
    mainImageName: carToEdit?.mainImageName || "",
  }
  const form = useForm<CreateCar>({
    mode: "onChange",
    resolver: zodResolver(CreateCarSchema),
    defaultValues,
  })

  const isEqual = !form.formState.isDirty
  const isVaild = form.formState.isValid

  //  useObjectCompare(defaultValues, form.getValues())

  const disabled = (isEqual && !deletedMedia.length) || !isVaild

  const isLoading = form.formState.isSubmitting

  // const models =
  //   carMakers.find((maker) => maker._id === carMakerId)?.carModels || []
  const generations =
    models.find((model) => model._id === carModelId)?.generations || []

  // const models: CarModelProps[] = (
  //   carMakerId && carMakers.length
  //     ? carMakers.find((maker) => maker.id === carMakerId)?.carModels
  //     : []
  // ) as CarModelProps[];

  // const generations =
  //   carModelId && carGenerations.length
  //     ? carGenerations.filter((gen) => gen.carModelId === carModelId)
  //     : [];
  const params = new URLSearchParams(searchParam)
  function handleOpen() {
    setIsOpen(true)
  }

  function handleReset() {
    form.reset(defaultValues)
    setCarMakerId(carInfo?.carModel.carMaker._id || "")
    setCarModelId(carInfo?.carModel._id || "")
    setDeletedMedia([])
  }

  function handleClose() {
    if (edit) {
      const params = new URLSearchParams(searchParam)
      params.delete("edit")
      navigate(`${pathname}?${params.toString()}`, { replace: true })
    }
    setIsOpen(false)

    if (isLoading) return
    handleReset()
  }

  function handleDeleteMedia(carImage: CarImage) {
    setDeletedMedia((arr) => [...arr, carImage])
  }

  async function onSubmit({ images, ...rest }: CreateCar) {
    try {
      const formData = new FormData()

      Object.entries(rest).forEach(([key, value]) =>
        formData.append(key, value)
      )

      images.forEach((image) => formData.append("carImages", image))

      if (carToEdit) {
        await updateCar({ id: carToEdit.id, data: formData })
        // await editCar({
        //   car,
        //   imagesToDelete: deletedMedia,
        //   imagesToUpload,
        //   isEqual,
        //   id: carToEdit.id.toString(),
        // })
        queryClient.invalidateQueries({ queryKey: ["cars"] })
        queryClient.invalidateQueries({ queryKey: ["carById", carToEdit.id] })
      } else {
        await createCar(formData)
        // await createCar({
        //   car,
        //   images: imagesToUpload,
        // })
        queryClient.invalidateQueries({ queryKey: ["cars"] })
      }
      handleClose()

      toast.success("Car created")
      // toast({
      //   className: "bg-primary  text-primary-foreground",
      //   title: carToEdit ? "Data updated." : "A new car has been created",
      //   description: (
      //     <SuccessToastDescription
      //       message={
      //         carToEdit
      //           ? "Car's data has been edited successfuly"
      //           : "A new client has been created."
      //       }
      //     />
      //   ),
      // })
    } catch (error: any) {
      toast.error(error.message)

      // toast({
      //   variant: "destructive",
      //   title: "Faild to create a new car.",
      //   description: <ErorrToastDescription error={error.message} />,
      // })
    }
  }
  return (
    <DialogComponent open={isEditing} onOpenChange={handleClose}>
      {open === undefined && (
        <Button onClick={handleOpen} size="sm" className="w-full">
          {carToEdit ? "Edit car" : " Create car"}
        </Button>
      )}

      <DialogComponent.Content className="max-h-[76vh] max-w-[1000px] overflow-y-auto sm:p-14">
        <DialogComponent.Header>
          <DialogComponent.Title>
            {" "}
            {carToEdit ? "Update car's data" : " Create a new car"}r
          </DialogComponent.Title>
          {/* <DialogComponent.Description>
            Create a new car.
          </DialogComponent.Description> */}
        </DialogComponent.Header>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-6">
            <div className="mb-auto w-[48.5%] space-y-3 sm:w-[32%]">
              <FieldLabel>Car maker</FieldLabel>

              <MakerCombobox
                disabled={isLoading}
                value={carMakerId}
                setModels={setModels}
                setValue={(value) => {
                  setCarMakerId(value || null)

                  setCarModelId("")
                  form.setValue("carGeneration", "")
                }}
              />

              <FieldDescription>Enter car maker.</FieldDescription>
            </div>

            <div className="mb-auto w-[48.5%] space-y-3 sm:w-[32%]">
              <FieldLabel>Car model</FieldLabel>

              <ModelCombobox
                disabled={isLoading || !carMakerId}
                value={carModelId}
                setValue={(value) => {
                  setCarModelId(value)
                  form.setValue("carGeneration", "")
                }}
                options={models}
              />

              <FieldDescription>Enter car model.</FieldDescription>
            </div>
            <Controller
              name="carGeneration"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  className="!mb-auto w-[48.5%] sm:w-[32%]"
                  data-invalid={fieldState.invalid}
                >
                  <FieldLabel htmlFor="carGeneration">
                    Car Generation
                  </FieldLabel>
                  <ComboBox
                    disabled={isLoading || !carModelId || !models.length}
                    options={generations}
                    setValue={(value) => {
                      console.log(value, "VVVVV")
                      field.onChange(value)
                    }}
                    value={field.value}
                  />
                  <FieldDescription>Enter car generation.</FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <div className="flex flex-col gap-2 gap-y-6 xs:flex-row">
            <Controller
              name="odometer"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="odometer">Odometer</FieldLabel>
                  <CurrencyInput
                    id="odometer"
                    name="odometer"
                    placeholder="Odometer reading..."
                    decimalsLimit={2} // Max number of decimal places
                    prefix="KM " // Currency symbol (e.g., Egyptian Pound)
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
                    Enter car&apos;s odometer reading.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="plateNumber"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="plate-number">Plate Number</FieldLabel>
                  <Input
                    {...field}
                    id="plate-number"
                    aria-invalid={fieldState.invalid}
                    placeholder="Plate Number"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Enter car&apos;s plate number.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <div className="flex flex-col gap-2 gap-y-6 xs:flex-row">
            <Controller
              name="motorNumber"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="motor-number">Motor Number</FieldLabel>
                  <Input
                    {...field}
                    id="motor-number"
                    aria-invalid={fieldState.invalid}
                    placeholder="Motor Number"
                    autoComplete="off"
                  />
                  <FieldDescription>Enter car&apos;s motor.</FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="chassisNumber"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="chassisNumber">
                    Chassis number
                  </FieldLabel>
                  <Input
                    {...field}
                    id="chassisNumber"
                    aria-invalid={fieldState.invalid}
                    placeholder="Chassis Number"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Enter car&apos;s chassis number.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <div className="flex flex-col gap-2 gap-y-6 xs:flex-row">
            {!carToEdit && (
              <Controller
                name="user"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="client">Client</FieldLabel>
                    <ClientsComboBox
                      disabled={isLoading}
                      value={field.value}
                      setValue={field.onChange}
                    />
                    <FieldDescription>
                      Enter which client does this car belongs to.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            )}

            <Controller
              name="color"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="color">Color</FieldLabel>
                  <Input
                    {...field}
                    type="color"
                    id="color"
                    aria-invalid={fieldState.invalid}
                    placeholder="Color"
                    autoComplete="off"
                  />
                  <FieldDescription>Enter car&apos;s color.</FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
          <Controller
            name="notes"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="notes">Notes</FieldLabel>
                <Textarea
                  disabled={isLoading}
                  placeholder="Car information..."
                  {...field}
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

          <Controller
            name="images"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="notes">Car Images</FieldLabel>
                <GarageFileUploader
                  selectedFiles={field.value}
                  handleDeleteMedia={handleDeleteMedia}
                  fieldChange={field.onChange}
                  mediaUrl={mediaUrls}
                  disabled={isLoading}
                />
                <FieldDescription className="flex justify-between">
                  <span> Enter car&apos;s information.</span>{" "}
                  <div className="flex items-center gap-2">
                    <span className="text-xs">
                      Images: {field.value.length + mediaUrls?.length}
                    </span>
                    <Button
                      disabled={
                        (!field.value.length && !mediaUrls.length) || isLoading
                      }
                      onClick={() => {
                        field.onChange([])

                        if (carToEdit) setDeletedMedia(carToEdit.carImages)
                      }}
                      type="button"
                      variant="destructive"
                      className="h-6 w-6 p-0"
                    >
                      {" "}
                      <Trash2 className="h-4 w-4 shrink-0" />
                    </Button>
                  </div>
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="relative flex flex-col-reverse items-center justify-end gap-3 sm:flex-row">
            <Button
              onClick={handleReset}
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
              disabled={disabled || isLoading}
              className="w-full sm:w-[unset]"
            >
              {isLoading ? (
                <Spinner className="h-full" />
              ) : carToEdit ? (
                "Update"
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

export default CarForm
