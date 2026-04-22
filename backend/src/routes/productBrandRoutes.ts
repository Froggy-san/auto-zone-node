import express from "express";
import {
  createProductBrand,
  deleteProductBrand,
  getProductBrand,
  getProductBrands,
  updateProductBrand,
} from "../controllers/productBrandController";
import { validate } from "../middleware/validateMiddleware";
import {
  createProductBrandSchema,
  updateProductBrandSchema,
} from "../validators/productBrandValidator";
import { paramIdSchema } from "../validators/commen";

const router = express.Router();
router
  .route("/")
  .get(getProductBrands)
  .post(validate(createProductBrandSchema), createProductBrand);

router
  .route("/:id")
  .get(validate(paramIdSchema), getProductBrand)
  .patch(validate(updateProductBrandSchema), updateProductBrand)
  .delete(validate(paramIdSchema), deleteProductBrand);

export default router;
