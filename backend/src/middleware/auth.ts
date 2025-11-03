import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./errorHandler";
import { HTTP_STATUS, ERROR_MESSAGES } from "../utils/constants";
import { JWTPayload } from "../types";

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "default-secret";

    const decoded = jwt.verify(token, secret) as JWTPayload;
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(
        new AppError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.INVALID_SIGNATURE)
      );
    } else {
      next(error);
    }
  }
};
