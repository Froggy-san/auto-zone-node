import express, { Request, Response } from "express";

import morgan from "morgan";
import cors from "cors";
import expressRateLimit from "express-rate-limit";
import helmet from "helmet";
import ExpressMongoSanitize from "express-mongo-sanitize";

const app = express();

// Middlewares
app.use(helmet());

const limiter = expressRateLimit({
  max: 100, // 100 request limit
  windowMs: 60 * 60 * 1000, // 100 per hour
  message: "Too many requests from this IP, please try again in an hour!",
});

app.use("/api", limiter);
app.use(cors()); // Crucial for your React frontend!
app.use(express.json({ limit: "10kb" })); // Body parser
// Body parser
app.use(express.json({ limit: "10kb" }));
app.use(ExpressMongoSanitize());

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

export default app;
