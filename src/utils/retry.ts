/**
 * Retry Logic with Exponential Backoff
 */

import { logger } from './logger.js';
import { NetworkError, RateLimitError } from './errors.js';

export interface RetryOptions {
  maxAttempts?: number;
  backoffMs?: number;
  retryableErrors?: Array<new (...args: any[]) => Error>;
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_RETRYABLE_ERRORS = [NetworkError, RateLimitError];

/**
 * Delay helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
function shouldRetry(
  error: unknown,
  retryableErrors: Array<new (...args: any[]) => Error> = DEFAULT_RETRYABLE_ERRORS
): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return retryableErrors.some((ErrorClass) => error instanceof ErrorClass);
}

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    backoffMs = 1000,
    retryableErrors = DEFAULT_RETRYABLE_ERRORS,
    onRetry,
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // If this is the last attempt, throw the error
      if (attempt === maxAttempts) {
        throw error;
      }

      // Check if error is retryable
      if (!shouldRetry(error, retryableErrors)) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = backoffMs * Math.pow(2, attempt - 1);

      // Log retry attempt
      logger.warn(`Retry attempt ${attempt}/${maxAttempts} after ${delay}ms`, {
        error: error instanceof Error ? error.message : String(error),
        attempt,
        maxAttempts,
        delay,
      });

      // Call retry callback if provided
      if (onRetry && error instanceof Error) {
        onRetry(attempt, error);
      }

      // Wait before retrying
      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError;
}
