import z from "zod";
import { objectIdSchema } from "./commen";

export const ProductSoldSchema = z
  .object({
    product: objectIdSchema,
    service: objectIdSchema,
    pricePerUnit: z.coerce.number().positive(),
    discountPerUnit: z.coerce.number().positive(),
    totalPriceAfterDiscount: z.coerce.number().positive(),
    count: z.coerce.number().positive(),
    isReturned: z.coerce.boolean().default(false),
    note: z.string().default(""),
  })
  .refine((data) => data.pricePerUnit > data.discountPerUnit, {
    path: ["discountPerUnit"],
    message: "Discount per unit must be lower than the price per unit amount",
  });

export const createProductSoldSchema = z.object({
  body: ProductSoldSchema,
});

export const updateProductSoldSchema = createProductSoldSchema
  .partial()
  .extend({
    params: z.object({ id: objectIdSchema }),
    body: createProductSoldSchema.shape.body.partial(),
  });
