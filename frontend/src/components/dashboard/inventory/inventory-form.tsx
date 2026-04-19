"use client";
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  ClientWithPhoneNumbers,
  CreateProductBought,
  CreateProductBoughtSchema,
  ProductBought,
  ProductWithCategory,
  RestockingBill,
} from "@lib/types";
import { motion } from "framer-motion";

import Spinner from "@components/Spinner";
import { useToast } from "@hooks/use-toast";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";

import useObjectCompare from "@hooks/use-compare-objs";
import { Cross2Icon } from "@radix-ui/react-icons";
import { RotateCcw } from "lucide-react";
import {
  createProductBoughtBulkAction,
  editProductBoughtAction,
} from "@lib/actions/productBoughtActions";
import { ProductsComboBox } from "@components/proudcts-combo-box";
import { RestockingComboBox } from "@components/restocking-combo-box";
import { Textarea } from "@components/ui/textarea";
import DialogComponent from "@components/dialog-component";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Switch } from "@components/ui/switch";

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en", { style: "currency", currency: "egp" }).format(
    value
  );

const InventoryForm = ({
  reStockingBillId,
  products,
  restockings,
  open,
  handleClose: handleCloseExternal,
  proBoughtToEdit,
}: {
  reStockingBillId?: string;
  proBoughtToEdit?: ProductBought;
  products: ProductWithCategory[];
  restockings: RestockingBill[];
  open?: boolean;
  handleClose?: () => void;
  client?: ClientWithPhoneNumbers;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isReturned, setIsReturned] = useState<boolean>(
    proBoughtToEdit?.isReturned ? proBoughtToEdit.isReturned : false
  );

  const { toast } = useToast();
  const searchParam = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const isItOpen = open ? true : isOpen;

  const editProBught = {
    pricePerUnit: proBoughtToEdit?.pricePerUnit,
    discount: proBoughtToEdit?.discount,
    count: proBoughtToEdit?.count,
    note: proBoughtToEdit?.note,
    productId: proBoughtToEdit?.productId,
    productsRestockingBillId: "",
  };

  const defaultValues = {
    productBought: proBoughtToEdit ? [editProBught] : [],
    shopName: proBoughtToEdit || reStockingBillId ? "just a random string" : "",
  };

  const form = useForm<CreateProductBought>({
    mode: "onChange",
    resolver: zodResolver(CreateProductBoughtSchema),
    defaultValues,
  });

  const initialIsReturned = proBoughtToEdit?.isReturned;
  const isEqual = useObjectCompare(form.getValues(), defaultValues);

  const disabled = initialIsReturned === isReturned && isEqual;

  const productBoughtArr = useWatch({
    control: form.control,
    name: "productBought",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "productBought",
  });

  function handleClose() {
    if (open) {
      const params = new URLSearchParams(searchParam);
      params.delete("edit");
      params.delete("reStockingBillId");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    } else {
      handleCloseExternal?.();
      setIsOpen(false);
    }
    if (isLoading) return;
    form.reset(defaultValues);
  }
  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    const body = document.querySelector("body");
    form.reset(defaultValues);
    if (body) {
      body.style.pointerEvents = "auto";
    }
    return () => {
      if (body) body.style.pointerEvents = "auto";
    };
  }, [isItOpen]);

  useEffect(() => {
    productBoughtArr.forEach((item, index) => {
      const totalAmount = item.pricePerUnit * item.count - item.discount;
      if (totalAmount > 0) {
        form.clearErrors(`productBought.${index}.discount`);
      }
    });
  }, [productBoughtArr, form]);

  const total = productBoughtArr.reduce(
    (acc, item) => {
      acc.totalDiscount += item.discount * item.count;
      acc.totalpriceAfter += (item.pricePerUnit - item.discount) * item.count;

      return acc;
    },
    { totalDiscount: 0, totalpriceAfter: 0 }
  );

  async function onSubmit({ productBought, shopName }: CreateProductBought) {
    try {
      const pro = productBought[0];

      if (proBoughtToEdit) {
        const originalTotal =
          proBoughtToEdit.productsRestockingBills?.totalPrice || 0;

        const newTotal =
          originalTotal -
          proBoughtToEdit.totalPriceAfterDiscount +
          total.totalpriceAfter;

        const productStocks =
          products.find((product) => product.id === pro.productId)?.stock || 0;
        const newStockNum = productStocks - proBoughtToEdit.count + pro.count;
        console.log(
          productStocks,
          pro.count,
          proBoughtToEdit.count,
          newStockNum
        );
        const { error } = await editProductBoughtAction(
          {
            pricePerUnit: pro.pricePerUnit,
            discount: pro.discount,
            count: pro.count,
            note: pro.note,
            productsRestockingBillId: proBoughtToEdit.productsRestockingBillId,
            id: proBoughtToEdit.id,
            productId: pro.productId,
            newStockNum,
            isReturned,
          },
          newTotal
        );
        if (error) throw new Error(error);
      } else {
        const totalPrice = total.totalpriceAfter;

        // When ever the shop buys new inventory we want the product stock to increase.
        const stocksToUpdate = productBought.map((pro) => {
          const productStockNum =
            products.find((product) => product.id === pro.productId)?.stock ||
            0;
          const newStockNum = productStockNum + pro.count;
          console.log(productStockNum, newStockNum);
          return { id: pro.productId, stock: newStockNum };
        });

        const { error } = await createProductBoughtBulkAction({
          shopName,
          data: productBought,
          stocksToUpdate,
          reStockingBillId: reStockingBillId ? Number(reStockingBillId) : null,
          totalPrice,
        });
        if (error) throw new Error(error);
      }

      handleClose();

      toast({
        className: "bg-primary  text-primary-foreground",
        title: proBoughtToEdit ? "Data updated" : "Done.",
        description: (
          <SuccessToastDescription
            message={
              proBoughtToEdit
                ? "Inventory receipt has been updated."
                : "A new inventory receipt created."
            }
          />
        ),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: proBoughtToEdit
          ? "Faild to update inventory's data"
          : "Faild to create a new inventory.",
        description: <ErorrToastDescription error={error.message} />,
      });
    }
  }
  return (
    <DialogComponent open={isItOpen} onOpenChange={handleClose}>
      <Button onClick={() => setIsOpen(true)} size="sm" className=" w-full">
        Create client
      </Button>

      <DialogComponent.Content className=" max-h-[70vh]  sm:max-h-[76vh]  overflow-y-auto max-w-[1000px] sm:p-14">
        <DialogComponent.Header>
          <DialogComponent.Title>
            {reStockingBillId
              ? "Add more inventory"
              : proBoughtToEdit
              ? "Edit inventory"
              : "Add inventory"}
          </DialogComponent.Title>
          <DialogComponent.Description>
            {reStockingBillId
              ? "Add more inventory to the same recipt."
              : proBoughtToEdit
              ? `Edit inventory data. `
              : "Make a recipt for all the inventory bought."}
          </DialogComponent.Description>
        </DialogComponent.Header>
        {proBoughtToEdit ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8   "
            >
              <div className=" space-y-4">
                {fields.map((field, i) => (
                  <React.Fragment key={i}>
                    <motion.div
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
                      className=" space-y-4  "
                    >
                      <div className=" flex  flex-col gap-2 sm:flex-row">
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name={`productBought.${i}.productId`}
                          render={({ field }) => (
                            <FormItem className=" flex-1">
                              <FormLabel>Product</FormLabel>
                              <FormControl>
                                <ProductsComboBox
                                  value={field.value}
                                  setValue={field.onChange}
                                  options={products}
                                  disabled={true}
                                />
                              </FormControl>
                              <FormDescription>
                                Enter what product you bought.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name="shopName"
                          render={({ field }) => (
                            <FormItem className=" flex-1">
                              <FormLabel>Shop</FormLabel>
                              <FormControl>
                                {/* <Input
                      type="text"
                      placeholder="Shop name..."
                      {...field}
                    /> */}
                                <RestockingComboBox
                                  value={
                                    proBoughtToEdit.productsRestockingBillId
                                  }
                                  setValue={field.onChange}
                                  options={restockings}
                                  disabled={true}
                                />
                              </FormControl>
                              <FormDescription>
                                Enter shop name.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className=" flex  flex-col gap-2  sm:flex-row  ">
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name={`productBought.${i}.pricePerUnit`}
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
                                      field.onChange(Number(inputValue));
                                    }
                                  }}
                                  placeholder="Additional notes..."
                                  // {...field}
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
                          name={`productBought.${i}.discount`}
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
                                  placeholder="Additional notes..."
                                  // {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Enter the total discount you got.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name={`productBought.${i}.count`}
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
                                    if (/^\d*$/.test(inputValue)) {
                                      field.onChange(Number(inputValue));
                                    }
                                  }}
                                  placeholder="Additional notes..."
                                  // {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Enter the amount you bought.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        disabled={isLoading}
                        control={form.control}
                        name={`productBought.${i}.note`}
                        render={({ field }) => (
                          <FormItem className=" flex-1">
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea placeholder="note..." {...field} />
                            </FormControl>
                            <FormDescription>
                              Enter additional detials.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Returned</FormLabel>
                          <FormDescription>
                            Has this product been returned?
                          </FormDescription>
                        </div>

                        <Switch
                          checked={isReturned}
                          onClick={() => setIsReturned((is) => !is)}
                          aria-readonly
                        />
                      </div>
                      <div>
                        Total amount spent:
                        <span className=" ml-3">
                          {formatCurrency(
                            (productBoughtArr[i]?.pricePerUnit -
                              productBoughtArr[i]?.discount) *
                              productBoughtArr[i]?.count
                          )}
                        </span>
                      </div>
                    </motion.div>
                  </React.Fragment>
                ))}
              </div>

              <div className=" relative flex flex-col-reverse sm:flex-row items-center justify-end  gap-3">
                <Button
                  onClick={() => form.reset()}
                  type="button"
                  className=" p-0 h-6 w-6 hidden sm:flex  absolute left-5 bottom-0"
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
                  disabled={isLoading || disabled}
                  className=" w-full sm:w-[unset]"
                >
                  {isLoading ? <Spinner className=" h-full" /> : "Update"}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8  "
            >
              <div className=" space-y-4">
                <div className=" border  flex  items-center px-4 py-2 rounded-lg justify-between">
                  <span className=" text-muted-foreground text-sm">
                    Add new inventory
                  </span>
                  <Button
                    size="sm"
                    type="button"
                    className=" text-xs"
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
                </div>

                {fields.map((field, i) => (
                  <React.Fragment key={field.id}>
                    <h2>{i + 1}.</h2>
                    <motion.div
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
                      className=" space-y-4  border p-3 rounded-xl relative "
                    >
                      <button
                        onClick={() => {
                          remove(i);
                        }}
                        className="  absolute  top-3 right-4 rounded-sm outline-none opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground  "
                        type="button"
                      >
                        <Cross2Icon className="h-4 w-4" />
                        {/* <span className="sr-only">Close</span> */}
                      </button>

                      <div className=" flex  flex-col gap-2 sm:flex-row">
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name={`productBought.${i}.productId`}
                          render={({ field }) => (
                            <FormItem className=" flex-1">
                              <FormLabel>Product</FormLabel>
                              <FormControl>
                                <ProductsComboBox
                                  value={field.value}
                                  setValue={(value) => {
                                    const proBoughtById = products.find(
                                      (pro) => pro.id === value
                                    );
                                    field.onChange(value);
                                    if (proBoughtById)
                                      form.setValue(
                                        `productBought.${i}.pricePerUnit`,
                                        proBoughtById.salePrice
                                      );
                                  }}
                                  options={products}
                                />
                              </FormControl>
                              <FormDescription>
                                Enter what product you bought.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name="shopName"
                          render={({ field }) => (
                            <FormItem className=" flex-1">
                              <FormLabel>Shop</FormLabel>
                              <FormControl>
                                {reStockingBillId ? (
                                  <RestockingComboBox
                                    value={Number(reStockingBillId)}
                                    setValue={field.onChange}
                                    options={restockings}
                                    disabled={true}
                                  />
                                ) : (
                                  <Input
                                    type="text"
                                    placeholder="Shop name..."
                                    {...field}
                                  />
                                )}
                                {/* <RestockingComboBox
                                value={24}
                                setValue={field.onChange}
                                options={restockings}
                                disabled={true}
                              /> */}
                              </FormControl>
                              <FormDescription>
                                Enter shop name.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className=" flex  flex-col gap-2  sm:flex-row  ">
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name={`productBought.${i}.pricePerUnit`}
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
                                      field.onChange(Number(inputValue));
                                    }
                                  }}
                                  placeholder="Additional notes..."
                                  // {...field}
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
                          name={`productBought.${i}.discount`}
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
                                  placeholder="Additional notes..."
                                  // {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Enter the total discount you got.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          disabled={isLoading}
                          control={form.control}
                          name={`productBought.${i}.count`}
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
                                    if (/^\d*$/.test(inputValue)) {
                                      field.onChange(Number(inputValue));
                                    }
                                  }}
                                  placeholder="Additional notes..."
                                  // {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Enter the amount you bought.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        disabled={isLoading}
                        control={form.control}
                        name={`productBought.${i}.note`}
                        render={({ field }) => (
                          <FormItem className=" flex-1">
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea placeholder="note..." {...field} />
                            </FormControl>
                            <FormDescription>
                              Enter additional detials.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div>
                        Total amount spent:
                        <span className=" ml-3">
                          {formatCurrency(
                            (productBoughtArr[i]?.pricePerUnit -
                              productBoughtArr[i]?.discount) *
                              productBoughtArr[i]?.count
                          )}
                        </span>
                      </div>
                    </motion.div>
                  </React.Fragment>
                ))}
              </div>

              {form.getValues().productBought.length ? (
                <>
                  <div className=" flex items-center flex-wrap flex-col sm:flex-row gap-x-4">
                    <div>
                      Bulk price after discount:{" "}
                      <span className=" text-xs text-muted-foreground">
                        {formatCurrency(total.totalpriceAfter)}
                      </span>
                    </div>

                    <div>
                      Bulk discount:{" "}
                      <span className=" text-xs text-muted-foreground">
                        {formatCurrency(total.totalDiscount)}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    type="button"
                    className=" text-xs w-full"
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
              ) : null}

              <div className=" relative flex flex-col-reverse sm:flex-row items-center justify-end  gap-3">
                <Button
                  onClick={() => form.reset()}
                  type="button"
                  className=" p-0 h-6 w-6 hidden sm:flex  absolute left-5 bottom-0"
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
                  disabled={isLoading || isEqual}
                  className=" w-full sm:w-[unset]"
                >
                  {isLoading ? (
                    <Spinner className=" h-full" />
                  ) : reStockingBillId ? (
                    "Add"
                  ) : (
                    "Create"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogComponent.Content>
    </DialogComponent>
  );
};

export default InventoryForm;
