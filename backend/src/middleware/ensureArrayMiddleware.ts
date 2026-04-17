import { Request, Response, NextFunction } from "express";

export const ensureArray = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fields.forEach((field) => {
      const value = req.body[field];
      if (value && !Array.isArray(value)) {
        req.body[field] = [value];
      }
    });
    next();
  };
};
