export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly details?: ValidationErrorDetail[];
  public readonly isOperational: true;

  constructor(
    statusCode: number,
    message: string,
    errorCode: string = 'ERROR',
    details?: ValidationErrorDetail[]
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(
    message: string,
    errorCode: string = 'BAD_REQUEST',
    details?: ValidationErrorDetail[]
  ): ApiError {
    return new ApiError(400, message, errorCode, details);
  }

  static unauthorized(message = 'Unauthorized', errorCode: string = 'UNAUTHORIZED'): ApiError {
    return new ApiError(401, message, errorCode);
  }

  static forbidden(message = 'Forbidden', errorCode: string = 'FORBIDDEN'): ApiError {
    return new ApiError(403, message, errorCode);
  }

  static notFound(message = 'Resource not found', errorCode: string = 'NOT_FOUND'): ApiError {
    return new ApiError(404, message, errorCode);
  }

  static conflict(message: string, errorCode: string = 'CONFLICT'): ApiError {
    return new ApiError(409, message, errorCode);
  }

  static internal(message = 'Internal server error', errorCode: string = 'INTERNAL_ERROR'): ApiError {
    return new ApiError(500, message, errorCode);
  }
}

export default ApiError;
