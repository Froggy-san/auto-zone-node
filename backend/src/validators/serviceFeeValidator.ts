import z from "zod";
import { objectIdSchema } from "./commen";
// 1. Define the raw shape without refinements
const ServiceFeeShape = z.object({
  category: objectIdSchema,
  // service: objectIdSchema,
  price: z.coerce.number().positive(),
  discount: z.coerce.number().default(0),
  totalPriceAfterDiscount: z.coerce.number().positive(),
  isReturned: z.coerce.boolean().default(false),
  note: z.string(),
});

// 2. Create the "Create" schema by adding the refinement to the full shape
export const ServiceFeeSchema = ServiceFeeShape.refine(
  (data) => data.price > data.discount,
  {
    path: ["discount"],
    message: `Discount has to be lower than the original price`,
  },
);

export const createServiceFeeSchema = z.object({
  body: ServiceFeeSchema,
});

// 3. Create the "Update" schema using the raw shape's partial
export const updateServiceFeeSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: ServiceFeeShape.partial().refine(
    (data) => {
      // Only run refinement if BOTH fields are provided in the update
      if (data.price !== undefined && data.discount !== undefined) {
        return data.price > data.discount;
      }
      return true;
    },
    {
      path: ["discount"],
      message: `Discount has to be lower than the original price`,
    },
  ),
});
