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
router.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.path}`);
  // console.log("Full Params:", req.params);
  // console.log("Route Path:", req.route.path); // This tells you which pattern Express matched
  next();
});

router.get(
  "/getCarAndRelated/:userId",
  validate(
    z.object({
      params: z.object({ userId: objectIdSchema }),
      query: z.object({ carId: objectIdSchema }),
    }),
  ),
  getCarAndRelated,
);
router
  .route("/")
  .get(handleCarFilters, getCars)
  .post(
    uploadCarImages,
    processCarImages,
    ensureArray(["carImages", "imagesToDelete"]),
    validate(createCarSchema),
    createCar,
  );

router
  .route("/:id")
  .patch(
    uploadCarImages,
    processCarImages,
    ensureArray(["carImages"]),
    validate(updateCarSchema),
    updateCar,
  )
  .get(validate(paramIdSchema), getCar)
  .delete(validate(paramIdSchema), deleteCar);
export default router;
