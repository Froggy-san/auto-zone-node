import React, { useId } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { motion } from "framer-motion";
import { Control, FieldArrayWithId, UseFormReturn } from "react-hook-form";
import { Cross2Icon } from "@radix-ui/react-icons";
import { ProductsComboBox } from "@components/proudcts-combo-box";
import { ProductWithCategory, RestockingBill } from "@lib/types";
import { RestockingComboBox } from "@components/restocking-combo-box";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { formatCurrency } from "@lib/client-helpers";
import CurrencyInput from "react-currency-input-field";

type Field = FieldArrayWithId<
  {
    shopName: string;
    productBought: {
      note: string;
      productId: number;
      pricePerUnit: number;
      discount: number;
      count: number;
      productsRestockingBillId: string;
    }[];
  },
  "productBought",
  "id"
>;
type FormControl = Control<
  {
    productBought: {
      note: string;
      productId: number;
      pricePerUnit: number;
      discount: number;
      count: number;
      productsRestockingBillId: string;
    }[];
    shopName: string;
  },
  any
>;
type Form = UseFormReturn<
  {
    productBought: {
      note: string;
      productId: number;
      pricePerUnit: number;
      discount: number;
      count: number;
      productsRestockingBillId: string;
    }[];
    shopName: string;
  },
  any,
  undefined
>;
const FormInventoryItem = ({
  field,

  index,
  remove,
  isLoading,
  form,
  products,
  reStockingBillId,
  restockings,
  productBoughtArr,
}: {
  field: Field;
  index: number;
  remove: (index: number) => void;
  isLoading: boolean;
  form: Form;
  products: ProductWithCategory[];
  restockings: RestockingBill[];
  reStockingBillId?: string;
  productBoughtArr: {
    note: string;
    productId: number;
    pricePerUnit: number;
    discount: number;
    count: number;
    productsRestockingBillId: string;
  }[];
}) => {
  return (
    <React.Fragment>
      <h2>{index + 1}.</h2>
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
        className=" space-y-4  border p-3 rounded-xl relative "
      >
        <button
          onClick={() => {
            remove(index);
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
            name={`productBought.${index}.productId`}
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
                          `productBought.${index}.pricePerUnit`,
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
                    <Input type="text" placeholder="Shop name..." {...field} />
                  )}
                  {/* <RestockingComboBox
                                value={24}
                                setValue={field.onChange}
                                options={restockings}
                                disabled={true}
                              /> */}
                </FormControl>
                <FormDescription>Enter shop name.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className=" flex  flex-col gap-2  sm:flex-row  ">
          <FormField
            disabled={isLoading}
            control={form.control}
            name={`productBought.${index}.pricePerUnit`}
            render={({ field }) => (
              <FormItem className="  w-full mb-auto ">
                <FormLabel htmlFor="price-per-unit">Price per unit</FormLabel>
                <FormControl>
                  <CurrencyInput
                    id="price-per-unit"
                    name="price"
                    placeholder="Price-Per-Unit"
                    decimalsLimit={2} // Max number of decimal places
                    prefix="EGP " // Currency symbol (e.g., Egyptian Pound)
                    decimalSeparator="." // Use dot for decimal
                    groupSeparator="," // Use comma for thousands
                    value={field.value || ""}
                    onValueChange={(formattedValue, name, value) => {
                      // setFormattedListing(formattedValue || "");

                      field.onChange(Number(value?.value) || 0);
                    }}
                    className="input-field "
                  />
                </FormControl>
                <FormDescription>Enter the cost of each unit.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            disabled={isLoading}
            control={form.control}
            name={`productBought.${index}.discount`}
            render={({ field }) => (
              <FormItem className="  w-full mb-auto">
                <FormLabel htmlFor="total-discount">Total Discount</FormLabel>
                <FormControl>
                  <CurrencyInput
                    id="total-discount"
                    name="price"
                    placeholder="Total-Discount"
                    decimalsLimit={2} // Max number of decimal places
                    prefix="EGP " // Currency symbol (e.g., Egyptian Pound)
                    decimalSeparator="." // Use dot for decimal
                    groupSeparator="," // Use comma for thousands
                    value={field.value || ""}
                    onValueChange={(formattedValue, name, value) => {
                      // setFormattedListing(formattedValue || "");

                      field.onChange(Number(value?.value) || 0);
                    }}
                    className="input-field "
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
            name={`productBought.${index}.count`}
            render={({ field }) => (
              <FormItem className=" w-full  mb-auto">
                <FormLabel htmlFor="count">Count</FormLabel>
                <FormControl>
                  <CurrencyInput
                    id="count"
                    name="Count"
                    placeholder="Available Stock"
                    decimalsLimit={2} // Max number of decimal places
                    prefix="UNITS " // Currency symbol (e.g., Egyptian Pound)
                    decimalSeparator="." // Use dot for decimal
                    groupSeparator="," // Use comma for thousands
                    value={field.value || ""}
                    onValueChange={(formattedValue, name, value) => {
                      field.onChange(Number(value?.value) || 0);
                    }}
                    className="input-field  "
                  />
                </FormControl>
                <FormDescription>Enter the amount you bought.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          disabled={isLoading}
          control={form.control}
          name={`productBought.${index}.note`}
          render={({ field }) => (
            <FormItem className=" flex-1">
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="note..." {...field} />
              </FormControl>
              <FormDescription>Enter additional detials.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <p className=" text-xs text-muted-foreground">
          Total amount spent:
          <span className=" ml-3">
            {formatCurrency(
              (productBoughtArr[index]?.pricePerUnit -
                productBoughtArr[index]?.discount) *
                productBoughtArr[index]?.count
            )}
          </span>
        </p>
      </motion.div>
    </React.Fragment>
  );
};

export default FormInventoryItem;
