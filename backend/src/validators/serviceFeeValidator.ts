import z from "zod";
import { objectIdSchema } from "./commen";

export const SerivceFeeSchema = z
  .object({
    category: objectIdSchema,
    service: objectIdSchema,
    price: z.coerce.number().positive(),
    discount: z.coerce.number().positive(),
    totalPriceAfterDiscount: z.coerce.number().positive(),
    isReturned: z.coerce.boolean().default(false),
    note: z.string(),
  })
  .refine((data) => data.price > data.discount, {
    path: ["discount"],
    message: `Discount has to be lower than the original price`,
  });

export const createServiceFeeSchema = z.object({
  body: SerivceFeeSchema,
});

export const updateServiceFeeSchema = createServiceFeeSchema.partial().extend({
  params: z.object({ id: objectIdSchema }),
  body: createServiceFeeSchema.shape.body.partial(),
});
