import { z } from "zod";
import { objectIdSchema } from "./commen";
import { updateProduct } from "../controllers/productController";

// 1. Define the sub-schema for the "Table" inside MoreDetails
const detailTableSchema = z.object({
  title: z.string(),
  description: z.string(),
});

// 2. Define the schema for MoreDetails itself
const moreDetailSchema = z.object({
  title: z.string().min(1, "Detail title is required"),
  description: z.string().default(""),
  table: z.array(detailTableSchema).default([]),
});

// body: z.object({}) here we are telling that the createProductSchema is an object that contains the body object in it
export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(100),
    listPrice: z.coerce.number().positive(),
    salePrice: z.coerce.number().positive(),
    stock: z.coerce.number().int().nonnegative().optional(),
    isAvailable: z.coerce.boolean().optional(),

    // Now expecting an array of string IDs, not numbers
    generations: z.array(objectIdSchema).optional(),

    // Use the sub-schema here for deep validation
    moreDetails: z.array(moreDetailSchema).optional(),

    productType: objectIdSchema,
    productBrand: objectIdSchema,
    category: objectIdSchema,
    productImages: z
      .array(
        z.object({
          imageUrl: z.string(),
          // .url(),
          filename: z.string(),
          isMain: z.boolean().optional(),
        }),
      )
      .optional(),
    mainImageName: z.string().optional().default(""),

    carMaker: objectIdSchema.optional(),
    // Keep 'model' here if you want, but remember our 'carModel' clash
    // we discussed earlier. If you renamed it to carModel in the
    // Mongoose schema, change it here too!
    carModel: objectIdSchema.optional(),
  }),
});

export const updateProductSchema = createProductSchema.partial().extend({
  body: createProductSchema.shape.body.partial().extend({
    imagesToDelete: z.array(z.string()).optional(),
  }),
});
