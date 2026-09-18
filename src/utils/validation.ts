/**
 * Input Validation Utilities using Zod
 */

import { z, ZodError, ZodSchema } from 'zod';
import { ValidationError } from './errors.js';

/**
 * Validate data against a Zod schema and throw ValidationError on failure
 */
export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      throw new ValidationError(
        `Validation failed: ${errors.map((e) => `${e.field}: ${e.message}`).join(', ')}`,
        errors
      );
    }

    throw new ValidationError('Unknown validation error');
  }
}

/**
 * Validate data against a Zod schema and return result
 */
export function validateSafe<T>(
  schema: ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Array<{ field: string; message: string }> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return { success: false, errors };
}

/**
 * Validate site URL format
 */
export function isValidSiteUrl(siteUrl: string): boolean {
  try {
    const url = new URL(siteUrl);
    // Site URLs typically end with a trailing slash
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Normalize site URL to ensure it matches Search Console format
 */
export function normalizeSiteUrl(siteUrl: string): string {
  try {
    const url = new URL(siteUrl);
    // Search Console URLs typically end with /
    let normalized = `${url.protocol}//${url.host}${url.pathname}`;
    if (!normalized.endsWith('/')) {
      normalized += '/';
    }
    return normalized;
  } catch {
    return siteUrl;
  }
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function isValidDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
