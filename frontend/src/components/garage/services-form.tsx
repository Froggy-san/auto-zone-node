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
  CarItem,
  Category,
  CreateService,
  CreateServiceSchema,
  PhoneNumber,
  Product,
  ProductWithCategory,
  ServiceStatus,
} from "@lib/types";
import React, { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { RotateCcw } from "lucide-react";
import Spinner from "@components/Spinner";
import { Textarea } from "@components/ui/textarea";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ServiceStatusCombobox } from "@components/service-status-combobox";

import { motion } from "framer-motion";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Label } from "@components/ui/label";
import { cn } from "@lib/utils";
import { ComboBox } from "@components/combo-box";
import { ProductsComboBox } from "@components/proudcts-combo-box";
import { createServiceAction } from "@lib/actions/serviceActions";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Alert from "@components/alert";
import { isNull } from "lodash";
import { formatCurrency } from "@lib/client-helpers";

interface Client {
  name: string;
  email: string;
  id: number | undefined;
  phones: PhoneNumber[];
}
const ServicesForm = ({
  useParams,
  carToEdit,
  categories,
  products,
  car,
  client,
  serviceStatus,
  open,
  handleClose: handleCloseExternal,
}: {
  useParams?: boolean;
  carToEdit?: CarItem;
  car?: CarItem;
  client?: Client;
  categories: Category[];
  products: ProductWithCategory[];
  serviceStatus: ServiceStatus[];
  open?: boolean;
  handleClose?: () => void;
}) => {
  const searchParam = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const serivceParam = searchParam.get("service");
  const [isOpen, setIsOpen] = useState(!isNull(serivceParam) ? true : false);
  const [currTab, setCurrTab] = useState("item-1");
  const { toast } = useToast();

  const defaultValues = {
    clientId: (client && client.id) || 0,
    carId: (car && car.id) || 0,
    serviceStatusId: 0,
    note: "",
    productsToSell: [],
    serviceFees: [{ price: 0, discount: 0, categoryId: 0, notes: "" }],
  };
  const form = useForm<CreateService>({
    mode: "onChange",
    resolver: zodResolver(CreateServiceSchema),
    defaultValues,
  });

  const serviceFees = useWatch({
    control: form.control,
    name: "serviceFees",
  });

  const productsToSell = useWatch({
    control: form.control,
    name: "productsToSell",
  });

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
    { rules: { minLength: 1 }, name: "serviceFees", control: form.control }
  );
  const {
    fields: productsToSellFields,
    append: appendProduct,
    remove: removeProduct,
  } = useFieldArray({ name: "productsToSell", control: form.control });

  const errors = form.formState.errors;
  // checking if the user changet the forms data in order to enable the user to change it. if not we check if they deleted any images as shown below in the (disabled variable).
  const isEqual = useObjectCompare(defaultValues, form.getValues());
  // if the user didn't change the form's data nor did he delete any already uploaded images we want the submit button to be disabled to prevent any unnecessary api calls.

  const checkIfErrors =
    errors.serviceStatusId ||
    errors.serviceFees?.length ||
    errors.productsToSell?.length
      ? true
      : false;
  const disabled = isEqual || checkIfErrors;

  const isLoading = form.formState.isSubmitting;

  const totalFees = serviceFees.reduce(
    (acc, curr) => {
      acc.totalPrice += curr.price;
      acc.totalDiscount += curr.discount;

      return acc;
    },
    {
      totalPrice: 0,
      totalDiscount: 0,
    }
  );

  const totalProductSoldAmounts = productsToSell.reduce(
    (acc, curr) => {
      acc.totalPrice += curr.pricePerUnit * curr.count;
      acc.totalDiscount += curr.discount * curr.count;
      acc.totalCount += curr.count;
      return acc;
    },
    { totalPrice: 0, totalDiscount: 0, totalCount: 0 }
  );

  const params = new URLSearchParams(searchParam);

  useEffect(() => {
    serviceFees.forEach((item, index) => {
      if (item.price > item.discount) {
        form.clearErrors(`serviceFees.${index}.discount`);
      }
    });
  }, [serviceFees, form]);

  useEffect(() => {
    productsToSell.forEach((item, index) => {
      if (item.pricePerUnit * item.count - item.discount > 0) {
        form.clearErrors(`productsToSell.${index}.discount`);
      }
    });
  }, [productsToSell, form]);

  function handleOpen(filter: string) {
    if (!isNull(serivceParam)) {
      params.set("edit", filter);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    } else {
      setIsOpen(true);
    }
  }

  function handleClose() {
    if (!isNull(serivceParam)) {
      const params = new URLSearchParams(searchParam);
      params.delete("service");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
    setIsOpen(false);

    if (isLoading) return;
    setCurrTab("item-1");
    form.reset(defaultValues);
  }

  async function onSubmit(data: CreateService) {
    const totalFeesAfterDis = totalFees.totalPrice - totalFees.totalDiscount;
    const totalSoldAfterDis =
      totalProductSoldAmounts.totalPrice -
      totalProductSoldAmounts.totalDiscount;
    const totalPrice = totalFeesAfterDis + totalSoldAfterDis;
    try {
      const soldQuantities: Map<number, number> = new Map();

      if (data.productsToSell.length) {
        data.productsToSell.forEach((pro) => {
          const currentSold = soldQuantities.get(pro.productId) || 0;
          soldQuantities.set(pro.productId, currentSold + pro.count);
        });
      }

      const stocksUpdates: Product[] = [];
      // Calculate the new stock for each unique product
      for (const [productId, totalSoldCount] of soldQuantities.entries()) {
        const currentProduct = products.find((prod) => prod.id === productId);

        if (!currentProduct) {
          // Handle cases where product is not found (e.g., log error, skip, or throw)
          console.warn(
            `Product with ID ${productId} not found. Skipping stock update.`
          );
          continue;
        }

        const initialStock = currentProduct.stock;
        const newStock = initialStock - totalSoldCount;

        // Ensure stock doesn't go negative if that's a business rule
        const { categories, productImages, ...rest } = currentProduct;
        const product = rest as Product;
        if (newStock < 0) {
          console.warn(
            `Stock for product ${productId} would go negative (${newStock}). Adjusting to 0.`
          );
          stocksUpdates.push({ ...product, stock: 0 });
        } else {
          stocksUpdates.push({ ...product, stock: newStock });
        }
      }

      const { error } = await createServiceAction(
        { ...data, totalPrice },
        stocksUpdates
      );
      if (error) throw new Error(error);
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
      handleClose();
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Faild to create a new car.",
        description: <ErorrToastDescription error={error.message} />,
      });
    }
  }
  return (
    <DialogComponent open={isOpen} onOpenChange={handleClose}>
      {open === undefined && (
        <Button
          onClick={() => handleOpen("open")}
          variant="orange"
          size="sm"
          className=" w-full bg-dashboard-orange hover:bg-dashboard-orange/50 text-dashboard-text-orange"
        >
          {carToEdit ? "Edit car" : "Issue service"}
        </Button>
      )}

      <DialogComponent.Content className="   max-h-[76vh]    overflow-y-auto max-w-[1000px]  sm:px-12">
        <DialogComponent.Header>
          <DialogComponent.Title className=" text-2xl">
            Service
          </DialogComponent.Title>
          <DialogComponent.Description>
            You are initiating a service for &lsquo;{client?.name || ""}&lsquo;
            on the vehicle with plate number &lsquo;{car?.plateNumber || ""}
            &lsquo;.
          </DialogComponent.Description>
        </DialogComponent.Header>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 ">
            <Accordion
              type="single"
              collapsible
              className="w-full "
              // defaultValue="item-1"
              value={currTab}
              onValueChange={(value) => setCurrTab(value)}
            >
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-xl sm:text-2xl font-semibold">
                  Service detials
                </AccordionTrigger>
                {errors.serviceStatusId && currTab !== "item-1" && (
                  <Alert className=" mb-4">Attention needed!</Alert>
                )}
                <AccordionContent className=" px-1 space-y-4">
                  <div className=" flex flex-col sm:flex-row  gap-2   space-y-4 sm:space-y-0">
                    <FormItem className=" w-full  mb-auto">
                      <Label>Client</Label>
                      <FormControl>
                        <Input
                          type="text"
                          disabled
                          placeholder="Client's data"
                          value={`Name: ${client?.name}`}
                          className=" flex-1
                          "
                          // {...field}
                        />
                      </FormControl>

                      <FormDescription>
                        Enter which client the service was provided to.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>

                    <FormItem className=" w-full mb-auto">
                      <FormLabel>Car</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          disabled
                          placeholder="Car "
                          value={`Plate number: ${car?.plateNumber}`}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the car this service was provided to.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>

                    <FormField
                      disabled={isLoading}
                      control={form.control}
                      name="serviceStatusId"
                      render={({ field }) => (
                        <FormItem className=" w-full mb-auto">
                          <FormLabel>Service status</FormLabel>
                          <FormControl>
                            <ServiceStatusCombobox
                              setValue={field.onChange}
                              value={field.value}
                              options={serviceStatus}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter service status.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem className=" w-full mb-auto">
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            disabled={isLoading}
                            placeholder="Additional details..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter any additional details about the service.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="  text-xl sm:text-2xl font-semibold">
                  Add service fees
                </AccordionTrigger>
                {errors.serviceFees?.length && currTab !== "item-2" && (
                  <Alert className=" mb-4">Attention needed!</Alert>
                )}
                <AccordionContent className=" px-1  space-y-5">
                  {/* Service fees starts */}
                  <div className=" py-10 space-y-8">
                    {/* <h2 className=" font-semibold text-3xl">Service fees</h2> */}
                    {/* <div className="   flex  items-center py-2  justify-between">
                      <h2 className=" font-semibold text-2xl xs:text-3xl">
                        Service fees
                      </h2>
                      <Button
                        size="sm"
                        variant="orange"
                        type="button"
                        className=" text-xs"
                        onClick={() =>
                          append({
                            price: 0,
                            discount: 0,
                            categoryId: 0,
                            notes: "",
                          })
                        }
                      >
                        ADD A FEE
                      </Button>
                    </div> */}

                    <ul className=" space-y-10">
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
                          className=" space-y-6"
                        >
                          <h2>{i + 1}.</h2>
                          <div
                            className={cn("space-y-4  relative ", {
                              " border p-3 rounded-xl ": i !== 0,
                            })}
                          >
                            {i !== 0 && (
                              <button
                                onClick={() => {
                                  remove(i);
                                }}
                                className="  absolute  top-5 right-5 rounded-sm outline-none    opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground  "
                                type="button"
                              >
                                <Cross2Icon className="h-4 w-4" />
                              </button>
                            )}
                            <div className=" flex  flex-col gap-2  sm:flex-row  ">
                              <FormField
                                disabled={isLoading}
                                control={form.control}
                                name={`serviceFees.${i}.price`}
                                render={({ field }) => (
                                  <FormItem className="  w-full mb-auto ">
                                    <FormLabel>Price</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="text"
                                        disabled={isLoading}
                                        value={field.value}
                                        onChange={(e) => {
                                          const inputValue = e.target.value;
                                          if (/^\d*$/.test(inputValue)) {
                                            field.onChange(Number(inputValue));
                                          }
                                        }}
                                        placeholder="Service price..."
                                        // {...field}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Enter service fee price.
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                disabled={isLoading}
                                control={form.control}
                                name={`serviceFees.${i}.discount`}
                                render={({ field }) => (
                                  <FormItem className="  w-full mb-auto">
                                    <FormLabel>Discount</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="text"
                                        disabled={isLoading}
                                        value={field.value}
                                        onChange={(e) => {
                                          const inputValue = e.target.value;
                                          if (/^\d*$/.test(inputValue)) {
                                            field.onChange(Number(inputValue));
                                          }
                                        }}
                                        placeholder="Service discount..."
                                        // {...field}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Enter the service fee discount.
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                disabled={isLoading}
                                control={form.control}
                                name={`serviceFees.${i}.categoryId`}
                                render={({ field }) => (
                                  <FormItem className=" w-full  mb-auto">
                                    <FormLabel>Category</FormLabel>
                                    <FormControl>
                                      <ComboBox
                                        setValue={field.onChange}
                                        value={field.value}
                                        options={categories}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Chose the relievant category to the
                                      service fee provided.
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              disabled={isLoading}
                              control={form.control}
                              name={`serviceFees.${i}.notes`}
                              render={({ field }) => (
                                <FormItem className=" w-full mb-auto">
                                  <FormLabel>Notes</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      disabled={isLoading}
                                      placeholder="Additional details..."
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Enter any additional details about the
                                    service fee.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className=" text-sm text-muted-foreground">
                              Total:{" "}
                              {formatCurrency(
                                serviceFees[i]?.price - serviceFees[i]?.discount
                              )}
                            </div>
                          </div>
                        </motion.li>
                      ))}
                      {serviceFees.length && (
                        <Button
                          size="sm"
                          variant="orange"
                          type="button"
                          className="  w-full"
                          onClick={() =>
                            append({
                              price: 0,
                              discount: 0,
                              categoryId: 0,
                              notes: "",
                            })
                          }
                        >
                          ADD A FEE
                        </Button>
                      )}

                      <div className="w-[280px]">
                        <h3 className=" text-sm">Total:</h3>
                        <div className=" py-2  border-b border-t space-y-2 text-xs text-muted-foreground">
                          <div>
                            Total fees:{" "}
                            <span className=" relative after:content-['fees'] after:absolute after:-right-7 after:-top-1 after:text-orange-400 dark:after:text-dashboard-orange ">
                              {formatCurrency(totalFees.totalPrice)}
                            </span>
                          </div>
                          <div>
                            Total fees discount:{" "}
                            {formatCurrency(totalFees.totalDiscount)}
                          </div>
                          <div className=" border-t pt-1">
                            Net:{" "}
                            {formatCurrency(
                              totalFees.totalPrice - totalFees.totalDiscount
                            )}
                          </div>
                        </div>
                      </div>
                    </ul>
                  </div>
                  {/* Service fees ends */}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="  text-xl sm:text-2xl font-semibold">
                  Add product sold
                </AccordionTrigger>
                {errors.productsToSell?.length && currTab !== "item-3" && (
                  <Alert className=" mb-4">Attention needed!</Alert>
                )}
                <AccordionContent className=" px-1 space-y-5">
                  {/* products to sell starts */}
                  <div className=" py-10 space-y-8">
                    <ul className=" space-y-10">
                      {productsToSellFields.map((item, i) => {
                        const maxAmount =
                          products.find(
                            (product) =>
                              product.id === productsToSell[i]?.productId
                          )?.stock || 0;

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
                            className=" space-y-6"
                          >
                            <h2>{i + 1}.</h2>
                            <div
                              className={cn(
                                "space-y-4 border p-3 rounded-xl  relative "
                              )}
                            >
                              <button
                                onClick={() => {
                                  removeProduct(i);
                                }}
                                className="  absolute  top-5 right-5 rounded-sm outline-none    opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground  "
                                type="button"
                              >
                                <Cross2Icon className="h-4 w-4" />
                              </button>
                              <FormField
                                disabled={isLoading}
                                control={form.control}
                                name={`productsToSell.${i}.productId`}
                                render={({ field }) => (
                                  <FormItem className=" w-full mb-auto">
                                    <FormLabel>Product</FormLabel>
                                    <FormControl>
                                      <ProductsComboBox
                                        productToSell={productsToSell}
                                        setValue={(value) => {
                                          field.onChange(value);
                                          if (value) {
                                            const product = products.find(
                                              (product) => product.id === value
                                            );
                                            if (product) {
                                              form.setValue(
                                                `productsToSell.${i}.pricePerUnit`,
                                                product.salePrice
                                              );

                                              form.setValue(
                                                `productsToSell.${i}.discount`,
                                                product.listPrice -
                                                  product.salePrice
                                              );
                                            }
                                          }
                                        }}
                                        value={field.value}
                                        options={products}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Enter which product you are selling.
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className=" flex  flex-col gap-2  sm:flex-row  ">
                                <FormField
                                  disabled={isLoading}
                                  control={form.control}
                                  name={`productsToSell.${i}.pricePerUnit`}
                                  render={({ field }) => (
                                    <FormItem className="  w-full mb-auto ">
                                      <FormLabel>Price per unit</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="text"
                                          disabled={isLoading}
                                          value={field.value}
                                          onChange={(e) => {
                                            const inputValue = e.target.value;
                                            if (/^\d*$/.test(inputValue)) {
                                              field.onChange(
                                                Number(inputValue)
                                              );
                                            }
                                          }}
                                          placeholder="Price per unit..."
                                        />
                                      </FormControl>
                                      <FormDescription>
                                        Enter the cost of each unit.
                                      </FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  disabled={isLoading}
                                  control={form.control}
                                  name={`productsToSell.${i}.discount`}
                                  render={({ field }) => (
                                    <FormItem className="  w-full mb-auto">
                                      <FormLabel>Discount per unit</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="text"
                                          disabled={isLoading}
                                          value={field.value}
                                          onChange={(e) => {
                                            const inputValue = e.target.value;
                                            if (/^\d*$/.test(inputValue)) {
                                              field.onChange(
                                                Number(inputValue)
                                              );
                                            }
                                          }}
                                          placeholder="Discount per unit..."
                                          // {...field}
                                        />
                                      </FormControl>
                                      <FormDescription>
                                        Enter the discount per unit.
                                      </FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  disabled={isLoading}
                                  control={form.control}
                                  name={`productsToSell.${i}.count`}
                                  render={({ field }) => (
                                    <FormItem className=" w-full  mb-auto">
                                      <FormLabel>Count</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="text"
                                          disabled={isLoading}
                                          value={field.value}
                                          onChange={(e) => {
                                            const inputValue = e.target.value;
                                            if (!/^\d*$/.test(inputValue))
                                              return;

                                            if (
                                              Number(inputValue) > maxAmount
                                            ) {
                                              toast({
                                                variant: "destructive",
                                                title: "Maximum amount.",
                                                description: (
                                                  <ErorrToastDescription
                                                    error={`Count number must be lower than ${maxAmount}`}
                                                  />
                                                ),
                                              });
                                            } else {
                                              field.onChange(
                                                Number(inputValue)
                                              );
                                            }
                                          }}
                                          placeholder="Units to be sold..."
                                          // {...field}
                                        />
                                      </FormControl>
                                      <FormDescription>
                                        Enter the amount of units sold.
                                      </FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <FormField
                                disabled={isLoading}
                                control={form.control}
                                name={`productsToSell.${i}.note`}
                                render={({ field }) => (
                                  <FormItem className=" w-full mb-auto">
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        disabled={isLoading}
                                        placeholder="Additional details..."
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

                              <div className=" text-sm text-muted-foreground">
                                Total amount spent:
                                <span className=" ml-3">
                                  {formatCurrency(
                                    (productsToSell[i]?.pricePerUnit -
                                      productsToSell[i]?.discount) *
                                      productsToSell[i]?.count
                                  )}
                                </span>
                              </div>
                            </div>
                          </motion.li>
                        );
                      })}

                      <Button
                        size="sm"
                        variant="secondary"
                        type="button"
                        className="  w-full"
                        onClick={() =>
                          appendProduct({
                            pricePerUnit: 0,
                            discount: 0,
                            count: 0,
                            productId: 0,
                            note: "",
                          })
                        }
                      >
                        ADD PRODUCT SOLD
                      </Button>

                      <div className="w-[280px]">
                        <h3 className=" text-sm">Total:</h3>
                        <div className=" py-2  border-b border-t space-y-2 text-xs text-muted-foreground">
                          <div>
                            Amount:{" "}
                            <span className=" relative after:content-['units'] after:absolute after:-right-8 after:-top-1 after:text-indigo-800 dark:after:text-dashboard-indigo ">
                              {totalProductSoldAmounts.totalCount}
                            </span>
                          </div>
                          <div>
                            Total revenue:{" "}
                            {formatCurrency(totalProductSoldAmounts.totalPrice)}
                          </div>
                          <div>
                            Total discount:{" "}
                            {formatCurrency(
                              totalProductSoldAmounts.totalDiscount
                            )}
                          </div>
                          <div className=" border-t pt-1">
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
                  {/* products to sell ends */}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className=" text-xl sm:text-2xl font-semibold">
                  Summary
                </AccordionTrigger>
                <AccordionContent>
                  <div className="max-w-[500px] mx-auto">
                    <h3 className=" text-sm">Total:</h3>
                    <div className=" py-2   border-t space-y-2 text-xs text-muted-foreground">
                      <div className=" flex  flex-col xs:flex-row  gap-5 xs:items-center  justify-between">
                        <div className=" space-y-2  ">
                          <div>
                            Products amount:{" "}
                            <span className=" relative after:content-['units'] after:absolute after:-right-8 after:-top-1 after:text-indigo-800 dark:after:text-dashboard-indigo ">
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
                          <div className="  py-2 border-y w-fit text-xs">
                            Net products sold:{" "}
                            <span className="text-indigo-800 dark:text-dashboard-indigo">
                              {" "}
                              {formatCurrency(
                                totalProductSoldAmounts.totalPrice -
                                  totalProductSoldAmounts.totalDiscount
                              )}
                            </span>
                          </div>
                        </div>
                        <div className=" space-y-2">
                          <div>
                            Fees amount:{" "}
                            <span className=" relative after:content-['fees'] after:absolute after:-right-7 after:-top-1 text-orange-400 dark:after:text-dashboard-orange ">
                              {serviceFees.length}
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
                          <div className="  py-2 border-y  w-fit">
                            Net fees:{" "}
                            <span className=" text-orange-400 dark:text-dashboard-orange text-xs">
                              {" "}
                              {formatCurrency(
                                totalFees.totalPrice - totalFees.totalDiscount
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className=" border-t pt-1">
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
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            {/* <div className="max-w-[500px] mx-auto">
              <h3 className=" text-sm">Total:</h3>
              <div className=" py-2   border-t space-y-2 text-xs text-muted-foreground">
                <div className=" flex  flex-col xs:flex-row  gap-5 xs:items-center  justify-between">
                  <div className=" space-y-2  ">
                    <div>
                      Products amount:{" "}
                      <span className=" relative after:content-['units'] after:absolute after:-right-8 after:-top-1 after:text-dashboard-indigo ">
                        {productsToSell.length}
                      </span>
                    </div>
                    <div>
                      Total products revenue:{" "}
                      {formatCurrency(totalProductSoldAmounts.totalPrice)}
                    </div>
                    <div>
                      Total product discount:{" "}
                      {formatCurrency(totalProductSoldAmounts.totalDiscount)}
                    </div>
                    <div className="  py-2 border-y w-fit text-xs">
                      Products sold net:{" "}
                      <span className=" text-dashboard-indigo">
                        {" "}
                        {formatCurrency(
                          totalProductSoldAmounts.totalPrice -
                            totalProductSoldAmounts.totalDiscount
                        )}
                      </span>
                    </div>
                  </div>
                  <div className=" space-y-2">
                    <div>
                      Fees amount:{" "}
                      <span className=" relative after:content-['fees'] after:absolute after:-right-7 after:-top-1 after:text-dashboard-orange ">
                        {serviceFees.length}
                      </span>
                    </div>
                    <div>
                      Total fees revenue: {formatCurrency(totalFees.totalPrice)}
                    </div>
                    <div>
                      Total fees discount:{" "}
                      {formatCurrency(totalFees.totalDiscount)}
                    </div>
                    <div className="  py-2 border-y  w-fit">
                      Net fees:{" "}
                      <span className=" text-dashboard-orange text-xs">
                        {" "}
                        {formatCurrency(
                          totalFees.totalPrice - totalFees.totalDiscount
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className=" border-t pt-1">
                  <div>
                    {" "}
                    Total Revenue:{" "}
                    {formatCurrency(
                      totalFees.totalPrice + totalProductSoldAmounts.totalPrice
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
            </div> */}
            <div className=" relative flex flex-col-reverse sm:flex-row items-center justify-end  gap-3">
              <Button
                onClick={() => form.reset()}
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
                  "Edit"
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

export default ServicesForm;

// const stocksUpdates: { id: number; stock: number }[] = [];

//     if (data.productsToSell.length) {
//       data.productsToSell.forEach((pro, i) => {
//         const currStock =
//           products.find((prod) => prod.id === pro.productId)?.stock || 0;

//         stocksUpdates.push({
//           id: pro.productId,
//           stock: currStock - pro.count,
//         });
//       });
//     }

//     const newStocks = stocksUpdates.reduce(
//       (acc: { id: number; stock: number }[], curr) => {
//         const similarItemValue = stocksUpdates
//           .filter((item) => item.id === curr.id)
//           .reduce(
//             (previousValue, currItem) => {
//               previousValue.id = currItem.id;
//               previousValue.stock += previousValue.stock + currItem.stock;
//               return previousValue;
//             },
//             { id: 0, stock: 0 }
//           );

//         return [...acc, similarItemValue];
//       },
//       []
//     );
