/**
 * Google Search Console API Client Wrapper
 */

import { google, searchconsole_v1 } from 'googleapis';
import { getAuthClient } from '../auth/client.js';
import { logger } from '../utils/logger.js';
import { withRetry } from '../utils/retry.js';
import { parseGoogleSearchConsoleError } from '../utils/errors.js';

/**
 * Google Search Console API Client
 */
export class GoogleSearchConsoleAPIClient {
  private client: searchconsole_v1.Searchconsole | null = null;

  /**
   * Initialize the API client
   */
  async initialize(): Promise<void> {
    try {
      const authClient = await getAuthClient();
      const auth = authClient.getAuthClient();

      this.client = google.searchconsole({
        version: 'v1',
        auth,
      });

      logger.info('Google Search Console API client initialized');
    } catch (error) {
      logger.error('Failed to initialize Search Console API client', error);
      throw parseGoogleSearchConsoleError(error);
    }
  }

  /**
   * Get the API client instance
   */
  getClient(): searchconsole_v1.Searchconsole {
    if (!this.client) {
      throw new Error('API client not initialized. Call initialize() first.');
    }
    return this.client;
  }

  /**
   * List all verified sites
   */
  async listSites(): Promise<searchconsole_v1.Schema$SitesListResponse> {
    logger.debug('Listing sites');

    return withRetry(async () => {
      const client = this.getClient();
      const response = await client.sites.list();
      return response.data;
    });
  }

  /**
   * Get site information
   */
  async getSiteInfo(siteUrl: string): Promise<searchconsole_v1.Schema$WmxSite> {
    logger.debug('Getting site info', { siteUrl });

    return withRetry(async () => {
      const client = this.getClient();
      const response = await client.sites.get({ siteUrl });
      return response.data;
    });
  }

  /**
   * Query search analytics
   */
  async querySearchAnalytics(
    siteUrl: string,
    requestBody: searchconsole_v1.Schema$SearchAnalyticsQueryRequest
  ): Promise<searchconsole_v1.Schema$SearchAnalyticsQueryResponse> {
    logger.debug('Querying search analytics', { siteUrl, requestBody });

    return withRetry(async () => {
      const client = this.getClient();
      const response = await client.searchanalytics.query({
        siteUrl,
        requestBody,
      });
      return response.data;
    });
  }

  /**
   * List sitemaps
   */
  async listSitemaps(siteUrl: string): Promise<searchconsole_v1.Schema$SitemapsListResponse> {
    logger.debug('Listing sitemaps', { siteUrl });

    return withRetry(async () => {
      const client = this.getClient();
      const response = await client.sitemaps.list({ siteUrl });
      return response.data;
    });
  }

  /**
   * Submit a sitemap
   */
  async submitSitemap(siteUrl: string, feedpath: string): Promise<void> {
    logger.debug('Submitting sitemap', { siteUrl, feedpath });

    return withRetry(async () => {
      const client = this.getClient();
      await client.sitemaps.submit({ siteUrl, feedpath });
    });
  }

  /**
   * Delete a sitemap
   */
  async deleteSitemap(siteUrl: string, feedpath: string): Promise<void> {
    logger.debug('Deleting sitemap', { siteUrl, feedpath });

    return withRetry(async () => {
      const client = this.getClient();
      await client.sitemaps.delete({ siteUrl, feedpath });
    });
  }

  /**
   * Get URL inspection result
   */
  async inspectUrl(
    siteUrl: string,
    inspectionUrl: string
  ): Promise<searchconsole_v1.Schema$InspectUrlIndexResponse> {
    logger.debug('Inspecting URL', { siteUrl, inspectionUrl });

    return withRetry(async () => {
      const client = this.getClient();
      const response = await client.urlInspection.index.inspect({
        requestBody: {
          inspectionUrl,
          siteUrl,
        },
      });
      return response.data;
    });
  }

  /**
   * Query URL crawl errors counts
   * Note: This API endpoint is deprecated by Google
   */
  async queryCrawlErrors(
    siteUrl: string,
    category: string,
    platform: string
  ): Promise<{ countPerTypes?: Array<{ type?: string; entries?: Array<{ count?: number; timestamp?: string }> }> }> {
    logger.debug('Querying crawl errors', { siteUrl, category, platform });

    return withRetry(async () => {
      // Note: urlCrawlErrorsCounts API is deprecated
      // Return empty response for now
      logger.warn('urlCrawlErrorsCounts API is deprecated, returning empty response');
      return { countPerTypes: [] };
    });
  }
}

/**
 * Singleton instance
 */
let apiClientInstance: GoogleSearchConsoleAPIClient | null = null;

/**
 * Get or create API client instance
 */
export async function getAPIClient(): Promise<GoogleSearchConsoleAPIClient> {
  if (!apiClientInstance) {
    apiClientInstance = new GoogleSearchConsoleAPIClient();
    await apiClientInstance.initialize();
  }
  return apiClientInstance;
}
