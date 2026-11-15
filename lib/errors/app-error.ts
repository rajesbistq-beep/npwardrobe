import "server-only";

export type AppErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INSUFFICIENT_STOCK"
  | "INVALID_STATE_TRANSITION"
  | "PAYMENT_VERIFICATION_PENDING"
  | "DATABASE_ERROR"
  | "INTERNAL_ERROR";

const defaultStatus: Record<AppErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INSUFFICIENT_STOCK: 409,
  INVALID_STATE_TRANSITION: 409,
  PAYMENT_VERIFICATION_PENDING: 409,
  DATABASE_ERROR: 500,
  INTERNAL_ERROR: 500,
};

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;

  constructor(code: AppErrorCode, message: string, status = defaultStatus[code]) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }
}

/** Translate only known database states; never forward SQL text or details. */
export function fromDatabaseError(error: {
  code?: string;
  message?: string;
}): AppError {
  const message = error.message ?? "";
  if (message.includes("INSUFFICIENT_STOCK")) {
    return new AppError("INSUFFICIENT_STOCK", "One or more selected variants are no longer available.");
  }
  if (message.includes("INVALID_ORDER_TRANSITION")) {
    return new AppError("INVALID_STATE_TRANSITION", "That order status change is not allowed.");
  }
  if (message.includes("PAYMENT_VERIFICATION_PENDING") || message.includes("PAYMENT_NOT_ACCEPTING_A_NEW_SUBMISSION")) {
    return new AppError("PAYMENT_VERIFICATION_PENDING", "This payment is already being verified.");
  }
  if (message.includes("STOCK_RESERVATION_EXPIRED")) {
    return new AppError("CONFLICT", "The stock hold has expired. Contact customer support for assistance.");
  }
  if (message.includes("NOT_A_COD_PAYMENT") || message.includes("COD_COLLECTION_MUST_MATCH_OUTSTANDING_AMOUNT") || message.includes("COD_COLLECTION_REQUIRES_DELIVERED_ORDER")) {
    return new AppError("CONFLICT", "This Cash on Delivery collection is not currently allowed.");
  }
  if (message.includes("NOT_FOUND") || error.code === "P0002") {
    return new AppError("NOT_FOUND", "The requested record was not found.");
  }
  if (message.includes("FORBIDDEN") || error.code === "42501") {
    return new AppError("FORBIDDEN", "You are not allowed to perform this action.");
  }
  if (message.includes("IDEMPOTENCY_KEY_REUSED") || error.code === "23505") {
    return new AppError("CONFLICT", "This request conflicts with an earlier operation.");
  }
  if (error.code === "22023") {
    return new AppError("VALIDATION_ERROR", "The request is not valid.");
  }
  return new AppError("DATABASE_ERROR", "A database operation could not be completed.");
}

export function validationError(): AppError {
  return new AppError("VALIDATION_ERROR", "The request contains invalid input.");
}

export function throwDatabaseError(error: { code?: string; message?: string }): never {
  throw fromDatabaseError(error);
}
