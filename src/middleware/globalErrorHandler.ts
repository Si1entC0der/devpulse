import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import AppError from "../utils/AppError";

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = "Internal Server Error";
  let errors: any = err;

  if (err instanceof AppError || err.statusCode) {
    statusCode = err.statusCode || 500;
    message = err.message;
  } else if (err?.code === "23505") {
    // Postgres unique constraint violation
    statusCode = StatusCodes.BAD_REQUEST;
    message = "Duplicate value entered";
  } else if (err instanceof Error) {
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export default globalErrorHandler;
