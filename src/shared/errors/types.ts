/**
 * 2ndLife — Domain error types
 * Services throw AppError; route handlers catch and format.
 */

export type AppErrorCode =
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "DATABASE_NOT_CONFIGURED"
  | "TENANT_ISOLATION"
  | "IDEMPOTENT"
  | "INTERNAL";

export class AppError extends Error {
  constructor(
    public code: AppErrorCode,
    message: string,
    public status = 400
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function toErrorResponse(err: unknown) {
  if (err instanceof AppError) {
    return {
      error: {
        code: err.code,
        message: err.message,
      },
      status: err.status,
    };
  }
  console.error("[2ndlife] unexpected error:", err);
  return {
    error: {
      code: "INTERNAL" as AppErrorCode,
      message: "An unexpected error occurred",
    },
    status: 500,
  };
}
