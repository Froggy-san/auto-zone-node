import { z } from "zod";
import { objectIdSchema } from "./commen";

export const createUserSchema = z.object({
  body: z.object({
    username: z.string().min(4, "Name must be at least 4 characters").max(50),
    email: z.string().email("Please provide a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    // passwordConfirm: z.string(),
    picture: z.string().optional(),
    provider: z.enum(["email", "google"]).optional(),
    role: z.enum(["admin", "user"]).optional(),
    isDeleted: z.coerce.boolean().default(false),
  }),
  // .refine((data) => data.password === data.passwordConfirm, {
  //   message: "Passwords do not match",
  //   path: ["passwordConfirm"], // Sets the error specifically to this field
  // }),
});

export const updateUserSchema = z.object({
  // params: z.object({ id: objectIdSchema }),
  body: z.object({
    username: z.string().min(4).optional(),
    email: z.string().email().optional(),
    picture: z.string().optional(),
    provider: z.enum(["email", "google"]).optional(),
    isDeleted: z.coerce.boolean().optional(),
  }),
});
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});
export const updatePasswordSchema = z.object({
  body: z.object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    currentPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    password: z.string().min(8, "Password must be at least 8 characters"),
  }),
});

export const updateUserByAdminSchema = createUserSchema.partial().extend({
  params: z.object({ id: objectIdSchema }),
  body: createUserSchema.shape.body.partial(),
});
