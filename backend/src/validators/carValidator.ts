import { z } from "zod";
import { objectIdSchema } from "./commen";

export const carImageSchema = z.object({
  imagePath: z.string(),
  filename: z.string(),
  isMain: z.boolean().default(false).optional(),
});

export const createCarSchema = z.object({
  body: z.object({
    plateNumber: z
      .string()
      .min(3, "Invalid plate number")
      .max(30, { message: "Plate number is too long." }),
    chassisNumber: z.string(),
    motorNumber: z.string(),
    color: z.string().optional(),
    odometer: z.string().optional(),
    notes: z.string().optional(),
    carImages: z.array(carImageSchema).default([]),
    mainImageName: z.string().optional().default(""),
    // References
    user: objectIdSchema,
    carGeneration: objectIdSchema,
  }),
});

export const updateCarSchema = createCarSchema.partial().extend({
  body: createCarSchema.shape.body.partial().extend({
    imagesToDelete: z.preprocess((val) => {
      if (typeof val === "string") return JSON.parse(val);
      return val;
    }, z.array(z.string()).optional()),
  }),
});

// export const createCarSchema = z.object({
//   body: z.object({
//     make: z.string().min(2, "Brand is too short"),
//     model: z.string().min(1, "Model is required"),
//     year: z.number().min(1900).max(2027),
//     licensePlate: z.string().regex(/^[A-Z0-9- ]+$/i, "Invalid plate format"),
//   }),
// });
