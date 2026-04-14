import z from "zod";

export const createCarMakerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, { message: "Car maker name must be longer than 2 characters" })
      .max(50, "Car maker name must be less than 50 characters"),
    notes: z.string().optional().default(""),
    logo: z.string().optional().default(""),
  }),
});
