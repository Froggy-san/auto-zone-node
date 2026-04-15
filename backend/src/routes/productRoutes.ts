import express from "express";
import { createProduct } from "../controllers/productController";
const router = express.Router();

router.route("/").post(createProduct);

export default router;
