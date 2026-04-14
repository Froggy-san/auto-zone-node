import z from "zod";
import { objectIdSchema } from "./commen";

export const createProductTypeSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, { message: "Product type is too short" })
      .max(50, { message: "Prodcut type is too long" }),
    category: objectIdSchema,
    image: z.string().optional().default(""),
  }),
});
