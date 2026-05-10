import express from "express";
import { validate } from "../middleware/validateMiddleware";

import { protect, restrictTo } from "../controllers/authController";
import { paramIdSchema } from "../validators/commen";
import {
  createProductSoldSchema,
  updateProductSoldSchema,
} from "../validators/productSoldValidator";
import {
  createProductSold,
  deleteProductSold,
  getAllProductSold,
  updateProductSold,
} from "../controllers/productSoldController";

const router = express.Router();

router.use(protect);
router.use(restrictTo("admin"));
router
  .route("/")
  .get(getAllProductSold)
  .post(validate(createProductSoldSchema), createProductSold);
router
  .route("/:id")
  .patch(validate(updateProductSoldSchema), updateProductSold)
  .delete(validate(paramIdSchema), deleteProductSold);

export default router;
