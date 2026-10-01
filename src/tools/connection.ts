/**
 * Connection and Site Management Tools
 */

import { getAPIClient } from '../api/client.js';
import { getAuthClient } from '../auth/client.js';
import { formatSuccess, formatError, withTimestamp } from '../utils/formatting.js';
import { validate } from '../utils/validation.js';
import { SiteUrlSchema } from '../types/schemas.js';
import type { ToolResponse, GetSiteInfoArgs } from '../types/api.js';
import { logger } from '../utils/logger.js';

/**
 * Test connection to Google Search Console API
 */
export async function testConnection(): Promise<ToolResponse> {
  try {
    logger.info('Testing Search Console connection');
    const apiClient = await getAPIClient();
    const response = await apiClient.listSites();

    return formatSuccess(
      withTimestamp({
        success: true,
        sites_found: response.siteEntry?.length || 0,
      })
    );
  } catch (error) {
    logger.error('Connection test failed', error);
    return formatError(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * List all verified sites
 */
export async function listSites(): Promise<ToolResponse> {
  try {
    logger.info('Listing verified sites');
    const apiClient = await getAPIClient();
    const response = await apiClient.listSites();

    return formatSuccess(
      withTimestamp({
        sites:
          response.siteEntry?.map((site) => ({
            siteUrl: site.siteUrl,
            permissionLevel: site.permissionLevel,
          })) || [],
        total_count: response.siteEntry?.length || 0,
      })
    );
  } catch (error) {
    logger.error('Failed to list sites', error);
    return formatError(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Get information about a specific site
 */
export async function getSiteInfo(args: GetSiteInfoArgs): Promise<ToolResponse> {
  try {
    logger.info('Getting site information', { args });

    // Validate arguments
    validate(SiteUrlSchema, args);

    const authClient = await getAuthClient();
    const apiClient = await getAPIClient();

    // Use provided site_url or default
    const siteUrl = authClient.resolveSiteUrl(args.site_url);

    if (!siteUrl) {
      throw new Error('Site URL is required');
    }

    const response = await apiClient.getSiteInfo(siteUrl);

    return formatSuccess(
      withTimestamp({
        siteUrl: response.siteUrl,
        permissionLevel: response.permissionLevel,
      })
    );
  } catch (error) {
    logger.error('Failed to get site info', error);
    return formatError(error instanceof Error ? error : new Error(String(error)));
  }
}
