import z from "zod";
import { objectIdSchema } from "./commen";

export const createCarGenerationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, {
        message: "Car generation name must be longer than 2 characters",
      })
      .max(50, "Car generation name must be less than 50 characters"),
    notes: z.string().optional().default(""),
    image: z.string().optional().default(""),
    carModel: objectIdSchema,
  }),
});

export const updateCarGenerationSchema = createCarGenerationSchema
  .partial()
  .extend({
    body: createCarGenerationSchema.shape.body.partial(),
  });
