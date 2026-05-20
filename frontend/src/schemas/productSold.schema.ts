import z from "zod"

export const ProductSoldShape = z.object({
  product: z.string().min(1, { message: "Product ID is required" }),
  // service: z.string().min(1, { message: "Service ID is required" }),
  pricePerUnit: z.number().positive(),
  discountPerUnit: z.number(),
  // totalPriceAfterDiscount: z.number().positive(),
  count: z.number().positive(),
  isReturned: z.boolean(),
  note: z.string(),
})

export const productSoldSchema = ProductSoldShape.refine(
  (data) => data.pricePerUnit > data.discountPerUnit,
  {
    path: ["discountPerUnit"],
    message: "Discount per unit must be lower than the price per unit amount",
  }
)
