import express from "express";

import { paramIdSchema } from "../validators/commen";
import {
  createProductType,
  deleteProductType,
  getProductType,
  getProductTypes,
  updateProductType,
  upload,
} from "../controllers/productTypeController";
import { validate } from "../middleware/validateMiddleware";
import { createProductTypeSchema } from "../validators/productTypeValidator";

const router = express.Router();

router
  .route("/")
  .get(getProductTypes)
  .post(
    upload.single("image"),
    validate(createProductTypeSchema),
    createProductType,
  );

router
  .route("/:id")
  .get(validate(paramIdSchema), getProductType)
  .patch(
    upload.single("image"),
    validate(createProductTypeSchema),
    updateProductType,
  )
  .delete(validate(paramIdSchema), deleteProductType);

export default router;
