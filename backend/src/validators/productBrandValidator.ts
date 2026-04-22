import { create } from "node:domain";
import z from "zod";

export const createProductBrandSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, {
        message: "Product brand name must be longer than 2 characters",
      })
      .max(50, {
        message: "Product brand name must be less than 50 characters",
      }),
  }),
});

export const updateProductBrandSchema = createProductBrandSchema
  .partial()
  .extend({
    body: createProductBrandSchema.shape.body.partial(),
  });
