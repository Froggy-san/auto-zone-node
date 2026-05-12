import express from "express";
import { validate } from "../middleware/validateMiddleware";
import { protect, restrictTo } from "../controllers/authController";
import { paramIdSchema } from "../validators/commen";
import {
  createService,
  deleteService,
  getAllServices,
  updateService,
} from "../controllers/serviceController";
import {
  createServiceSchema,
  updateServiceSchema,
} from "../validators/serviceValidator";

const router = express.Router();

router.use(protect);
router.use(restrictTo("admin"));
router
  .route("/")
  .get(getAllServices)
  .post(validate(createServiceSchema), createService);
router
  .route("/:id")
  .patch(validate(updateServiceSchema), updateService)
  .delete(validate(paramIdSchema), deleteService);

export default router;
