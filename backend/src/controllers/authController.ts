import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { IUser, User } from "../models/userModel";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/appError";
import { promisify } from "util";

import { Email } from "../utils/email";
import crypto from "crypto";
interface TokenPayload extends jwt.JwtPayload {
  id: string;
  iat: number;
}

const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "90d") as any;
const cookieExpiresInDays = Number(process.env.JWT_COOKIE_EXPIRES_IN) || 90;
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
    expires: new Date(Date.now() + cookieExpiresInDays * 24 * 60 * 60 * 1000),
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
    console.log("[SIGNUP STARTED-----------]");
    console.log(req.body, "BODDDY");
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

    const isCorrectPassword = await user.isCorrectPassword(
      password,
      user.password as string,
    );
    console.log(isCorrectPassword, password, "AYOOOOO");
    if (!isCorrectPassword)
      return next(new AppError("Incorrect password", 400));
    createSendToken(user, 200, res);
  },
);

export const logout = catchAsync(
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
    console.log(isChanged, "IS CHANGGEEDDDD");
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

export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("[FORGOT PASSWORD STARTED]");

    const { email } = req.body;

    const userByEmail = await User.findOne({ email }).select("-password");

    if (!userByEmail)
      return next(
        new AppError(
          "User doesn't exist, Please make sure your email is correct",
          404,
        ),
      );

    const resetToken = userByEmail.createPasswordResetToken();
    await userByEmail.save({ validateBeforeSave: false });

    try {
      const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;
      await new Email(userByEmail, resetURL).sendPasswordResetToken();
      console.log(`TOKEN URL: ${resetURL}`);
      console.log("[FORGOT PASSWORD ENDED]");
      res.status(200).json({
        status: "success",
        message: "Token sent to your email!",
      });
    } catch (err: any) {
      // 4. If email fails, reset the token fields in the DB (Cleanup)
      userByEmail.passwordResetToken = undefined;
      userByEmail.passwordResetExpires = undefined;
      await userByEmail.save({ validateBeforeSave: false });

      return next(
        new AppError(
          "There was an error sending the email. Try again later!",
          500,
        ),
      );
    }
  },
);

export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(`[RESET CONTROLLER STARTED]`);

    const unHashedToken = req.params.token as string;
    const { password } = req.body;
    if (!unHashedToken) return next(new AppError("Invaild reset token", 400));

    const hashedToken = crypto
      .createHash("sh256")
      .update(unHashedToken)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If the token is not expired, and there is user, set the new password

    if (!user)
      return next(new AppError("Token is invalid or has expired", 400));

    user.password = password;
    user.passwordChangedAt = new Date(Date.now());
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    console.log(`UPDATED USER: ${user}`);
    console.log(`[RESET CONTROLLER ENDED]`);
    createSendToken(user, 200, res);
  },
);

export const updatePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("[UPDATED PASSWORD STARTED]");
    const user = req.user as IUser;
    const { password, currentPassword } = req.body;

    const currentUser = await User.findById(user.id).select("+password");

    if (!currentUser)
      return next(
        new AppError("User not found, Please make usre you are logged in", 404),
      );

    const isCorrectPassword = await user.isCorrectPassword(
      currentPassword,
      currentUser.password!,
    );

    if (!isCorrectPassword)
      return next(new AppError("current pasword is incorrect", 401));

    currentUser.password = password;

    await currentUser.save();

    // You are sending the user with the password here i think, you need to double check that.
    console.log(`UPDATED USER: ${currentUser}`);
    console.log("[UPDATED PASSWORD ENDED]");
    createSendToken(currentUser, 200, res);
  },
);
