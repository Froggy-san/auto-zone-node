import express from "express";
import { createMaker, getCarMakers } from "../controllers/carMakerController";
import { validate } from "../middleware/validateMiddleware";
import { createCarMakerSchema } from "../validators/carMakerValidator";

const router = express.Router();

router
  .route("/")
  .get(getCarMakers)
  .post(validate(createCarMakerSchema), createMaker);

export default router;
