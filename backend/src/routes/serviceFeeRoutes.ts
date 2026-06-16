import express from "express";
import { validate } from "../middleware/validateMiddleware";

import { protect, restrictTo } from "../controllers/authController";
import { paramIdSchema } from "../validators/commen";
import {
  createServiceFee,
  deleteServiceFee,
  getAllServiceFees,
  getServiceFee,
  updateServiceFee,
} from "../controllers/serviceFeeController";
import {
  createServiceFeeSchema,
  updateServiceFeeSchema,
} from "../validators/serviceFeeValidator";

const router = express.Router();

router.use(protect);
router.use(restrictTo("admin"));
router
  .route("/")
  .get(getAllServiceFees)
  .post(validate(createServiceFeeSchema), createServiceFee);
router
  .route("/:id")
  .get(validate(paramIdSchema), getServiceFee)
  .patch(validate(updateServiceFeeSchema), updateServiceFee)
  .delete(validate(paramIdSchema), deleteServiceFee);

export default router;
