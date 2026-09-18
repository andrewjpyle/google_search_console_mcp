/**
 * Google Search Console API Type Definitions
 */

/**
 * MCP Tool Response Type
 */
export interface ToolResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError?: boolean;
  [key: string]: unknown;
}

/**
 * Search Analytics Request
 */
export interface SearchAnalyticsRequest {
  site_url?: string;
  start_date?: string;
  end_date?: string;
  dimensions?: string[];
  row_limit?: number;
  search_type?: string;
}

/**
 * Search Analytics Response
 */
export interface SearchAnalyticsRow {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
}

export interface SearchAnalyticsResponse {
  rows?: SearchAnalyticsRow[];
  responseAggregationType?: string;
}

/**
 * Site Information
 */
export interface SiteInfo {
  siteUrl: string;
  permissionLevel: string;
}

/**
 * Sitemap Information
 */
export interface SitemapInfo {
  path: string;
  lastSubmitted?: string;
  lastDownloaded?: string;
  isPending?: boolean;
  isSitemapsIndex?: boolean;
  type?: string;
  warnings?: number;
  errors?: number;
  contents?: Array<{
    type?: string;
    submitted?: number;
    indexed?: number;
  }>;
}

/**
 * Crawl Error Information
 */
export interface CrawlErrorCount {
  type?: string;
  entries?: Array<{
    count?: number;
    timestamp?: string;
  }>;
}

/**
 * URL Inspection Result
 */
export interface URLInspectionResult {
  inspectionResult?: {
    indexStatusResult?: {
      verdict?: string;
      coverageState?: string;
      robotsTxtState?: string;
      indexingState?: string;
      lastCrawlTime?: string;
      pageFetchState?: string;
      googleCanonical?: string;
      userCanonical?: string;
      sitemap?: string[];
      referringUrls?: string[];
    };
    mobileUsabilityResult?: {
      verdict?: string;
      issues?: Array<{
        issueType?: string;
        severity?: string;
        message?: string;
      }>;
    };
    richResultsResult?: {
      verdict?: string;
      detectedItems?: Array<{
        richResultType?: string;
        items?: Array<{
          name?: string;
        }>;
      }>;
    };
  };
}

/**
 * Tool Arguments
 */
export interface GetSiteInfoArgs {
  site_url?: string;
}

export interface SearchAnalyticsArgs {
  site_url?: string;
  start_date?: string;
  end_date?: string;
  dimensions?: string[];
  row_limit?: number;
  search_type?: string;
}

export interface TopQueriesArgs {
  site_url?: string;
  days?: number;
  limit?: number;
}

export interface TopPagesArgs {
  site_url?: string;
  days?: number;
  limit?: number;
}

export interface CrawlErrorsArgs {
  site_url?: string;
  category?: string;
  platform?: string;
}

export interface ListSitemapsArgs {
  site_url?: string;
}

export interface SubmitSitemapArgs {
  site_url?: string;
  sitemap_url: string;
}

export interface IndexingStatusArgs {
  site_url?: string;
  inspection_url: string;
}

export interface RequestIndexingArgs {
  site_url?: string;
  url: string;
}
