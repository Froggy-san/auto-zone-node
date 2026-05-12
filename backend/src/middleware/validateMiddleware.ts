import { Request, Response, NextFunction } from "express";
import { ZodTypeAny } from "zod";
import { AppError } from "../utils/appError";
import { deleteFiles } from "../utils/helper";
import { ProductImage } from "../@types";

export const validate =
  (schema: ZodTypeAny) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Capture the transformed data
      const parsedData = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })) as { body: any; query: any; params: any };

      // 2. Overwrite the "dirty" request objects with the "clean" transformed ones
      if (parsedData.body) req.body = parsedData.body;
      // if (parsedData.query) req.query = parsedData.query;
      if (parsedData.params) req.params = parsedData.params;

      return next();
    } catch (error: any) {
      // 1. Check if it's a Zod Error\

      // 3. Check if there are files to be deleted
      if (req.file || req.files) {
        const logo = (req.body.logo || "") as string;
        const image = req.body.image || "";
        const productImages = (req.body.productImages || []) as ProductImage[];

        const fileName = req.file ? req.file.originalname : "";
        const imagesToDelete = [
          ...productImages.map((img) => img.imageUrl),
          fileName,
        ].filter((item) => item);

        if (imagesToDelete.length) deleteFiles(imagesToDelete);
      }

      if (error.name === "ZodError") {
        // 2. Map through the issues to create a detailed message
        // Example: "body.name: Required; body.price: Expected number, received string"
        const message = error.issues
          .map((issue: any) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");

        return next(new AppError(message, 400));
      }

      return next(new AppError(`Validation failed: ${error.message}`, 400));
    }
  };
