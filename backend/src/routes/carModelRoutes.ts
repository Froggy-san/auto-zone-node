import express from "express";
import { createCarModel } from "../controllers/carModelController";

const router = express.Router();

router.route("/").post(createCarModel);

export default router;
