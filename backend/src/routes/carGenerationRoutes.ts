import express from "express";
import {
  createCarGeneration,
  deleteCarGeneration,
  getCarGenerations,
  getCarGeneration,
  updateCarGeneration,
} from "../controllers/carGenerationController";
import { upload } from "../controllers/carGenerationController";
import { validate } from "../middleware/validateMiddleware";
import { createCarGenerationSchema } from "../validators/carGenerationValidator";
import { paramIdSchema } from "../validators/commen";

export const carGenerationRouter = express.Router();

carGenerationRouter
  .route("/")
  .get(getCarGenerations)
  .post(
    upload.single("image"),
    validate(createCarGenerationSchema),
    createCarGeneration,
  );

carGenerationRouter.use("/:id", validate(paramIdSchema));

carGenerationRouter
  .route("/:id")
  .get(getCarGeneration)
  .patch(upload.single("image"), updateCarGeneration)
  .delete(deleteCarGeneration);

export default carGenerationRouter;
