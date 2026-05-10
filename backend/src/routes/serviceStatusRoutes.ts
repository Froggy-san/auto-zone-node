import express from "express";
import {
  createServiceStatus,
  deleteServiceStatus,
  getAllServiceStatuses,
  updateServiceStatus,
} from "../controllers/serviceStatusController";
import { validate } from "../middleware/validateMiddleware";
import {
  createServiceStatusSchema,
  updateServiceStatusSchema,
} from "../validators/serviceStatsValdator";
import { protect, restrictTo } from "../controllers/authController";
import { paramIdSchema } from "../validators/commen";

const router = express.Router();

router.use(protect);
router.use(restrictTo("admin"));
router
  .route("/")
  .get(getAllServiceStatuses)
  .post(validate(createServiceStatusSchema), createServiceStatus);
router
  .route("/:id")
  .patch(validate(updateServiceStatusSchema), updateServiceStatus)
  .delete(validate(paramIdSchema), deleteServiceStatus);

export default router;
