export enum HttpCode {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export class AppError extends Error {
  public readonly statusCode: HttpCode;
  public readonly isOperational: boolean;
  public readonly status: string;
  public readonly errorCode?: string; // e.g. 'CAR_NOT_FOUND'

  constructor(
    message: string,
    statusCode: HttpCode,
    errorCode?: string,
    isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = isOperational;
    this.errorCode = errorCode;

    Error.captureStackTrace(this, this.constructor);
  }
}
