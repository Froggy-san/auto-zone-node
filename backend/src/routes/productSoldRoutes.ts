import express from "express";
import { validate } from "../middleware/validateMiddleware";

import { protect, restrictTo } from "../controllers/authController";
import { paramIdSchema } from "../validators/commen";
import {
  createProductSoldSchema,
  deleteProductSoldSchema,
  updateProductSoldSchema,
} from "../validators/productSoldValidator";
import {
  createProductSold,
  deleteProductSold,
  getAllProductSold,
  getProductSold,
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
  .get(validate(paramIdSchema), getProductSold)
  .patch(validate(updateProductSoldSchema), updateProductSold)
  .delete(validate(deleteProductSoldSchema), deleteProductSold);

export default router;
