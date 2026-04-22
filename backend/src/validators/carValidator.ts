import { z } from "zod";
import { objectIdSchema } from "./commen";

export const carImageSchema = z.object({
  imagePath: z.string(),
  isMian: z.boolean().default(false).optional(),
});

export const createCarSchema = z.object({
  body: z.object({
    plateNumber: z.string().min(3, "Invalid plate number"),
    chassisNumber: z.string().min(5, "Chassis number is required"),
    motorNumber: z.string().min(5, "Motor number is required"),
    color: z.string().optional(),
    odometer: z.string().optional(),
    notes: z.string().optional(),
    carImages: z.array(carImageSchema),
    mainImageName: z.string().optional().default(""),
    // References
    client: objectIdSchema,
    carGeneration: objectIdSchema,
  }),
});

export const updateCarSchema = createCarSchema.partial().extend({
  body: createCarSchema.shape.body.partial().extend({
    imagesToDelete: z.array(z.string()).optional(),
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
