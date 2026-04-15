import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodTypeAny } from "zod/v3";
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
      return next(new AppError("Validation failed", 400));
    }
  };
