import express, { Request, Response } from "express";

import morgan from "morgan";
import cors from "cors";
import expressRateLimit from "express-rate-limit";
import helmet from "helmet";
import ExpressMongoSanitize from "express-mongo-sanitize";
import { globalErrorHandler } from "./controllers/errorController";

import productRouter from "./routes/productRoutes";

import productBrandRouter from "./routes/productBrandRoutes";
import productTypeRouter from "./routes/productTypeRoutes";
import carMakerRouter from "./routes/carMakerRoutes";
import carModelRouter from "./routes/carModelRoutes";
import categoryRouter from "./routes/categoryRoutes";
import path from "path";
const app = express();

// Middlewares
app.use(helmet());

const limiter = expressRateLimit({
  max: 100, // 100 request limit
  windowMs: 60 * 60 * 1000, // 100 per hour
  message: "Too many requests from this IP, please try again in an hour!",
});

app.use("/api", limiter);
app.use(
  cors({
    origin: process.env.FRONTEND_URLs, // Your React URL
    credentials: true, // The backend must also say "Yes, I allow cookies"
  }),
); // Crucial for your React frontend!

app.use(express.json({ limit: "10kb" })); // Body parser

// app.use(ExpressMongoSanitize());

// 2) HEALTH CHECK ROUTE
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Auto-Zone API is running smoothly",
  });
});
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// This line tells Express: "If someone asks for /uploads, look inside the public/uploads folder"
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));
app.use("/api/v1/products", productRouter);
app.use("/api/v1/productBrands", productBrandRouter);
app.use("/api/v1/productTypes", productTypeRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/carMakers", carMakerRouter);
app.use("/api/v1/carModels", carModelRouter);
app.use(globalErrorHandler);
export default app;
