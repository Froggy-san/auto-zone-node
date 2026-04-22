import express from "express";
import {
  convertProductImages,
  createProduct,
  deleteMultipleProducts,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
  uploadProductImages,
} from "../controllers/productController";
import { validate } from "../middleware/validateMiddleware";
import {
  createProductSchema,
  updateProductSchema,
} from "../validators/productValidator";
import { ensureArray } from "../middleware/ensureArrayMiddleware";
import { deleteMultipleIdsSchema, paramIdSchema } from "../validators/commen";

const router = express.Router();

router
  .route("/")
  .get(getProducts)
  .post(
    uploadProductImages,
    convertProductImages,
    ensureArray(["productImages"]),
    validate(createProductSchema),
    createProduct,
  );

// MOVE THIS ABOVE /:id
router
  .route("/delete-multiple")
  .delete(
    ensureArray(["ids"]),
    validate(deleteMultipleIdsSchema),
    deleteMultipleProducts,
  );

router
  .route("/:id")
  .get(validate(paramIdSchema), getProduct)
  .patch(
    uploadProductImages,
    convertProductImages,
    ensureArray(["productImages", "imagesToDelete"]),
    validate(updateProductSchema),
    updateProduct,
  )
  .delete(validate(paramIdSchema), deleteProduct);
export default router;
