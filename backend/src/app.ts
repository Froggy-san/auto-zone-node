import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import expressRateLimit from "express-rate-limit";
import helmet from "helmet";
import ExpressMongoSanitize from "express-mongo-sanitize";
import { globalErrorHandler } from "./controllers/errorController";

import path from "path";
import productRouter from "./routes/productRoutes";

import productBrandRouter from "./routes/productBrandRoutes";
import productTypeRouter from "./routes/productTypeRoutes";
import carMakerRouter from "./routes/carMakerRoutes";
import carModelRouter from "./routes/carModelRoutes";
import categoryRouter from "./routes/categoryRoutes";
import userRouter from "./routes/userRoutes";
import carRouter from "./routes/carRoutes";
import carGenerationRouter from "./routes/carGenerationRoutes";
import productSoldRoueter from "./routes/productSoldRoutes";
import serviceStatusesRouter from "./routes/serviceStatusRoutes";
import serviceFeesRouter from "./routes/serviceFeeRoutes";
import serviceRouter from "./routes/serviceRoute";
import supplierInvoicesRouter from "./routes/supplierInvoideRoutes";
import qs from "qs";
const app = express();
// Override Express default query parser with explicit, powerful native 'qs' parsing
// app.use((req, res, next) => {
//   if (req.url.includes("?")) {
//     const rawQuery = req.url.split("?")[1];
//     Object.defineProperty(req, "query", {
//       value: { ...qs.parse(rawQuery || "") },
//       writable: true,
//       configurable: true,
//       enumerable: true,
//     });
//     req.query = qs.parse(rawQuery || ""); // Perfectly rebuilds deep objects and arrays!
//   }
//   next();
// });
app.set("query parser", "extended"); // extends the queries
// // Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

const limiter = expressRateLimit({
  max: 100, // 100 request limit
  windowMs: 60 * 60 * 1000, // 100 per hour
  message: "Too many requests from this IP, please try again in an hour!",
});
// app.use("/api", limiter);
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Your React URL
    credentials: true, // The backend must also say "Yes, I allow cookies"
  }),
); // Crucial for your React frontend!
app.use(cookieParser());

app.use(express.json({ limit: "10kb" })); // Body parser

// Ensure this is in your app.ts
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// app.use(ExpressMongoSanitize());

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
app.use("/api/v1/carGenerations", carGenerationRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/cars", carRouter);

app.use("/api/v1/productSold", productSoldRoueter);
app.use("/api/v1/serviceFees", serviceFeesRouter);
app.use("/api/v1/serviceStatuses", serviceStatusesRouter);
app.use("/api/v1/services", serviceRouter);
app.use("/api/v1/supplierInvoices", supplierInvoicesRouter);
// 2) HEALTH CHECK ROUTE
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Auto-Zone API is running smoothly",
  });
});
app.use(globalErrorHandler);
export default app;
