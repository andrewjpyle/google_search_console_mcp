/**
 * Caching Utilities
 * Provides in-memory caching with TTL support for reducing API calls
 */

import NodeCache from 'node-cache';
import { logger } from './logger.js';

export interface CacheOptions {
  stdTTL?: number; // Standard TTL in seconds (default: 300 = 5 minutes)
  checkperiod?: number; // Check period for expired keys (default: 60 seconds)
  useClones?: boolean; // Clone values when getting/setting (default: true)
}

export class CacheManager {
  private cache: NodeCache;
  private readonly namespace: string;

  constructor(namespace: string, options: CacheOptions = {}) {
    this.namespace = namespace;
    this.cache = new NodeCache({
      stdTTL: options.stdTTL || 300,
      checkperiod: options.checkperiod || 60,
      useClones: options.useClones !== false,
    });

    // Log cache stats periodically
    setInterval(() => {
      const stats = this.cache.getStats();
      logger.debug(`Cache stats for ${this.namespace}`, stats);
    }, 300000); // Every 5 minutes
  }

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | undefined {
    const fullKey = this.makeKey(key);
    const value = this.cache.get<T>(fullKey);

    if (value !== undefined) {
      logger.debug(`Cache HIT: ${fullKey}`);
    } else {
      logger.debug(`Cache MISS: ${fullKey}`);
    }

    return value;
  }

  /**
   * Set a value in cache
   */
  set<T>(key: string, value: T, ttl?: number): boolean {
    const fullKey = this.makeKey(key);
    const success = this.cache.set(fullKey, value, ttl || 0);

    logger.debug(`Cache SET: ${fullKey}`, {
      success,
      ttl: ttl || 'default',
    });

    return success;
  }

  /**
   * Delete a value from cache
   */
  del(key: string): number {
    const fullKey = this.makeKey(key);
    const deleted = this.cache.del(fullKey);

    logger.debug(`Cache DEL: ${fullKey}`, { deleted });

    return deleted;
  }

  /**
   * Check if a key exists in cache
   */
  has(key: string): boolean {
    const fullKey = this.makeKey(key);
    return this.cache.has(fullKey);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.flushAll();
    logger.info(`Cache cleared for namespace: ${this.namespace}`);
  }

  /**
   * Get cache statistics
   */
  getStats(): NodeCache.Stats {
    return this.cache.getStats();
  }

  /**
   * Get or set pattern: fetch from cache, or compute and cache if miss
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);

    if (cached !== undefined) {
      return cached;
    }

    logger.debug(`Cache MISS - fetching: ${this.makeKey(key)}`);
    const value = await fetcher();
    this.set(key, value, ttl);

    return value;
  }

  /**
   * Invalidate cache entries matching a pattern
   */
  invalidatePattern(pattern: string): number {
    const keys = this.cache.keys();
    const matchingKeys = keys.filter((key) => key.includes(pattern));

    let deleted = 0;
    for (const key of matchingKeys) {
      deleted += this.cache.del(key);
    }

    logger.info(`Invalidated ${deleted} cache entries matching pattern: ${pattern}`);

    return deleted;
  }

  /**
   * Make a namespaced cache key
   */
  private makeKey(key: string): string {
    return `${this.namespace}:${key}`;
  }
}

// ==================== Global Cache Instances ====================

/**
 * Cache for account/customer data (1 hour TTL)
 */
export const accountCache = new CacheManager('accounts', {
  stdTTL: 3600,
});

/**
 * Cache for campaign/property lists (30 minutes TTL)
 */
export const resourceCache = new CacheManager('resources', {
  stdTTL: 1800,
});

/**
 * Cache for report data (5 minutes TTL)
 */
export const reportCache = new CacheManager('reports', {
  stdTTL: 300,
});

/**
 * Helper function to generate cache keys for reports
 */
export function makeReportCacheKey(params: {
  type: string;
  id: string;
  startDate: string;
  endDate: string;
  metrics?: string[];
  dimensions?: string[];
}): string {
  const metricsStr = params.metrics?.sort().join(',') || '';
  const dimensionsStr = params.dimensions?.sort().join(',') || '';

  return `${params.type}:${params.id}:${params.startDate}:${params.endDate}:${metricsStr}:${dimensionsStr}`;
}
