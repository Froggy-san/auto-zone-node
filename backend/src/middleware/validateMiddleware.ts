import { Request, Response, NextFunction } from "express";
import { ZodTypeAny } from "zod";
import { AppError } from "../utils/appError";

export const validate =
  (schema: ZodTypeAny) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error: any) {
      // 1. Check if it's a Zod Error
      if (error.name === "ZodError") {
        // 2. Map through the issues to create a detailed message
        // Example: "body.name: Required; body.price: Expected number, received string"
        const message = error.issues
          .map((issue: any) => `${issue.path.join(".")}: ${issue.message}`)
          .join("; ");

        return next(new AppError(message, 400));
      }

      return next(new AppError("Validation failed", 400));
    }
  };
