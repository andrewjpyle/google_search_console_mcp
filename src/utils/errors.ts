/**
 * Custom Error Classes for Google Search Console API
 */

export class GoogleSearchConsoleError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'GoogleSearchConsoleError';
    Object.setPrototypeOf(this, GoogleSearchConsoleError.prototype);
  }
}

export class AuthenticationError extends GoogleSearchConsoleError {
  constructor(message: string) {
    super(message, 401);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class AuthorizationError extends GoogleSearchConsoleError {
  constructor(message: string) {
    super(message, 403);
    this.name = 'AuthorizationError';
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

export class RateLimitError extends GoogleSearchConsoleError {
  constructor(
    message: string,
    public retryAfter: number = 60
  ) {
    super(message, 429);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

export class ValidationError extends GoogleSearchConsoleError {
  constructor(
    message: string,
    public errors?: Array<{ field: string; message: string }>
  ) {
    super(message, 400);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NetworkError extends GoogleSearchConsoleError {
  constructor(message: string, originalError?: unknown) {
    super(message, 503, originalError);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class APIError extends GoogleSearchConsoleError {
  constructor(message: string, statusCode?: number, originalError?: unknown) {
    super(message, statusCode, originalError);
    this.name = 'APIError';
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

/**
 * Parse Google Search Console API errors into typed error classes
 */
export function parseGoogleSearchConsoleError(error: unknown): GoogleSearchConsoleError {
  if (error instanceof GoogleSearchConsoleError) {
    return error;
  }

  const errorObj = error as Record<string, unknown>;
  const message = String(errorObj?.message || errorObj?.toString?.() || 'Unknown error');
  const statusCode = Number(errorObj?.code || errorObj?.status || errorObj?.statusCode);

  // Check for authentication errors
  if (statusCode === 401 || message.toLowerCase().includes('authentication')) {
    return new AuthenticationError(message);
  }

  // Check for authorization errors
  if (statusCode === 403 || message.toLowerCase().includes('permission')) {
    return new AuthorizationError(message);
  }

  // Check for rate limit errors
  if (statusCode === 429 || message.toLowerCase().includes('rate limit')) {
    const headers = (errorObj?.headers || {}) as Record<string, string>;
    const retryAfter = parseInt(String(headers['retry-after'] || '60'), 10);
    return new RateLimitError(message, retryAfter);
  }

  // Check for validation errors
  if (statusCode === 400 || message.toLowerCase().includes('invalid')) {
    return new ValidationError(message);
  }

  // Check for network errors
  if (
    message.toLowerCase().includes('network') ||
    message.toLowerCase().includes('timeout') ||
    message.toLowerCase().includes('econnrefused')
  ) {
    return new NetworkError(message, error);
  }

  // Default to generic API error
  return new APIError(message, statusCode, error);
}
