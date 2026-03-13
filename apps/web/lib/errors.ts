/**
 * Error handling utilities for consistent error management across the application.
 * Provides helper functions for formatting, classifying, and handling errors.
 */

/**
 * Error types classification
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  DATABASE = 'DATABASE',
  UNKNOWN = 'UNKNOWN',
  CACHE = 'CACHE',
}

/**
 * Enhanced error interface with metadata
 */
export interface AppError extends Error {
  type: ErrorType;
  statusCode?: number;
  details?: any;
  retryable?: boolean;
  userMessage?: string;
  technicalMessage?: string;
}

/**
 * Classify an error based on its properties or message
 */
export function classifyError(error: any): ErrorType {
  if (!error) return ErrorType.UNKNOWN;

  // Check if it's an AppError already
  if (error.type && Object.values(ErrorType).includes(error.type as ErrorType)) {
    return error.type as ErrorType;
  }

  const message = (error.message || '').toLowerCase();
  const statusCode = error.statusCode || error.code;

  // Network errors
  if (statusCode === 0 || 
      message.includes('network') || 
      message.includes('fetch') || 
      message.includes('econnrefused') ||
      message.includes('timeout')) {
    return ErrorType.NETWORK;
  }

  // Validation errors (400)
  if (statusCode === 400 || message.includes('validation') || message.includes('invalid')) {
    return ErrorType.VALIDATION;
  }

  // Authentication errors (401)
  if (statusCode === 401 || message.includes('unauthorized') || message.includes('authentication')) {
    return ErrorType.AUTHENTICATION;
  }

  // Authorization errors (403)
  if (statusCode === 403 || message.includes('forbidden') || message.includes('permission')) {
    return ErrorType.AUTHORIZATION;
  }

  // Not found errors (404)
  if (statusCode === 404 || message.includes('not found')) {
    return ErrorType.NOT_FOUND;
  }

  // Cache errors
  if (message.includes('cache') || message.includes('redis')) {
    return ErrorType.CACHE;
  }

  // Server errors (5xx)
  if (statusCode >= 500 || message.includes('server error') || message.includes('internal')) {
    return ErrorType.SERVER;
  }

  // Database errors
  if (message.includes('database') || message.includes('prisma') || message.includes('sql')) {
    return ErrorType.DATABASE;
  }

  return ErrorType.UNKNOWN;
}

/**
 * Create a standardized AppError from any error
 */
export function createAppError(
  error: any,
  options?: {
    type?: ErrorType;
    statusCode?: number;
    userMessage?: string;
    details?: any;
    retryable?: boolean;
  }
): AppError {
  const type = options?.type || classifyError(error);
  const statusCode = options?.statusCode || error.statusCode || error.code;

  const appError: AppError = {
    message: error.message || 'An error occurred',
    name: error.name || 'AppError',
    stack: error.stack,
    type,
    statusCode,
    details: options?.details || error.details,
    retryable: options?.retryable ?? isRetryable(type, statusCode),
    userMessage: options?.userMessage || getDefaultUserMessage(type),
    technicalMessage: error.message,
  };

  return appError;
}

/**
 * Determine if an error is retryable
 */
export function isRetryable(type: ErrorType, statusCode?: number): boolean {
  // Network errors and server errors are usually retryable
  if (type === ErrorType.NETWORK || type === ErrorType.SERVER || type === ErrorType.CACHE) {
    return true;
  }

  // 5xx errors are retryable
  if (statusCode && statusCode >= 500) {
    return true;
  }

  // 429 (rate limit) should not be retried immediately
  if (statusCode === 429) {
    return false;
  }

  return false;
}

/**
 * Get default user-friendly message for error type
 */
export function getDefaultUserMessage(type: ErrorType): string {
  const messages = {
    [ErrorType.NETWORK]: 'Network error. Please check your internet connection and try again.',
    [ErrorType.VALIDATION]: 'Invalid data provided. Please check your input.',
    [ErrorType.AUTHENTICATION]: 'Authentication required. Please log in.',
    [ErrorType.AUTHORIZATION]: 'You do not have permission to perform this action.',
    [ErrorType.NOT_FOUND]: 'The requested resource was not found.',
    [ErrorType.SERVER]: 'Server error. Please try again later.',
    [ErrorType.DATABASE]: 'Database error. Please try again.',
    [ErrorType.CACHE]: 'Cache error. Service temporarily unavailable.',
    [ErrorType.UNKNOWN]: 'An unexpected error occurred. Please try again.',
  };

  return messages[type] || messages[ErrorType.UNKNOWN];
}

/**
 * Format error for API response
 */
export function formatErrorResponse(
  error: any,
  options?: {
    includeStackTrace?: boolean;
    includeDetails?: boolean;
  }
) {
  const appError = createAppError(error);
  const response: any = {
    error: {
      message: appError.userMessage || appError.message,
      type: appError.type,
      retryable: appError.retryable,
    },
  };

  if (options?.includeStackTrace && process.env.NODE_ENV === 'development') {
    response.error.stack = appError.stack;
  }

  if (options?.includeDetails && appError.details) {
    response.error.details = appError.details;
  }

  return response;
}

/**
 * Safe stringify error for logging
 */
export function stringifyError(error: any): string {
  try {
    return JSON.stringify({
      message: error.message,
      name: error.name,
      stack: error.stack,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
    });
  } catch (e) {
    return String(error);
  }
}
