/**
 * Batch Operation Utilities
 * Provides framework for processing multiple operations concurrently with rate limiting
 */

import { logger } from './logger.js';

export interface BatchResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  index: number;
}

export interface BatchSummary<T> {
  total: number;
  succeeded: number;
  failed: number;
  success_rate: number;
  results: Array<BatchResult<T>>;
  execution_time_ms: number;
}

export interface BatchOptions {
  maxConcurrent?: number;
  continueOnError?: boolean;
  logProgress?: boolean;
}

/**
 * Process an array of items in batches with controlled concurrency
 *
 * @param items - Array of items to process
 * @param processor - Async function to process each item
 * @param options - Batch processing options
 * @returns Batch summary with results
 */
export async function processBatch<TInput, TOutput>(
  items: TInput[],
  processor: (item: TInput, index: number) => Promise<TOutput>,
  options: BatchOptions = {}
): Promise<BatchSummary<TOutput>> {
  const {
    maxConcurrent = 5,
    continueOnError = true,
    logProgress = true,
  } = options;

  const startTime = Date.now();
  const results: Array<BatchResult<TOutput>> = [];

  // Process items in chunks based on max concurrent limit
  for (let i = 0; i < items.length; i += maxConcurrent) {
    const chunk = items.slice(i, i + maxConcurrent);
    const chunkStart = i;

    const chunkPromises = chunk.map(async (item, chunkIndex) => {
      const itemIndex = chunkStart + chunkIndex;

      try {
        const data = await processor(item, itemIndex);

        const result: BatchResult<TOutput> = {
          success: true,
          data,
          index: itemIndex,
        };

        if (logProgress) {
          logger.info(`Batch item ${itemIndex + 1}/${items.length} succeeded`);
        }

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        const result: BatchResult<TOutput> = {
          success: false,
          error: errorMessage,
          index: itemIndex,
        };

        logger.error(`Batch item ${itemIndex + 1}/${items.length} failed`, {
          error: errorMessage,
        });

        if (!continueOnError) {
          throw error;
        }

        return result;
      }
    });

    const chunkResults = await Promise.all(chunkPromises);
    results.push(...chunkResults);
  }

  const succeeded = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const executionTime = Date.now() - startTime;

  const summary: BatchSummary<TOutput> = {
    total: items.length,
    succeeded,
    failed,
    success_rate: items.length > 0 ? succeeded / items.length : 0,
    results,
    execution_time_ms: executionTime,
  };

  logger.info('Batch processing completed', {
    total: summary.total,
    succeeded: summary.succeeded,
    failed: summary.failed,
    success_rate: `${(summary.success_rate * 100).toFixed(2)}%`,
    execution_time_ms: summary.execution_time_ms,
  });

  return summary;
}

/**
 * Split batch results into succeeded and failed arrays
 */
export function splitBatchResults<T>(
  summary: BatchSummary<T>
): {
  succeeded: Array<{ index: number; data: T }>;
  failed: Array<{ index: number; error: string }>;
} {
  const succeeded = summary.results
    .filter((r) => r.success && r.data !== undefined)
    .map((r) => ({
      index: r.index,
      data: r.data!,
    }));

  const failed = summary.results
    .filter((r) => !r.success && r.error !== undefined)
    .map((r) => ({
      index: r.index,
      error: r.error!,
    }));

  return { succeeded, failed };
}
