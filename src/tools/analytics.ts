/**
 * Search Analytics Tools
 */

import { getAPIClient } from '../api/client.js';
import { getAuthClient } from '../auth/client.js';
import { formatSuccess, formatError, withTimestamp, formatPercentage, formatPosition } from '../utils/formatting.js';
import { validate, formatDate } from '../utils/validation.js';
import { SearchAnalyticsRequestSchema, TopQueriesArgsSchema, TopPagesArgsSchema } from '../types/schemas.js';
import type { ToolResponse, SearchAnalyticsArgs, TopQueriesArgs, TopPagesArgs } from '../types/api.js';
import { logger } from '../utils/logger.js';

/**
 * Get search analytics data
 */
export async function searchAnalytics(args: SearchAnalyticsArgs): Promise<ToolResponse> {
  try {
    logger.info('Querying search analytics', { args });

    // Validate arguments
    validate(SearchAnalyticsRequestSchema, args);

    const authClient = await getAuthClient();
    const apiClient = await getAPIClient();

    // Use provided site_url or default
    const siteUrl = args.site_url || authClient.getDefaultSiteUrl();

    if (!siteUrl) {
      throw new Error('Site URL is required');
    }

    // Calculate dates
    let startDate = args.start_date;
    let endDate = args.end_date;

    if (startDate === '7daysAgo' || !startDate) {
      const date = new Date();
      date.setDate(date.getDate() - 7);
      startDate = formatDate(date);
    }

    if (endDate === 'today' || !endDate) {
      endDate = formatDate(new Date());
    }

    const response = await apiClient.querySearchAnalytics(siteUrl, {
      startDate,
      endDate,
      dimensions: args.dimensions || ['query'],
      rowLimit: args.row_limit || 100,
      searchType: args.search_type || 'web',
    });

    return formatSuccess(
      withTimestamp({
        rows: response.rows?.map((row) => ({
          keys: row.keys,
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr,
          position: row.position,
        })),
        responseAggregationType: response.responseAggregationType,
        rowCount: response.rows?.length || 0,
      })
    );
  } catch (error) {
    logger.error('Failed to query search analytics', error);
    return formatError(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Get top search queries
 */
export async function getTopQueries(args: TopQueriesArgs): Promise<ToolResponse> {
  try {
    logger.info('Getting top queries', { args });

    // Validate arguments
    validate(TopQueriesArgsSchema, args);

    const authClient = await getAuthClient();
    const apiClient = await getAPIClient();

    // Use provided site_url or default
    const siteUrl = args.site_url || authClient.getDefaultSiteUrl();

    if (!siteUrl) {
      throw new Error('Site URL is required');
    }

    const days = args.days || 28;
    const limit = args.limit || 50;

    const endDate = formatDate(new Date());
    const startDateObj = new Date();
    startDateObj.setDate(startDateObj.getDate() - days);
    const startDate = formatDate(startDateObj);

    const response = await apiClient.querySearchAnalytics(siteUrl, {
      startDate,
      endDate,
      dimensions: ['query'],
      rowLimit: limit,
      searchType: 'web',
    });

    return formatSuccess(
      withTimestamp({
        top_queries: response.rows?.map((row) => ({
          query: row.keys?.[0],
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr ? formatPercentage(row.ctr) : '0.00%',
          position: row.position ? formatPosition(row.position) : '0.0',
        })),
        period: `${days} days`,
        rowCount: response.rows?.length || 0,
      })
    );
  } catch (error) {
    logger.error('Failed to get top queries', error);
    return formatError(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Get top performing pages
 */
export async function getTopPages(args: TopPagesArgs): Promise<ToolResponse> {
  try {
    logger.info('Getting top pages', { args });

    // Validate arguments
    validate(TopPagesArgsSchema, args);

    const authClient = await getAuthClient();
    const apiClient = await getAPIClient();

    // Use provided site_url or default
    const siteUrl = args.site_url || authClient.getDefaultSiteUrl();

    if (!siteUrl) {
      throw new Error('Site URL is required');
    }

    const days = args.days || 28;
    const limit = args.limit || 50;

    const endDate = formatDate(new Date());
    const startDateObj = new Date();
    startDateObj.setDate(startDateObj.getDate() - days);
    const startDate = formatDate(startDateObj);

    const response = await apiClient.querySearchAnalytics(siteUrl, {
      startDate,
      endDate,
      dimensions: ['page'],
      rowLimit: limit,
      searchType: 'web',
    });

    return formatSuccess(
      withTimestamp({
        top_pages: response.rows?.map((row) => ({
          page: row.keys?.[0],
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr ? formatPercentage(row.ctr) : '0.00%',
          position: row.position ? formatPosition(row.position) : '0.0',
        })),
        period: `${days} days`,
        rowCount: response.rows?.length || 0,
      })
    );
  } catch (error) {
    logger.error('Failed to get top pages', error);
    return formatError(error instanceof Error ? error : new Error(String(error)));
  }
}
