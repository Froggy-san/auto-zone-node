import { Request, Response, NextFunction } from "express";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // 1. Handle Zod Validation Errors
  if (err.name === "ZodError") {
    console.log(err, "SSSSSSSSSS");
    return res.status(400).json({
      status: "fail",
      message: "Invalid input data",
      errors: err.errors.map((e: any) => ({
        path: e.path[1], // e.g., "listPrice"
        message: e.message,
      })),
    });
  }

  // 2. Handle Mongoose Validation Errors (e.g., salePrice < listPrice)
  if (err.name === "ValidationError") {
    console.log(err, "EEEEEEEEEE");
    const errors = Object.values(err.errors).map((el: any) => el.message);
    return res.status(400).json({
      status: "fail",
      message: `Invalid input data: ${errors.join(". ")}`,
    });
  }

  // 3. Handle Mongoose Duplicate Key Errors (e.g., same license plate)
  if (err.code === 11000) {
    const value = Object.values(err.keyValue)[0];
    return res.status(400).json({
      status: "fail",
      message: `Duplicate field value: "${value}". Please use another value!`,
    });
  }

  console.log(`📛📛 Error 📛📛: ${err}`);
  // 4. Default Fallback
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

// function globalErrorHandler  (err, req, res, next)  {
//   // console.log(err.stack); // ! Stack trace, tells you where the error happened,

//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || 'error';

//   if (process.env.NODE_ENV === 'development') {
//     sendErrorDev(err, req, res);
//   } else if (process.env.NODE_ENV === 'production') {
//     let error = { ...err };
//     error.message = err.message;

//     if (error.name === 'CastError') error = handleCastErrorDB(error);
//     if (error.code === 11000) error = handleDuplicateFieldsDB(error);
//     if (error.name === 'ValidationError')
//       error = handleValidationErrorDB(error);
//     if (error.name === 'JsonWebTokenError') error = handleJWTError();
//     if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

//     sendErrorProd(error, req, res);
//   }
// };
