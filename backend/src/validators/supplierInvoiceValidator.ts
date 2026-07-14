import z from "zod";
import { objectIdSchema } from "./commen";
import {
  FULLFILLMENT_STATUS_VALUES,
  SUPPLIER_PAYMENT_STATUS_VALUES,
} from "../models/supplierInvoiceModel";

const itemSchema = z
  .object({
    product: objectIdSchema,
    orderedQuantity: z.coerce.number().positive(),
    receivedQuantity: z.coerce
      .number()
      .int()
      .positive("Ordered stock quantities must be greater than zero."),
    costPriceBeforeTax: z.coerce.number().positive(),
    discountPercentage: z.coerce.number().min(0).max(100).default(0),
    taxRatePercentage: z.coerce.number().min(0).max(100).default(14), // Matches Egyptian standard VAT rate
    isReturned: z.coerce.boolean().optional().default(false),
    // Optional strategic retail modification selectors
    newRetailPrice: z.coerce.number().positive().optional(),
    newSalePrice: z.coerce.number().positive().min(0).optional(),
    expiresAt: z.coerce.date().optional(),
  })
  .refine(
    (item) => {
      const newRetailPrice = item.newRetailPrice || 0;

      const newSalePrice = item.newSalePrice || 0;

      return newRetailPrice > newSalePrice;
    },
    {
      path: ["newSalePrice"],
      message: "The new sale price must be lower than new retail price",
    },
  );
//  .refine(
//     (item) => {
//       const orderedQuantity = item.orderedQuantity || 0;
//       return orderedQuantity <= item.quantity;
//     },
//     {
//       path: ["orderedQuantity"],
//       message: "Ordered quantity must be lower or equal to the quantity",
//     },
//   );

export const createSupplierInvoiceSchema = z.object({
  body: z.object({
    invoiceNumber: z.string().trim().min(1, {
      message: "The supplier's invoice billing number is required.",
    }),
    supplierName: z.string().trim().min(1, {
      message: "Supplier identification name cannot be left blank.",
    }),
    shippingAndFees: z.coerce.number().default(0),
    amountPaid: z.coerce.number().min(0).default(0),
    fulfillmentStatus: z.enum(FULLFILLMENT_STATUS_VALUES).default("pending"),
    paymentStatus: z.enum(SUPPLIER_PAYMENT_STATUS_VALUES).default("unpaid"),
    notes: z.string().max(500).optional().or(z.literal("")),

    // Line items configuration array
    items: z
      .array(itemSchema)
      .min(
        1,
        "An invoice submission must contain at least 1 bought product item.",
      ),
  }),
});

export const updateSupplierInvoiceSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      amountPaid: z.coerce.number().min(0).optional(),
      shippingAndFees: z.coerce.number().optional(),
      fulfillmentStatus: z.enum(FULLFILLMENT_STATUS_VALUES).optional(),
      // isReturned: z.boolean().optional(),
      notes: z.string().max(500).optional().or(z.literal("")),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message:
        "You must provide at least one modification parameter field to update.",
    }),
});

export const addBoughtItemSchema = z.object({
  params: z.object({
    id: objectIdSchema,
    productId: objectIdSchema,
  }),
  body: itemSchema,
});

export const updateSupplierItemSchema = z.object({
  params: z.object({
    id: objectIdSchema,
    productId: objectIdSchema,
  }),
  body: itemSchema.refine((data) => Object.keys(data).length > 0, {
    message:
      "You must alter at least one item detail metric to execute this update.",
  }),
});

export const deleteSupplierItemSchema = z.object({
  params: z.object({
    id: objectIdSchema,
    productId: objectIdSchema,
  }),
  body: z.object({
    shouldRemoveStock: z.coerce.boolean().optional().default(false),
  }),
});

// Reuses structural payload criteria for total invoice deletions
export const deleteSupplierInvoiceSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    shouldRemoveStock: z.coerce.boolean().optional().default(false),
  }),
});

// Infer your request body type automatically!
export type CreateSupplierInvoiceInput = z.infer<
  typeof createSupplierInvoiceSchema
>["body"];
export type UpdateSupplierInvoiceInput = z.infer<
  typeof updateSupplierInvoiceSchema
>["body"];
export type AddSupplierInvoiceItemInput = z.infer<
  typeof addBoughtItemSchema
>["body"];
export type UpdateSupplierInvoiceItemInput = z.infer<
  typeof updateSupplierItemSchema
>["body"];
