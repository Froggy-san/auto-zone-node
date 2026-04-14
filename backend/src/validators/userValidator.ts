import { z } from "zod";

export const createUserSchema = z.object({
  body: z
    .object({
      name: z.string().min(4, "Name must be at least 4 characters").max(50),
      email: z.string().email("Please provide a valid email address"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      passwordConfirm: z.string(),
      picture: z.string().optional(),
      provider: z.enum(["email", "google"]).optional(),
      role: z.enum(["admin", "user"]).optional(),
    })
    .refine((data) => data.password === data.passwordConfirm, {
      message: "Passwords do not match",
      path: ["passwordConfirm"], // Sets the error specifically to this field
    }),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(4).optional(),
    email: z.string().email().optional(),
    picture: z.string().optional(),
  }),
});
