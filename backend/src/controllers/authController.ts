import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { IUser, User } from "../models/userModel";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/appError";
import { promisify } from "util";

interface TokenPayload extends jwt.JwtPayload {
  id: string;
  iat: number;
}

const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "90d") as any;

const JWT_SECRET = process.env.JWT_SECRET!;
const signToken = (id: string): string => {
  return jwt.sign(
    { id },
    JWT_SECRET, // Exclamation mark ensures it's a string
    {
      expiresIn: JWT_EXPIRES_IN as any,
    },
  );
};
const createSendToken = (user: any, statusCode: number, res: Response) => {
  if (!JWT_EXPIRES_IN)
    throw new Error("Failed to get the expire date fron the env file.");

  const token = signToken(user.id);

  res.cookie("autoZoneToken", token, {
    expires: new Date(Date.now() + JWT_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
  });

  user.password = undefined;

  res.status(statusCode).json({
    status: "sccuess",
    token,
    data: { user },
  });
};

export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.create(req.body);

    if (!user)
      return next(new AppError(`Failed to signup, Please try agian`, 500));

    createSendToken(user, 201, res);
  },
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user)
      return next(new AppError(`No user found with that email: ${email}`, 404));

    const isCorrectPassword = user.isCorrectPassword(
      password,
      user.password as string,
    );
    if (!isCorrectPassword)
      return next(new AppError("Incorrect password", 400));
    createSendToken(user, 200, res);
  },
);

const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.cookie("autoZoneToken", "logged out", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({ status: "success", data: null });
  },
);

export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;
    const tokenFromCookie = req.cookies.autoZoneToken;

    let token = "";
    if (authorization && authorization.startsWith("Bearer")) {
      token = authorization.split(" ")[1] || "";
    } else if (tokenFromCookie) {
      token = tokenFromCookie;
    }

    if (!token)
      return next(
        new AppError(`unauthorized action please try to login again.`, 401),
      );

    const verifyToken = promisify(jwt.verify) as (
      token: string,
      secret: string,
    ) => Promise<jwt.JwtPayload>;

    const decoded = await verifyToken(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return next(new AppError(`User doesn't exist`, 401));

    // 2. Check if iat exists (Type Guard)
    if (!decoded.iat) {
      return next(
        new AppError("Invalid token payload: missing issuance time", 401),
      );
    }

    const isChanged = user.isPassChangedAfterJWT(decoded.iat);

    if (isChanged) {
      return next(
        new AppError(
          "User recently changed password! Please log in again.",
          401,
        ),
      );
    }

    req.user = user;

    next();
  },
);

export async function isLoggedIn(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.cookies.autoZoneToken;

    const verifyToken = promisify(jwt.verify) as (
      token: string,
      secret: string,
    ) => Promise<jwt.JwtPayload>;

    const decoded = await verifyToken(token, JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return next();

    if (!decoded.iat) return next();
    if (user.isPassChangedAfterJWT(decoded.iat)) return next();

    req.user = user;
    next();
  } catch (err: any) {
    next();
  }
}

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // 1. If no roles are specified, just let them through
    if (roles.length === 0) return next();

    // 2. Check if user exists (protect middleware must run before this)
    if (!req.user) {
      return next(new AppError("You are not logged in", 401));
    }

    // 3. Check if the user's role is allowed
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Unauthorized: This action is restricted to: ${roles.join(", ")}`,
          403, // 403 means "Forbidden" (you are logged in, but not allowed here)
        ),
      );
    }

    // 4. Success! Move to the next middleware/controller
    next();
  };
};
