import express from "express";
import { createProduct } from "../controllers/productController";
import { validate } from "../middleware/validateMiddleware";
import { createProductSchema } from "../validators/productValidator";
const router = express.Router();

router.route("/").post(validate(createProductSchema), createProduct);

export default router;
