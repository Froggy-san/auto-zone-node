import z from "zod"

// 1. Define the raw shape without refinements
const ServiceFeeShape = z.object({
  category: z.string().min(1, { message: "Category is required" }),
  // service: z.string().min(1, { message: "Service description is required" }),
  price: z.number().gt(0, "Price must be greater than 0"),
  discount: z.number(),
  // totalPriceAfterDiscount: z.number().positive(),
  isReturned: z.boolean(),
  note: z.string(),
})

export const ServiceFeeSchema = ServiceFeeShape.refine(
  (data) => data.price > data.discount,
  {
    path: ["discount"],
    message: `Discount has to be lower than the original price`,
  }
)
