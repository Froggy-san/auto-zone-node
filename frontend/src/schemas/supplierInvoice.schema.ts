import {
  FULLFILLMENT_STATUS_VALUES,
  SUPPLIER_PAYMENT_STATUS_VALUES,
} from "@/types/supplierInvoiceTypes"
import z from "zod"

const itemSchema = z
  .object({
    product: z.string().min(1, { message: "Product ID is required." }),
    orderedQuantity: z.number(),
    quantity: z.number().int().positive("Quantity has to be bigger than 0"),
    costPriceBeforeTax: z.number().positive(),
    discountPercentage: z.number().min(0).max(100),
    taxRatePercentage: z.number().min(0).max(100), // Matches Egyptian standard VAT rate
    isReturned: z.boolean(),
    // Optional strategic retail modification selectors
    newRetailPrice: z.number().positive(),
    newSalePrice: z.number().positive(),
  })
  .refine(
    (item) => {
      const newRetailPrice = item.newRetailPrice || 0

      const newSalePrice = item.newSalePrice || 0

      return newRetailPrice > newSalePrice
    },
    {
      path: ["newSalePrice"],
      message: "The new sale price must be lower than new retail price",
    }
  )
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

export const CreateSupplierInvoiceSchema = z.object({
  invoiceNumber: z.string().trim().min(1, {
    message: "The supplier's invoice billing number is required.",
  }),
  supplierName: z.string().trim().min(1, {
    message: "Supplier identification name cannot be left blank.",
  }),

  shippingAndFees: z.number().min(0),
  amountPaid: z.number().min(0),
  fulfillmentStatus: z.enum(FULLFILLMENT_STATUS_VALUES),

  // Line items configuration array
  items: z.array(itemSchema),
  // .min(
  //   1,
  //   "An invoice submission must contain at least 1 bought product item."
  // ),
})

export const UpdateSupplierInvoiceSchema =
  CreateSupplierInvoiceSchema.omit("items").optional()
// .refine((data) => Object.keys(data).length > 0, {
//     message:
//       "You must provide at least one modification parameter field to update.",
//   })
// .object({
//   amountPaid: z.coerce.number().min(0).optional(),
//   fulfillmentStatus: z.enum(SUPPLIER_PAYMENT_STATUS_VALUES).optional(),

//   isReturned: z.boolean().optional(),
//   notes: z.string().max(500).optional().or(z.literal("")),
// })
// .refine((data) => Object.keys(data).length > 0, {
//   message:
//     "You must provide at least one modification parameter field to update.",
// })

export const addBoughtItemSchema = itemSchema
export const UpdateSupplierItemSchema = itemSchema

// export const deleteSupplierItemSchema = z.object({
//   params: z.object({
//     id: objectIdSchema,
//     productId: objectIdSchema,
//   }),
//   body: z.object({
//     shouldRemoveStock: z.coerce.boolean().optional().default(false),
//   }),
// });

// Reuses structural payload criteria for total invoice deletions
// export const deleteSupplierInvoiceSchema = z.object({
//   params: z.object({
//     id: objectIdSchema,
//   }),
//   body: z.object({
//     shouldRemoveStock: z.coerce.boolean().optional().default(false),
//   }),
// });

// Infer your request body type automatically!
export type CreateSupplierInvoiceInput = z.infer<
  typeof CreateSupplierInvoiceSchema
>
export type UpdateSupplierInvoiceInput = z.infer<
  typeof UpdateSupplierInvoiceSchema
>
export type AddSupplierInvoiceItemInput = z.infer<typeof addBoughtItemSchema>
export type UpdateSupplierInvoiceItemInput = z.infer<
  typeof UpdateSupplierItemSchema
>
