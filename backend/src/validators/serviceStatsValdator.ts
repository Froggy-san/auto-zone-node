import z from "zod";
import { objectIdSchema } from "./commen";

export const createServiceStatusSchema = z.object({
  body: z.object({
    name: z.string().min(2, { message: "Service status name is too short" }),
    colorLight: z.string(),
    colorDark: z.string(),
    description: z.string(),
  }),
});

export const updateServiceStatusSchema = createServiceStatusSchema
  .partial()
  .extend({
    params: z.object({ id: objectIdSchema }),
    body: createServiceStatusSchema.shape.body.partial(),
  });
