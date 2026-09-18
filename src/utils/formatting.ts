/**
 * Response Formatting Utilities
 */

import { ToolResponse } from '../types/api.js';

/**
 * Format a successful response
 */
export function formatSuccess<T extends Record<string, unknown>>(data: T): ToolResponse {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

/**
 * Format an error response
 */
export function formatError(error: Error | string): ToolResponse {
  const message = typeof error === 'string' ? error : error.message;

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            error: message,
            timestamp: new Date().toISOString(),
          },
          null,
          2
        ),
      },
    ],
    isError: true,
  };
}

/**
 * Format percentage
 */
export function formatPercentage(value: number | string, decimals: number = 2): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return `${(numValue * 100).toFixed(decimals)}%`;
}

/**
 * Format number with commas
 */
export function formatNumber(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-US').format(numValue);
}

/**
 * Format position value (average ranking)
 */
export function formatPosition(position: number | string, decimals: number = 1): string {
  const numValue = typeof position === 'string' ? parseFloat(position) : position;
  return numValue.toFixed(decimals);
}

/**
 * Add timestamp to data
 */
export function withTimestamp<T extends Record<string, unknown>>(data: T): T & { timestamp: string } {
  return {
    ...data,
    timestamp: new Date().toISOString(),
  };
}
