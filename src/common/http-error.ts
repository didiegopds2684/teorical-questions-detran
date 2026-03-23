export type ErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "INTERNAL_ERROR";

export class HttpError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly details: unknown;

  constructor(
    status: number,
    code: ErrorCode,
    message: string,
    details: unknown = undefined,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function isHttpError(err: unknown): err is HttpError {
  return err instanceof HttpError;
}
