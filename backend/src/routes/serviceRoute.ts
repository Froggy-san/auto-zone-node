import express from "express";
import { validate } from "../middleware/validateMiddleware";
import { protect, restrictTo } from "../controllers/authController";
import { paramIdSchema } from "../validators/commen";
import {
  createService,
  deleteService,
  getAllServices,
  getServiceStats,
  updateService,
} from "../controllers/serviceController";
import {
  createServiceSchema,
  deleteServiceSchema,
  updateServiceSchema,
} from "../validators/serviceValidator";

const router = express.Router();

router.use(protect);
router.use(restrictTo("admin"));

router.get("/stats", getServiceStats);

router
  .route("/")
  .get(getAllServices)
  .post(validate(createServiceSchema), createService);
router
  .route("/:id")
  .patch(validate(updateServiceSchema), updateService)
  .delete(validate(deleteServiceSchema), deleteService);

export default router;
