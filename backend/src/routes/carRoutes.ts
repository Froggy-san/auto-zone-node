import express from "express";
import {
  createCar,
  deleteCar,
  getCar,
  getCarAndRelated,
  getCars,
  handleCarFilters,
  processCarImages,
  updateCar,
  uploadCarImages,
} from "../controllers/carController";
import { ensureArray } from "../middleware/ensureArrayMiddleware";
import { validate } from "../middleware/validateMiddleware";
import { createCarSchema, updateCarSchema } from "../validators/carValidator";
import { objectIdSchema, paramIdSchema } from "../validators/commen";
import z from "zod";

const router = express.Router();

router
  .route("/")
  .get(handleCarFilters, getCars)
  .post(
    uploadCarImages,
    processCarImages,
    ensureArray(["carImages"]),
    validate(createCarSchema),
    createCar,
  );

router.get(
  "getCarAndRelated/:userId",
  validate(
    z.object({
      params: z.object({ userId: objectIdSchema }),
    }),
  ),
  getCarAndRelated,
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
