"use client";
import DialogComponent from "@components/dialog-component";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";
import { Button } from "@components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import useObjectCompare from "@hooks/use-compare-objs";
import { useToast } from "@hooks/use-toast";
import {
  CarGenerationProps,
  CarImage,
  CarItem,
  CarMaker,
  CarMakersData,
  CarModelProps,
  ClientWithPhoneNumbers,
  CreateCar,
  CreateCarSchema,
} from "@lib/types";
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { RotateCcw, Trash2 } from "lucide-react";
import Spinner from "@components/Spinner";
import { Textarea } from "@components/ui/textarea";
import { ClientsComboBox } from "@components/clients-combobox";
import { createCarAction, editCarAction } from "@lib/actions/carsAction";
import { GarageFileUploader } from "./garage-files-uploader";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ComboBox } from "@components/combo-box";
import { MakerCombobox } from "@components/maker-combobox";
import { ModelCombobox } from "@components/model-combobox";
import { SUPABASE_URL } from "@lib/constants";
import { createCar, editCar } from "@lib/services/car-services";
import CurrencyInput from "react-currency-input-field";

const CarForm = ({
  useParams,
  carToEdit,
  clientId,

  clients,
  carMakers,
  open,
  handleClose: handleCloseExternal,
}: {
  useParams?: boolean;
  carToEdit?: CarItem;
  clientId?: number;
  carMakers: CarMakersData[];
  clients: ClientWithPhoneNumbers[];
  open?: boolean;
  handleClose?: () => void;
}) => {
  const searchParam = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const edit = searchParam.get("edit") ?? "";
  const carInfo = carToEdit?.carGenerations;
  const [isOpen, setIsOpen] = useState(edit ? true : false);
  const [deletedMedia, setDeletedMedia] = useState<CarImage[]>([]);
  const [carMakerId, setCarMakerId] = useState(
    carInfo?.carModels.carMakerId || 0
  );
  const [carModelId, setCarModelId] = useState(carInfo?.carModelId || 0);
  const { toast } = useToast();

  const mediaUrls = useMemo(() => {
    const deletedIds = deletedMedia.map((del) => del.id);
    const mediaArr = carToEdit
      ? carToEdit.carImages.filter(
          (imageObj) => !deletedIds.includes(imageObj.id)
        )
      : [];
    return mediaArr;
  }, [deletedMedia, carToEdit]);

  const isEditing = edit ? true : false || isOpen;

  const defaultValues = {
    color: carToEdit?.color || "#d9c814",
    plateNumber: carToEdit?.plateNumber || "",
    chassisNumber: carToEdit?.chassisNumber || "",
    motorNumber: carToEdit?.motorNumber || "",
    odometer: carToEdit?.odometer || "",
    notes: carToEdit?.notes || "",
    clientId: clientId || 0,
    carGenerationId: carInfo?.id || 0,
    images: [],
  };
  const form = useForm<CreateCar>({
    resolver: zodResolver(CreateCarSchema),
    defaultValues,
  });

  // checking if the user changet the forms data in order to enable the user to change it. if not we check if they deleted any images as shown below in the (disabled variable).
  const isEqual = useObjectCompare(defaultValues, form.getValues());
  // if the user didn't change the form's data nor did he delete any already uploaded images we want the submit button to be disabled to prevent any unnecessary api calls.
  const disabled = isEqual && !deletedMedia.length;

  const isLoading = form.formState.isSubmitting;

  const models =
    carMakers.find((maker) => maker.id === carMakerId)?.carModels || [];
  const generations =
    models.find((model) => model.id === carModelId)?.carGenerations || [];

  // const models: CarModelProps[] = (
  //   carMakerId && carMakers.length
  //     ? carMakers.find((maker) => maker.id === carMakerId)?.carModels
  //     : []
  // ) as CarModelProps[];

  // const generations =
  //   carModelId && carGenerations.length
  //     ? carGenerations.filter((gen) => gen.carModelId === carModelId)
  //     : [];
  const params = new URLSearchParams(searchParam);
  function handleOpen() {
    setIsOpen(true);
  }

  function handleReset() {
    form.reset(defaultValues);
    setCarMakerId(carInfo?.carModels.carMakerId || 0);
    setCarModelId(carInfo?.carModelId || 0);
    setDeletedMedia([]);
  }

  function handleClose() {
    if (edit) {
      const params = new URLSearchParams(searchParam);
      params.delete("edit");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
    setIsOpen(false);

    if (isLoading) return;
    handleReset();
  }

  function handleDeleteMedia(carImage: CarImage) {
    setDeletedMedia((arr) => [...arr, carImage]);
  }

  async function onSubmit({
    color,
    plateNumber,
    chassisNumber,
    motorNumber,
    odometer,
    clientId,
    carGenerationId,
    notes,
    images,
  }: CreateCar) {
    try {
      const imagesToUpload = images.map((img, i) => {
        const name = `${Math.random()}-${img.name}`.replace(/\//g, "");
        const path = `${SUPABASE_URL}/storage/v1/object/carImages/${name}`;

        return {
          name,
          path,
          isMain: i === 0,
          file: img,
        };
      });
      const car = {
        color,
        plateNumber,
        motorNumber,
        odometer,
        clientId,
        carGenerationId,
        notes,
        chassisNumber,
      };

      if (carToEdit) {
        await editCar({
          car,
          imagesToDelete: deletedMedia,
          imagesToUpload,
          isEqual,
          id: carToEdit.id.toString(),
        });
      } else {
        await createCar({
          car,
          images: imagesToUpload,
        });

        // queryClient.invalidateQueries({ queryKey: ["carCount"] });
      }
      handleClose();

      toast({
        className: "bg-primary  text-primary-foreground",
        title: carToEdit ? "Data updated." : "A new car has been created",
        description: (
          <SuccessToastDescription
            message={
              carToEdit
                ? "Car's data has been edited successfuly"
                : "A new client has been created."
            }
          />
        ),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Faild to create a new car.",
        description: <ErorrToastDescription error={error.message} />,
      });
    }
  }
  return (
    <DialogComponent open={isEditing} onOpenChange={handleClose}>
      {open === undefined && (
        <Button onClick={handleOpen} size="sm" className=" w-full">
          {carToEdit ? "Edit car" : " Create car"}
        </Button>
      )}

      <DialogComponent.Content className="   max-h-[76vh]  overflow-y-auto max-w-[1000px] sm:p-14">
        <DialogComponent.Header>
          <DialogComponent.Title>
            {" "}
            {carToEdit ? "Update car's data" : " Create a new car"}r
          </DialogComponent.Title>
          {/* <DialogComponent.Description>
            Create a new car.
          </DialogComponent.Description> */}
        </DialogComponent.Header>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 ">
            <div className=" flex  flex-wrap items-start  justify-between gap-x-2  gap-y-6">
              <FormItem className="w-[48.5%] sm:w-[32%]  mb-auto">
                <FormLabel>Car maker</FormLabel>
                <FormControl>
                  <MakerCombobox
                    disabled={isLoading}
                    value={carMakerId}
                    setValue={(value) => {
                      setCarMakerId(value);
                      setCarModelId(0);
                      form.setValue("carGenerationId", 0);
                    }}
                    options={carMakers}
                  />
                </FormControl>
                <FormDescription>Enter car maker.</FormDescription>
                <FormMessage />
              </FormItem>

              <FormItem className=" w-[48.5%] sm:w-[32%] mb-auto">
                <FormLabel>Car model</FormLabel>
                <FormControl>
                  <ModelCombobox
                    disabled={isLoading || !carMakerId}
                    value={carModelId}
                    setValue={(value) => {
                      setCarModelId(value);
                      form.setValue("carGenerationId", 0);
                    }}
                    options={models}
                  />
                </FormControl>
                <FormDescription>Enter car model.</FormDescription>
                <FormMessage />
              </FormItem>

              <FormField
                disabled={isLoading}
                control={form.control}
                name="carGenerationId"
                render={({ field }) => (
                  <FormItem className=" w-full sm:w-[32%] mb-auto">
                    <FormLabel>Car generation</FormLabel>
                    <FormControl>
                      <ComboBox
                        disabled={isLoading || !carModelId}
                        options={generations}
                        setValue={field.onChange}
                        value={field.value}
                      />
                    </FormControl>
                    <FormDescription>Enter car generation.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className=" flex flex-col xs:flex-row  gap-2 gap-y-6">
              <FormField
                disabled={isLoading}
                control={form.control}
                name="odometer"
                render={({ field }) => (
                  <FormItem className=" w-full mb-auto">
                    <FormLabel>Odometer</FormLabel>
                    <FormControl>
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

                          field.onChange(formattedValue);
                        }}
                        className="input-field "
                      />
                    </FormControl>
                    <FormDescription>
                      Enter car&apos;s odometer reading.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                disabled={isLoading}
                control={form.control}
                name="plateNumber"
                render={({ field }) => (
                  <FormItem className=" w-full mb-auto">
                    <FormLabel>Plate number</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        disabled={isLoading}
                        placeholder="Plate number..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter car&apos;s plate number.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className=" flex flex-col xs:flex-row  gap-2 gap-y-6">
              <FormField
                disabled={isLoading}
                control={form.control}
                name="motorNumber"
                render={({ field }) => (
                  <FormItem className=" w-full mb-auto">
                    <FormLabel htmlFor="motor">Motor number</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        disabled={isLoading}
                        placeholder="Motor number..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Enter car&apos;s motor.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isLoading}
                control={form.control}
                name="chassisNumber"
                render={({ field }) => (
                  <FormItem className=" w-full mb-auto">
                    <FormLabel>Chassis number</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        disabled={isLoading}
                        placeholder="Chassis..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter car&apos;s chassis number.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className=" flex flex-col xs:flex-row   gap-2  gap-y-6">
              {!carToEdit && (
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem className=" w-full mb-auto">
                      <FormLabel>Client</FormLabel>
                      <FormControl>
                        <ClientsComboBox
                          disabled={isLoading}
                          value={field.value}
                          setValue={field.onChange}
                          options={clients}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter which client does this car belongs to.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                disabled={isLoading}
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem className=" w-full  mb-auto">
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <input
                        type="color"
                        disabled={isLoading}
                        placeholder="Car color"
                        {...field}
                        className="  w-full h-9 rounded-md border"
                      />
                    </FormControl>

                    <FormDescription>Enter car&apos;s color.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              disabled={isLoading}
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className=" w-full mb-auto">
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isLoading}
                      placeholder="Car information..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter car&apos;s information.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              disabled={isLoading}
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem className=" w-full mb-auto">
                  <FormLabel>Car information</FormLabel>
                  <FormControl>
                    <GarageFileUploader
                      selectedFiles={field.value}
                      handleDeleteMedia={handleDeleteMedia}
                      fieldChange={field.onChange}
                      mediaUrl={mediaUrls}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription className=" flex justify-between">
                    <span> Enter car&apos;s information.</span>{" "}
                    <div className=" flex items-center gap-2">
                      <span className=" text-xs">
                        Images: {field.value.length + mediaUrls?.length}
                      </span>
                      <Button
                        disabled={
                          (!field.value.length && !mediaUrls.length) ||
                          isLoading
                        }
                        onClick={() => {
                          field.onChange([]);

                          if (carToEdit) setDeletedMedia(carToEdit.carImages);
                        }}
                        type="button"
                        variant="destructive"
                        className=" p-0 w-6 h-6"
                      >
                        {" "}
                        <Trash2 className=" w-4 h-4 shrink-0" />
                      </Button>
                    </div>
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className=" relative flex flex-col-reverse sm:flex-row items-center justify-end  gap-3">
              <Button
                onClick={handleReset}
                type="button"
                className=" p-0 h-6 w-6  hidden sm:flex  absolute left-5 bottom-0"
                variant="outline"
              >
                <RotateCcw className=" w-4 h-4" />
              </Button>
              <Button
                onClick={handleClose}
                disabled={isLoading}
                type="reset"
                variant="secondary"
                size="sm"
                className=" w-full sm:w-[unset]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={disabled || isLoading}
                className=" w-full sm:w-[unset]"
              >
                {isLoading ? (
                  <Spinner className=" h-full" />
                ) : carToEdit ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogComponent.Content>
    </DialogComponent>
  );
};

export default CarForm;
