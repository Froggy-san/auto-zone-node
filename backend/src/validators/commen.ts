import mongoose from "mongoose";
import z from "zod";

// Helper for ObjectId validation to keep code DRY (Don't Repeat Yourself)
export const objectIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ID format",
  });

export const paramIdSchema = z.object({
  params: objectIdSchema,
});

export const objectIdArraySchema = z.array(objectIdSchema).optional();

export const deleteMultipleIdsSchema = z.object({
  body: z
    .object({
      ids: objectIdArraySchema,
    })
    .refine((data) => data.ids && data.ids.length > 0, {
      message: "At least one ID must be provided",
    }),
});
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const carray = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((val) => {
    if (typeof val === "string") return [val];
    return val;
  }, z.array(schema));
