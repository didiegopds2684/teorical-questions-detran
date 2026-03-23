import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { getEnv } from "../config/env.js";
import { isHttpError } from "./http-error.js";

export type ErrorBody = {
  error: {
    code: string;
    message: string;
    details: unknown;
  };
};

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const env = getEnv();

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request parameters",
        details: err.flatten(),
      },
    } satisfies ErrorBody);
    return;
  }

  if (isHttpError(err)) {
    res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details ?? null,
      },
    } satisfies ErrorBody);
    return;
  }

  console.error(err);
  const message =
    env.NODE_ENV === "production" ? "Internal server error" : (err as Error)?.message ?? "Unknown error";
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message,
      details: env.NODE_ENV === "production" ? null : { raw: String(err) },
    },
  } satisfies ErrorBody);
}

export function asyncHandler<T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    void fn(req, res, next).catch(next);
  };
}
