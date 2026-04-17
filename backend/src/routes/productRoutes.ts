import express from "express";
import {
  convertProductImages,
  createProduct,
  deleteMultipleProducts,
  deleteProduct,
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
  .patch(
    uploadProductImages,
    convertProductImages,
    ensureArray(["imagesToDelete"]),
    validate(updateProductSchema),
    updateProduct,
  )
  .delete(validate(paramIdSchema), deleteProduct);
export default router;
