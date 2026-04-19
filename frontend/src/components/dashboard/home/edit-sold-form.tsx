"use client";
import React, { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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

import {
  Product,
  ProductSold,
  ProductSoldSchema,
  ProductToSell,
  ProductWithCategory,
} from "@lib/types";

import Spinner from "@components/Spinner";

import { useToast } from "@hooks/use-toast";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";

import useObjectCompare from "@hooks/use-compare-objs";
import DialogComponent from "@components/dialog-component";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Switch } from "@components/ui/switch";
import { Label } from "@components/ui/label";
import {
  createProductToSellAction,
  editProductToSellAction,
} from "@lib/actions/product-sold-actions";
import { ProductsComboBox } from "@components/proudcts-combo-box";
import { formatCurrency } from "@lib/client-helpers";
import { cn } from "@lib/utils";

interface ProById extends ProductSold {
  id: number;
  totalPriceAfterDiscount: number;
}

const EditSoldForm = ({
  open,
  proSold,
  addSoldId,
  products,
  service,
}: {
  open: boolean;
  proSold: ProductToSell | undefined | null;
  addSoldId?: string;
  products: ProductWithCategory[];
  service: { id: number; totalPrice: number } | null;
}) => {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const defaultValues = {
    pricePerUnit: proSold?.pricePerUnit || 0,
    discount: proSold?.discount || 0,
    count: proSold?.count || 0,
    isReturned: proSold?.isReturned || false,
    note: proSold?.note || "",
    productId: proSold ? proSold.productId : 0,
    serviceId: addSoldId ? Number(addSoldId) : 1,
  };
  const form = useForm<ProductSold>({
    mode: "onChange",
    resolver: zodResolver(ProductSoldSchema),
    defaultValues,
  });

  const { pricePerUnit, count, discount } = form.watch();

  useEffect(() => {
    if (pricePerUnit * count > discount) {
      form.clearErrors("discount");
    }
  }, [pricePerUnit, count, discount, form]);

  useEffect(() => {
    form.reset(defaultValues);
  }, [open]);

  const isEqual = useObjectCompare(form.getValues(), defaultValues);
  const handleClose = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.delete("editSold");
    params.delete("addSoldId");
    router.push(`${pathname}?${String(params)}`, { scroll: false });
    form.reset();
  }, [open]);

  const isLoading = form.formState.isSubmitting;

  async function onSubmit({
    pricePerUnit,
    discount,
    count,
    isReturned,
    note,
    productId,
    serviceId,
  }: ProductSold) {
    try {
      if (!service)
        throw new Error(`Something went wrong, please refresh the page.`);

      if (isEqual) throw new Error("You haven't changed anything.");

      const totalPriceAfterDiscount = (pricePerUnit - discount) * count; // Calc the new total of the service.

      const editData = {
        pricePerUnit,
        discount,
        count,
        isReturned,
        note,
        totalPriceAfterDiscount,
      };
      const addSoldProduct = { ...editData, productId, serviceId };

      // If the admin wants to add a product sold of a service that is already performed.
      if (addSoldId) {
        const chosenProduct = products.find((pro) => pro.id === productId); // get the data of the chosen product.

        if (!chosenProduct)
          throw new Error(`There was a problem with picking the product sold.`);
        const { categories, productImages, ...product } = chosenProduct;
        const proToUpdate = product as Product;
        const newSerivceAmount = service.totalPrice + totalPriceAfterDiscount;
        const stockUpdates = {
          ...proToUpdate,
          stock: proToUpdate.stock - count,
        }; // Calc the the new stock number.
        const { error } = await createProductToSellAction(
          addSoldProduct,
          newSerivceAmount,
          stockUpdates
        );
        if (error) throw new Error(error);
      }

      // If the admin wants to edit a product sold entry of a service that is already performed
      if (proSold) {
        const newSerivceAmount =
          service.totalPrice +
          totalPriceAfterDiscount -
          proSold.totalPriceAfterDiscount;
        const isEqual =
          proSold.totalPriceAfterDiscount === totalPriceAfterDiscount;
        // const dir = count < proSold.count ? 1 : -1
        const product = proSold.product;

        const stockUpdates = {
          ...product,
          stock: product.stock - count + proSold.count,
        };

        const { error } = await editProductToSellAction(
          {
            productToSell: editData,
            id: proSold.id,
          },
          { id: service.id, totalPrice: newSerivceAmount, isEqual },
          stockUpdates
        );
        if (error) throw new Error(error);
      }
      handleClose();
      toast({
        className: "bg-primary  text-primary-foreground",
        title: "Data updated.",
        description: (
          <SuccessToastDescription
            message={
              addSoldId
                ? "New product added to the receipt."
                : "Product sold data has been updated."
            }
          />
        ),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Something went wrong.",
        description: <ErorrToastDescription error={error.message} />,
      });
    }
  }

  //   if (!feesToEdit) return <p>Something went wrong</p>;

  return (
    <DialogComponent open={open} onOpenChange={handleClose}>
      <DialogComponent.Content className="  max-h-[65vh]  sm:max-h-[76vh] overflow-y-auto max-w-[1000px] sm:p-14 pb-0 sm:pb-0">
        <DialogComponent.Header>
          <DialogComponent.Title>
            {!addSoldId && !proSold ? (
              <p className=" text-destructive-foreground font-semibold">
                Something went wrong!
              </p>
            ) : addSoldId ? (
              "Add more product sold to the service."
            ) : (
              "Edit product sold."
            )}
          </DialogComponent.Title>
          <DialogComponent.Description className="hidden">
            Create a new car information.
          </DialogComponent.Description>
        </DialogComponent.Header>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className={cn("space-y-8 ", {
              " opacity-45 blur-sm pointer-events-none hover:cursor-not-allowed ":
                !addSoldId && !proSold,
            })}
          >
            {addSoldId && (
              <FormField
                disabled={isLoading}
                control={form.control}
                name={"productId"}
                render={({ field }) => (
                  <FormItem className=" flex-1">
                    <FormLabel>Product</FormLabel>
                    <FormControl>
                      <ProductsComboBox
                        value={field.value}
                        setValue={(value) => {
                          const product = products.find(
                            (pro) => pro.id === value
                          );
                          field.onChange(value);

                          if (product) {
                            form.setValue("pricePerUnit", product.salePrice);
                            form.setValue("discount", product.listPrice);
                          }
                        }}
                        options={products}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter what product you bought.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <div className=" flex    items-center gap-1 xs:gap-3">
              <FormField
                disabled={isLoading}
                control={form.control}
                name="pricePerUnit"
                render={({ field }) => (
                  <FormItem className=" w-full mb-auto">
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

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                disabled={isLoading}
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem className=" w-full mb-auto">
                    <FormLabel>Discount per unit</FormLabel>
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
                        placeholder=""
                        // {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                disabled={isLoading}
                control={form.control}
                name="count"
                render={({ field }) => (
                  <FormItem className=" w-full mb-auto">
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
                        placeholder=""
                        // {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              disabled={isLoading}
              control={form.control}
              name={`note`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="note..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter any additional detials.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!addSoldId && (
              <FormField
                disabled={isLoading}
                control={form.control}
                name="isReturned"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex  justify-end items-center space-x-2">
                        <Switch
                          id="airplane-mode"
                          checked={field.value}
                          onClick={() => field.onChange(!field.value)}
                        />
                        <Label htmlFor="airplane-mode">is it returned?</Label>
                      </div>
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="w-[300px]">
              <h3 className=" text-sm">Summary:</h3>
              <div className=" py-2  border-b border-t space-y-2 text-xs text-muted-foreground">
                <div>
                  Amount:{" "}
                  <span className=" relative after:content-['units'] after:absolute after:-right-8 after:-top-1 after:text-dashboard-indigo ">
                    {count}
                  </span>
                </div>
                <div>Price per unit: {formatCurrency(pricePerUnit)}</div>
                <div>
                  Total price before discount:{" "}
                  {formatCurrency(pricePerUnit * count)}
                </div>
                <div>Total discount: {formatCurrency(discount)}</div>
                <div className=" border-t pt-1">
                  Net: {formatCurrency(pricePerUnit * count - discount)}
                </div>
              </div>
            </div>
            <DialogComponent.Footer className="  sm:pb-14 pb-5 pt-4 !mt-4 sticky  bg-background bottom-0 z-50 w-full">
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
                ) : addSoldId ? (
                  "Add"
                ) : (
                  "Update"
                )}
              </Button>
            </DialogComponent.Footer>
          </form>
        </Form>
      </DialogComponent.Content>
    </DialogComponent>
  );
};

export default EditSoldForm;
