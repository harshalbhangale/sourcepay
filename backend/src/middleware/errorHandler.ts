import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types";
import { HTTP_STATUS, ERROR_MESSAGES } from "../utils/constants";
import { logger } from "../utils/logger";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error("Error occurred:", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      error: err.message,
    };
    return res.status(err.statusCode).json(response);
  }

  // Default to 500 server error
  const response: ApiResponse = {
    success: false,
    error: ERROR_MESSAGES.INTERNAL_ERROR,
  };
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response);
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
