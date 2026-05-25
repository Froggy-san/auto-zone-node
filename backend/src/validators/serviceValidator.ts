import z from "zod";
import { objectIdSchema } from "./commen";
import { ServiceFeeSchema } from "./serviceFeeValidator";
import { productSoldSchema } from "./productSoldValidator";

export const createServiceSchema = z.object({
  body: z.object({
    user: objectIdSchema,
    car: objectIdSchema,
    serviceStatus: objectIdSchema,
    technician: z.preprocess(
      (val) => {
        if (typeof val === "string") return JSON.parse(val);
        return val;
      },
      z.array(objectIdSchema).refine((arr) => arr.length > 0, {
        message: "At least one technician ID is required",
      }),
    ),
    odometer: z.string().min(1, { message: "Odometer is required" }),
    // subTotal: z.number().positive(),
    // taxAmount: z.number().positive(),
    // totalDiscount: z.number().positive().default(0),
    // grandTotal: z.number().positive(),
    taxRate: z.number().positive(),
    amountReceived: z.number().optional().default(0),
    paymentStatus: z
      .enum(["unpaid", "partially-paid", "paid", "refunded"])
      .default("unpaid"),
    priority: z.enum(["low", "medium", "high"]).default("low"),
    note: z.string(),
    serviceFees: z.preprocess((val) => {
      if (typeof val === "string") return JSON.parse(val);
      return val;
    }, z.array(ServiceFeeSchema)),
    productsSold: z.preprocess((val) => {
      if (typeof val === "string") return JSON.parse(val);
      return val;
    }, z.array(productSoldSchema)),
    serviceDate: z.coerce.date({
      message: "Please provide a valid date string",
    }),
    laborTime: z.number(),
  }),
  // .refine((data) => data.grandTotal > data.totalDiscount, {
  //   path: ["totalDiscount"],
  //   message: "Total discount amount must be lower than the grand total amout",
  // }),
});

export const updateServiceSchema = createServiceSchema.partial().extend({
  params: z.object({ id: objectIdSchema }),
  body: createServiceSchema.shape.body.partial(),
});
