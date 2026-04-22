import express from "express";
import {
  createCar,
  deleteCar,
  getCar,
  getCars,
  processCarImages,
  updateCar,
  uploadCarImages,
} from "../controllers/carController";
import { ensureArray } from "../middleware/ensureArrayMiddleware";
import { validate } from "../middleware/validateMiddleware";
import { createCarSchema, updateCarSchema } from "../validators/carValidator";
import { paramIdSchema } from "../validators/commen";

const router = express.Router();

router
  .route("/")
  .get(getCars)
  .post(
    uploadCarImages,
    processCarImages,
    ensureArray(["carImages"]),
    validate(createCarSchema),
    createCar,
  );

router
  .route("/:id")
  .patch(
    uploadCarImages,
    processCarImages,
    ensureArray(["carImages", "imagesToDelete"]),
    validate(updateCarSchema),
    updateCar,
  )
  .get(validate(paramIdSchema), getCar)
  .delete(validate(paramIdSchema), deleteCar);
export default router;
