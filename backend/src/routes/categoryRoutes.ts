import express from "express";
import {
  createCategory,
  deleteCategroy,
  getCategories,
  getCategory,
  upload,
} from "../controllers/categoryController";
import { validate } from "../middleware/validateMiddleware";
import { createCategorySchema } from "../validators/categoryValidator";
import { paramIdSchema } from "../validators/commen";

const router = express.Router();

router
  .route("/")
  .get(getCategories)
  .post(upload.single("image"), validate(createCategorySchema), createCategory);

router
  .route("/:id")
  .get(validate(paramIdSchema), getCategory)
  .patch(upload.single("image"), validate(createCategorySchema), createCategory)
  .delete(validate(paramIdSchema), deleteCategroy);

export default router;
