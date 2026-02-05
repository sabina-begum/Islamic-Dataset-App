// Comprehensive error handling system with proper TypeScript types

// Specific error context interface
interface ErrorContext {
  userId?: string;
  action?: string;
  timestamp?: number;
  component?: string;
  route?: string;
  userAgent?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface AppError {
  id: string;
  message: string;
  code: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: number;
  context?: ErrorContext;
  retryable: boolean;
  retryCount: number;
  maxRetries: number;
}

// Error codes
export const ERROR_CODES = {
  NETWORK_ERROR: "NETWORK_ERROR",
  AUTH_ERROR: "AUTH_ERROR",
  DATA_LOAD_ERROR: "DATA_LOAD_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  PERMISSION_ERROR: "PERMISSION_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

// Error handler class
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errors: Map<string, AppError> = new Map();
  private listeners: Set<(error: AppError) => void> = new Set();

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Create a new error
  createError(
    message: string,
    code: string = ERROR_CODES.UNKNOWN_ERROR,
    severity: keyof typeof ERROR_SEVERITY = "MEDIUM",
    context?: ErrorContext,
    retryable: boolean = false,
    maxRetries: number = 3
  ): AppError {
    const error: AppError = {
      id: this.generateErrorId(),
      message,
      code,
      severity: ERROR_SEVERITY[severity],
      timestamp: Date.now(),
      context,
      retryable,
      retryCount: 0,
      maxRetries,
    };

    this.errors.set(error.id, error);
    this.notifyListeners(error);
    this.logError(error);

    return error;
  }

  // Retry an operation
  async retryOperation<T>(
    operation: () => Promise<T>,
    errorId: string,
    delay: number = 1000
  ): Promise<T> {
    const error = this.errors.get(errorId);
    if (!error || !error.retryable || error.retryCount >= error.maxRetries) {
      throw new Error(`Operation failed: ${error?.message || "Unknown error"}`);
    }

    try {
      // Wait before retry
      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(2, error.retryCount))
      );

      // Increment retry count
      error.retryCount++;
      this.errors.set(errorId, error);

      // Attempt operation
      return await operation();
    } catch (err) {
      if (error.retryCount >= error.maxRetries) {
        error.message = `Operation failed after ${error.maxRetries} retries: ${error.message}`;
        this.errors.set(errorId, error);
      }
      throw err;
    }
  }

  // Handle network errors
  async handleNetworkError<T>(
    operation: () => Promise<T>,
    context?: ErrorContext
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const appError = this.createError(
        error instanceof Error ? error.message : "Network error occurred",
        ERROR_CODES.NETWORK_ERROR,
        "HIGH",
        context,
        true,
        3
      );

      // Try to retry the operation
      return await this.retryOperation(operation, appError.id);
    }
  }

  // Handle authentication errors
  handleAuthError(error: Error | unknown, context?: ErrorContext): AppError {
    const message =
      error instanceof Error ? error.message : "Authentication error";
    return this.createError(
      message,
      ERROR_CODES.AUTH_ERROR,
      "HIGH",
      context,
      false
    );
  }

  // Handle data loading errors
  handleDataLoadError(
    error: Error | unknown,
    dataType: string,
    context?: ErrorContext
  ): AppError {
    const message =
      error instanceof Error ? error.message : "Data loading error";
    return this.createError(
      `${message} for ${dataType}`,
      ERROR_CODES.DATA_LOAD_ERROR,
      "MEDIUM",
      { ...context, dataType },
      true,
      2
    );
  }

  // Handle validation errors
  handleValidationError(
    field: string,
    message: string,
    context?: ErrorContext
  ): AppError {
    return this.createError(
      `Validation error in ${field}: ${message}`,
      ERROR_CODES.VALIDATION_ERROR,
      "LOW",
      { ...context, field },
      false
    );
  }

  // Handle permission errors
  handlePermissionError(permission: string, context?: ErrorContext): AppError {
    return this.createError(
      `Permission denied: ${permission}`,
      ERROR_CODES.PERMISSION_ERROR,
      "HIGH",
      { ...context, permission },
      false
    );
  }

  // Subscribe to error events
  subscribe(listener: (error: AppError) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Get all errors
  getErrors(): AppError[] {
    return Array.from(this.errors.values());
  }

  // Clear all errors
  clearErrors(): void {
    this.errors.clear();
  }

  // Clear old errors
  clearOldErrors(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - maxAge;
    for (const [id, error] of this.errors.entries()) {
      if (error.timestamp < cutoff) {
        this.errors.delete(id);
      }
    }
  }

  // Private methods
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private notifyListeners(error: AppError): void {
    this.listeners.forEach((listener) => {
      try {
        listener(error);
      } catch (err) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error("Error in error listener:", err);
        }
      }
    });
  }

  private logError(error: AppError): void {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error("App Error:", {
        id: error.id,
        message: error.message,
        code: error.code,
        severity: error.severity,
        context: error.context,
        timestamp: new Date(error.timestamp).toISOString(),
      });
    }
  }
}

// Create singleton instance
const errorHandler = ErrorHandler.getInstance();

// Export convenience functions with proper types
export const createNetworkError = (message: string, context?: ErrorContext) =>
  errorHandler.createError(
    message,
    ERROR_CODES.NETWORK_ERROR,
    "HIGH",
    context,
    true
  );

export const createAuthError = (message: string, context?: ErrorContext) =>
  errorHandler.createError(message, ERROR_CODES.AUTH_ERROR, "HIGH", context);

export const createDataLoadError = (message: string, context?: ErrorContext) =>
  errorHandler.createError(
    message,
    ERROR_CODES.DATA_LOAD_ERROR,
    "MEDIUM",
    context,
    true
  );

export const createValidationError = (
  message: string,
  context?: ErrorContext
) =>
  errorHandler.createError(
    message,
    ERROR_CODES.VALIDATION_ERROR,
    "LOW",
    context
  );

export const createPermissionError = (
  message: string,
  context?: ErrorContext
) =>
  errorHandler.createError(
    message,
    ERROR_CODES.PERMISSION_ERROR,
    "HIGH",
    context
  );

export { errorHandler };
export type { ErrorContext };
