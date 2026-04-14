import z from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string("")
      .min(2, "Category name is too short")
      .max(50, "Category name is too long"),
    image: z.string().optional().default(""),
  }),
});
