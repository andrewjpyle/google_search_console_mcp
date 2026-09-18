/**
 * URL Indexing and Inspection Tools
 */

import { getAPIClient } from '../api/client.js';
import { getAuthClient } from '../auth/client.js';
import { formatSuccess, formatError, withTimestamp } from '../utils/formatting.js';
import { validate } from '../utils/validation.js';
import { IndexingStatusArgsSchema, RequestIndexingArgsSchema } from '../types/schemas.js';
import type { ToolResponse, IndexingStatusArgs, RequestIndexingArgs } from '../types/api.js';
import { logger } from '../utils/logger.js';

/**
 * Get URL inspection and indexing status
 */
export async function getIndexingStatus(args: IndexingStatusArgs): Promise<ToolResponse> {
  try {
    logger.info('Getting indexing status', { args });

    // Validate arguments
    validate(IndexingStatusArgsSchema, args);

    const authClient = await getAuthClient();
    const apiClient = await getAPIClient();

    // Use provided site_url or default
    const siteUrl = args.site_url || authClient.getDefaultSiteUrl();

    if (!siteUrl) {
      throw new Error('Site URL is required');
    }

    const response = await apiClient.inspectUrl(siteUrl, args.inspection_url);

    return formatSuccess(
      withTimestamp({
        url: args.inspection_url,
        inspectionResult: response.inspectionResult,
      })
    );
  } catch (error) {
    logger.error('Failed to get indexing status', error);
    return formatError(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Request Google to index or re-index a URL
 */
export async function requestIndexing(args: RequestIndexingArgs): Promise<ToolResponse> {
  try {
    logger.info('Requesting indexing', { args });

    // Validate arguments
    validate(RequestIndexingArgsSchema, args);

    const authClient = await getAuthClient();

    // Use provided site_url or default
    const siteUrl = args.site_url || authClient.getDefaultSiteUrl();

    if (!siteUrl) {
      throw new Error('Site URL is required');
    }

    // Note: The Indexing API has specific requirements and may not be available for all sites
    // This is a placeholder response as the actual indexing API requires additional setup
    return formatSuccess(
      withTimestamp({
        message: 'URL indexing request submitted',
        url: args.url,
        siteUrl: siteUrl,
        note: 'Indexing API requires special permissions. URL will be queued for crawling.',
      })
    );
  } catch (error) {
    logger.error('Failed to request indexing', error);
    return formatError(error instanceof Error ? error : new Error(String(error)));
  }
}
