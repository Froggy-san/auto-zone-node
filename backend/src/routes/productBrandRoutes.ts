import express from "express";
import { createProductBrand } from "../controllers/productBrandController";

const router = express.Router();

router.route("/").post(createProductBrand);

export default router;
