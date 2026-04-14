import { z } from "zod";
import mongoose from "mongoose";
import { objectIdSchema } from "./commen";

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
    listPrice: z.number().positive(),
    salePrice: z.number().positive(),
    stock: z.number().int().nonnegative().optional(),
    isAvailable: z.boolean().optional(),

    // Now expecting an array of string IDs, not numbers
    generations: z.array(objectIdSchema).optional(),

    // Use the sub-schema here for deep validation
    moreDetails: z.array(moreDetailSchema).optional(),

    productType: objectIdSchema,
    productBrand: objectIdSchema,
    category: objectIdSchema,

    maker: objectIdSchema.optional(),
    // Keep 'model' here if you want, but remember our 'carModel' clash
    // we discussed earlier. If you renamed it to carModel in the
    // Mongoose schema, change it here too!
    carModel: objectIdSchema.optional(),
  }),
});
