import express from "express";
import {
  convertProductImages,
  createProduct,
  getProducts,
  uploadProductImages,
} from "../controllers/productController";
import { validate } from "../middleware/validateMiddleware";
import { createProductSchema } from "../validators/productValidator";
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

export default router;
