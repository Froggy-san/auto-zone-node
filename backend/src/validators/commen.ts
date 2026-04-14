import mongoose from "mongoose";
import z from "zod";

// Helper for ObjectId validation to keep code DRY (Don't Repeat Yourself)
export const objectIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ID format",
  });
