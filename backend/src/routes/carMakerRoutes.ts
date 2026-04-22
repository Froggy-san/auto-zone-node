import express from "express";
import {
  createCarMaker,
  getCarMaker,
  getCarMakers,
  upload,
} from "../controllers/carMakerController";
import { validate } from "../middleware/validateMiddleware";
import { createCarMakerSchema } from "../validators/carMakerValidator";
import { paramIdSchema } from "../validators/commen";

const router = express.Router();

router
  .route("/")
  .get(getCarMakers)
  .post(upload.single("logo"), validate(createCarMakerSchema), createCarMaker);

router.use(validate(paramIdSchema));

router
  .route("/:id")
  .get(getCarMaker)
  .patch(upload.single("logo"), validate(createCarMakerSchema), createCarMaker);

export default router;
