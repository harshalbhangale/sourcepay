import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { AppError } from "./errorHandler";
import { HTTP_STATUS, ERROR_MESSAGES } from "../utils/constants";

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        next(
          new AppError(HTTP_STATUS.BAD_REQUEST, JSON.stringify(errorMessages))
        );
      } else {
        next(
          new AppError(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.VALIDATION_ERROR)
        );
      }
    }
  };
};
