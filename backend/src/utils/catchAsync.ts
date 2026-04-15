import { Request, Response, NextFunction } from "express";

/**
 * catchAsync is a Higher-Order Function (HOF).
 * It takes your async controller function as an argument and
 * returns a new function that Express will actually execute.
 */
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // We execute the controller function (fn).
    // Since it's async, it returns a Promise.
    // If that Promise rejects, .catch(next) automatically sends
    // the error to your Global Error Handler.
    fn(req, res, next).catch(next);
  };
};
