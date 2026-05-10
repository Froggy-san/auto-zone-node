import z from "zod";
import { objectIdSchema } from "./commen";
import { SerivceFeeSchema } from "./serviceFeeValidator";
import { ProductSoldSchema } from "./productSoldValidator";

export const createServiceSchema = z.object({
  body: z
    .object({
      odometer: z.string().min(1, { message: "Odometer is required" }),
      totalPrice: z.number().positive(),
      totalDiscount: z.number().positive(),
      priority: z.enum(["low", "medium", "high"]).default("low"),
      note: z.string(),
      user: objectIdSchema,
      car: objectIdSchema,
      serviceFees: z.array(SerivceFeeSchema),
      productsSold: z.array(ProductSoldSchema),
    })
    .refine((data) => data.totalPrice > data.totalDiscount, {
      path: ["totalDiscount"],
      message: "Total discount amount must be lower than total price amout",
    }),
});

export const updateServiceSchema = createServiceSchema.partial().extend({
  params: z.object({ id: objectIdSchema }),
  body: createServiceSchema.shape.body.partial(),
});
