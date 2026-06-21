import { ERROR_CODES, type ErrorCode } from '@carrymate/shared';

/**
 * Application error carrying an HTTP status and a stable error code.
 * Throw these from services/controllers; the error middleware formats them.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode | string;
  public readonly details?: Record<string, string[]>;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    code: ErrorCode | string,
    message: string,
    details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: Record<string, string[]>): AppError {
    return new AppError(400, ERROR_CODES.VALIDATION_ERROR, message, details);
  }

  static unauthorized(code: ErrorCode | string = ERROR_CODES.NO_TOKEN, message = 'Unauthorized') {
    return new AppError(401, code, message);
  }

  static forbidden(message = 'Forbidden', code: ErrorCode | string = ERROR_CODES.FORBIDDEN) {
    return new AppError(403, code, message);
  }

  static notFound(message = 'Resource not found') {
    return new AppError(404, ERROR_CODES.NOT_FOUND, message);
  }

  static internal(message = 'Something went wrong') {
    return new AppError(500, ERROR_CODES.INTERNAL_ERROR, message);
  }
}
