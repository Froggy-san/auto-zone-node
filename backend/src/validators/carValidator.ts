import { z } from "zod";

export const createCarSchema = z.object({
  body: z.object({
    make: z.string().min(2, "Brand is too short"),
    model: z.string().min(1, "Model is required"),
    year: z.number().min(1900).max(2027),
    licensePlate: z.string().regex(/^[A-Z0-9- ]+$/i, "Invalid plate format"),
  }),
});
