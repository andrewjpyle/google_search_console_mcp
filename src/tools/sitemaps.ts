/**
 * Sitemap Management Tools
 */

import { getAPIClient } from '../api/client.js';
import { getAuthClient } from '../auth/client.js';
import { formatSuccess, formatError, withTimestamp } from '../utils/formatting.js';
import { validate } from '../utils/validation.js';
import { SiteUrlSchema, SubmitSitemapArgsSchema } from '../types/schemas.js';
import type { ToolResponse, ListSitemapsArgs, SubmitSitemapArgs } from '../types/api.js';
import { logger } from '../utils/logger.js';

/**
 * List all sitemaps for a site
 */
export async function listSitemaps(args: ListSitemapsArgs): Promise<ToolResponse> {
  try {
    logger.info('Listing sitemaps', { args });

    // Validate arguments
    validate(SiteUrlSchema, args);

    const authClient = await getAuthClient();
    const apiClient = await getAPIClient();

    // Use provided site_url or default
    const siteUrl = args.site_url || authClient.getDefaultSiteUrl();

    if (!siteUrl) {
      throw new Error('Site URL is required');
    }

    const response = await apiClient.listSitemaps(siteUrl);

    return formatSuccess(
      withTimestamp({
        sitemaps:
          response.sitemap?.map((sitemap) => ({
            path: sitemap.path,
            lastSubmitted: sitemap.lastSubmitted,
            lastDownloaded: sitemap.lastDownloaded,
            isPending: sitemap.isPending,
            isSitemapsIndex: sitemap.isSitemapsIndex,
            type: sitemap.type,
            warnings: sitemap.warnings,
            errors: sitemap.errors,
            contents: sitemap.contents,
          })) || [],
        total_count: response.sitemap?.length || 0,
      })
    );
  } catch (error) {
    logger.error('Failed to list sitemaps', error);
    return formatError(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Submit a new sitemap
 */
export async function submitSitemap(args: SubmitSitemapArgs): Promise<ToolResponse> {
  try {
    logger.info('Submitting sitemap', { args });

    // Validate arguments
    validate(SubmitSitemapArgsSchema, args);

    const authClient = await getAuthClient();
    const apiClient = await getAPIClient();

    // Use provided site_url or default
    const siteUrl = args.site_url || authClient.getDefaultSiteUrl();

    if (!siteUrl) {
      throw new Error('Site URL is required');
    }

    await apiClient.submitSitemap(siteUrl, args.sitemap_url);

    return formatSuccess(
      withTimestamp({
        success: true,
        message: 'Sitemap submitted successfully',
        siteUrl: siteUrl,
        sitemapUrl: args.sitemap_url,
      })
    );
  } catch (error) {
    logger.error('Failed to submit sitemap', error);
    return formatError(error instanceof Error ? error : new Error(String(error)));
  }
}
