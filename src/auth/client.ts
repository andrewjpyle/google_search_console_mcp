/**
 * Google Search Console Authentication Client
 */

import { google } from 'googleapis';
import { GoogleAuth, OAuth2Client } from 'google-auth-library';
import { AuthenticationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import type { GoogleSearchConsoleCredentials, ServiceAccountCredentials } from '../types/credentials.js';
import { resolveSiteUrl } from '../utils/siteScope.js';

export class GoogleSearchConsoleAuthClient {
  private auth: GoogleAuth | OAuth2Client | null = null;
  private siteUrls: string[] = [];

  /**
   * Initialize authentication client
   */
  async initialize(): Promise<void> {
    try {
      // Check for OAuth2 credentials first (user account)
      const clientId = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET;
      const refreshToken = process.env.GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN;

      if (clientId && clientSecret && refreshToken) {
        // Use OAuth2 credentials (user's Google account)
        logger.info('Using OAuth2 credentials (user account)');
        const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
        oauth2Client.setCredentials({ refresh_token: refreshToken });
        this.auth = oauth2Client;
      } else {
        // Fallback to service account
        logger.info('Using service account credentials');
        const credentials = await this.getCredentials();
        const credentialsObj = JSON.parse(credentials.credentials_json) as ServiceAccountCredentials;

        this.auth = new GoogleAuth({
          credentials: credentialsObj,
          scopes: [
            'https://www.googleapis.com/auth/webmasters',
            'https://www.googleapis.com/auth/webmasters.readonly',
          ],
        });
      }

      // Load site URLs from environment
      const siteUrlsEnv = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URLS;
      if (siteUrlsEnv) {
        this.siteUrls = siteUrlsEnv.split(',').map((url) => url.trim());
        logger.info(`Loaded ${this.siteUrls.length} site URLs from environment`);
      }

      logger.info('Google Search Console authentication initialized');
    } catch (error) {
      logger.error('Failed to initialize authentication', error);
      throw new AuthenticationError(
        `Failed to initialize Google Search Console authentication: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get authentication client
   */
  getAuthClient(): GoogleAuth | OAuth2Client {
    if (!this.auth) {
      throw new AuthenticationError('Authentication client not initialized. Call initialize() first.');
    }
    return this.auth;
  }

  /**
   * Get site URLs
   */
  getSiteUrls(): string[] {
    return this.siteUrls;
  }

  /**
   * Get default site URL
   */
  /**
   * Resolve and scope-check the property a tool call targets (see utils/siteScope.ts).
   */
  resolveSiteUrl(requested?: string): string {
    return resolveSiteUrl(requested, this.getDefaultSiteUrl(), this.siteUrls);
  }

  getDefaultSiteUrl(): string | null {
    const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL;
    if (siteUrl) {
      return siteUrl;
    }
    return this.siteUrls.length > 0 ? this.siteUrls[0] : null;
  }

  /**
   * Get credentials from environment
   */
  private async getCredentials(): Promise<GoogleSearchConsoleCredentials> {
    const credentialsJson = process.env.GOOGLE_SEARCH_CONSOLE_CREDENTIALS;

    if (!credentialsJson) {
      throw new AuthenticationError(
        'No credentials found. Set either the OAuth2 variables ' +
          '(GOOGLE_SEARCH_CONSOLE_CLIENT_ID, GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET, ' +
          'GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN) or a service-account JSON in ' +
          'GOOGLE_SEARCH_CONSOLE_CREDENTIALS. See README.md and .env.example.'
      );
    }

    return {
      credentials_json: credentialsJson,
    };
  }
}

/**
 * Singleton instance
 */
let authClientInstance: GoogleSearchConsoleAuthClient | null = null;

/**
 * Get or create auth client instance
 */
export async function getAuthClient(): Promise<GoogleSearchConsoleAuthClient> {
  if (!authClientInstance) {
    authClientInstance = new GoogleSearchConsoleAuthClient();
    await authClientInstance.initialize();
  }
  return authClientInstance;
}
