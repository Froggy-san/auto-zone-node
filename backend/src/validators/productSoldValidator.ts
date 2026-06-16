import z from "zod";
import { objectIdSchema } from "./commen";

export const ProductSoldShape = z.object({
  product: objectIdSchema,
  // service: objectIdSchema,
  pricePerUnit: z.coerce.number().positive(),
  discountPerUnit: z.coerce.number().positive(),
  // totalPriceAfterDiscount: z.coerce.number().positive(),
  count: z.coerce.number().positive(),
  isReturned: z.coerce.boolean().default(false),
  note: z.string().default(""),
});

export const productSoldSchema = ProductSoldShape.refine(
  (data) => data.pricePerUnit > data.discountPerUnit,
  {
    path: ["discountPerUnit"],
    message: "Discount per unit must be lower than the price per unit amount",
  },
);
export const createProductSoldSchema = z.object({
  body: productSoldSchema.extend({
    service: objectIdSchema,
  }),
});

export const updateProductSoldSchema = createProductSoldSchema
  .partial()
  .extend({
    params: z.object({ id: objectIdSchema }),
    body: ProductSoldShape.partial().refine(
      (data) => {
        if (data.pricePerUnit && data.discountPerUnit) {
          return data.pricePerUnit > data.discountPerUnit;
        }
        return true;
      },
      {
        path: ["discountPerUnit"],
        message:
          "Discount per unit must be lower than the price per unit amount",
      },
    ),
  });

export const deleteProductSoldSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z
    .object({
      shouldRestock: z.boolean().default(false),
    })
    .optional(),
});
