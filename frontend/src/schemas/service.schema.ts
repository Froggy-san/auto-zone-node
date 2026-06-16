import z, { string } from "zod"
import { ServiceFeeSchema } from "./serviceFee.schema"
import { productSoldSchema } from "./productSold.schema"

export const CreateServiceSchema = z.object({
  user: string().min(1, { message: "User ID is required" }),
  car: string().min(1, { message: "Car ID is required" }),
  serviceStatus: string().min(1, {
    message: "Service Status ID is required",
  }),
  technician: z.array(
    string().min(1, { message: "Technician ID is required" })
  ),
  odometer: z.string().min(1, { message: "Odometer is required" }),
  taxRate: z.number(),
  // subTotal: z.number().positive(),
  // taxAmount: z.number().positive(),
  // totalDiscount: z.number().positive(),
  // grandTotal: z.number().positive(),
  amountReceived: z.number(),
  paymentStatus: z.enum(["unpaid", "partially-paid", "paid", "refunded"]),
  priority: z.enum(["low", "medium", "high"]),
  note: z.string(),
  serviceFees: z.array(ServiceFeeSchema),
  productsSold: z.array(productSoldSchema),
  serviceDate: z.date(),
  laborTime: z.number(),
})
// .refine((data) => data.grandTotal > data.totalDiscount, {
//   path: ["totalDiscount"],
//   message: "Total discount amount must be lower than the grand total amount",
// })

export const EditServiceSchema = z.object({
  user: string().min(1, { message: "User ID is required" }),
  car: string().min(1, { message: "Car ID is required" }),
  serviceStatus: string().min(1, {
    message: "Service Status ID is required",
  }),
  technician: z.array(
    string().min(1, { message: "Technician ID is required" })
  ),
  odometer: z.string().min(1, { message: "Odometer is required" }),
  amountReceived: z.number(),
  paymentStatus: z.enum(["unpaid", "partially-paid", "paid", "refunded"]),
  priority: z.enum(["low", "medium", "high"]),
  note: z.string(),
  serviceDate: z.date(),
  laborTime: z.number(),
  // isReturned: z.boolean(),// Removed this property since the service status does the same job and it was causing confusion in the codebase. We can always add it back if we find a use case for it.
})
