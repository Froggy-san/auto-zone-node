import express from "express";
import { createProductType } from "../controllers/productTypeController";

const router = express.Router();

router.route("/").post(createProductType);

export default router;
