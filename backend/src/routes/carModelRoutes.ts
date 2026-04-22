import express from "express";
import {
  createCarModel,
  deleteCarModel,
  getCarModel,
  getCarModels,
  updateCarModel,
  upload,
} from "../controllers/carModelController";
import {
  createCarModelSchema,
  updateCarModelSchema,
} from "../validators/carModelValidator";
import { validate } from "../middleware/validateMiddleware";
import { paramIdSchema } from "../validators/commen";

const router = express.Router();

router
  .route("/")
  .get(getCarModels)
  .post(upload.single("image"), validate(createCarModelSchema), createCarModel);

router
  .route("/:id")
  .get(validate(paramIdSchema), getCarModel)
  .patch(upload.single("image"), validate(updateCarModelSchema), updateCarModel)
  .delete(validate(paramIdSchema), deleteCarModel);

export default router;
