/**
 * Zod Validation Schemas for Google Search Console
 */

import { z } from 'zod';

/**
 * Credentials Schemas
 */
export const ServiceAccountCredentialsSchema = z.object({
  type: z.string(),
  project_id: z.string(),
  private_key_id: z.string(),
  private_key: z.string(),
  client_email: z.string(),
  client_id: z.string(),
  auth_uri: z.string(),
  token_uri: z.string(),
  auth_provider_x509_cert_url: z.string(),
  client_x509_cert_url: z.string(),
});

export const OAuth2CredentialsSchema = z.object({
  client_id: z.string(),
  client_secret: z.string(),
  refresh_token: z.string(),
});

/**
 * Search Analytics Schemas
 */
export const SearchAnalyticsRequestSchema = z.object({
  site_url: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  dimensions: z.array(z.string()).optional(),
  row_limit: z.number().int().positive().optional(),
  search_type: z.enum(['web', 'image', 'video', 'news']).optional(),
});

export const TopQueriesArgsSchema = z.object({
  site_url: z.string().optional(),
  days: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
});

export const TopPagesArgsSchema = z.object({
  site_url: z.string().optional(),
  days: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
});

/**
 * Crawl Errors Schema
 */
export const CrawlErrorsArgsSchema = z.object({
  site_url: z.string().optional(),
  category: z.enum(['authPermissions', 'notFound', 'serverError', 'soft404', 'other']).optional(),
  platform: z.enum(['web', 'smartphoneOnly']).optional(),
});

/**
 * Sitemap Schemas
 */
export const SubmitSitemapArgsSchema = z.object({
  site_url: z.string().optional(),
  sitemap_url: z.string().url('Invalid sitemap URL'),
});

/**
 * URL Inspection Schemas
 */
export const IndexingStatusArgsSchema = z.object({
  site_url: z.string().optional(),
  inspection_url: z.string().url('Invalid inspection URL'),
});

export const RequestIndexingArgsSchema = z.object({
  site_url: z.string().optional(),
  url: z.string().url('Invalid URL'),
});

/**
 * Site URL Schema
 */
export const SiteUrlSchema = z.object({
  site_url: z.string().optional(),
});

/**
 * Site Write Operations Schemas
 */
export const VerificationMethodEnum = z.enum([
  'HTML_FILE',
  'HTML_TAG',
  'DNS_TXT',
  'DNS_CNAME',
  'GOOGLE_ANALYTICS',
]);

export const PermissionLevelEnum = z.enum([
  'OWNER',
  'FULL_USER',
  'RESTRICTED_USER',
]);

export const VerifySiteArgsSchema = z.object({
  site_url: z.string().url('Invalid site URL'),
  verification_method: VerificationMethodEnum,
});

export const AddSiteArgsSchema = z.object({
  site_url: z.string().url('Invalid site URL'),
  permission_level: PermissionLevelEnum.optional().default('FULL_USER'),
});

export const RemoveSiteArgsSchema = z.object({
  site_url: z.string().url('Invalid site URL'),
  confirmation: z.boolean().refine((val) => val === true, {
    message: 'Confirmation must be true to remove site',
  }),
});

/**
 * Sitemap Write Operations Schemas
 */
export const SitemapTypeEnum = z.enum(['XML', 'RSS', 'ATOM', 'TEXT']);

export const DeleteSitemapArgsSchema = z.object({
  site_url: z.string().url('Invalid site URL'),
  sitemap_url: z.string().url('Invalid sitemap URL'),
  confirmation: z.boolean().refine((val) => val === true, {
    message: 'Confirmation must be true to delete sitemap',
  }),
});

export const ResubmitSitemapArgsSchema = z.object({
  site_url: z.string().url('Invalid site URL'),
  sitemap_url: z.string().url('Invalid sitemap URL'),
});

/**
 * URL Indexing Write Operations Schemas
 */
export const InspectionTypeEnum = z.enum(['LIVE_TEST', 'CACHED_VIEW']);
export const RemovalTypeEnum = z.enum(['TEMPORARY_REMOVAL', 'CLEAR_CACHE']);

export const RequestIndexingWriteArgsSchema = z.object({
  site_url: z.string().url('Invalid site URL'),
  inspection_url: z.string().url('Invalid inspection URL'),
  inspection_type: InspectionTypeEnum.optional().default('LIVE_TEST'),
});

export const RequestUrlRemovalArgsSchema = z.object({
  site_url: z.string().url('Invalid site URL'),
  url: z.string().url('Invalid URL'),
  removal_type: RemovalTypeEnum,
});

export const CancelUrlRemovalArgsSchema = z.object({
  site_url: z.string().url('Invalid site URL'),
  request_id: z.string().min(1, 'Request ID is required'),
});

/**
 * Mobile Usability Schemas
 */
export const MobileIssueTypeEnum = z.enum([
  'MOBILE_USABILITY',
  'VIEWPORT_NOT_SET',
  'TEXT_TOO_SMALL',
  'CLICKABLE_ELEMENTS_TOO_CLOSE',
  'CONTENT_WIDER_THAN_SCREEN',
  'INCOMPATIBLE_PLUGINS',
]);

export const MarkMobileIssueResolvedArgsSchema = z.object({
  site_url: z.string().url('Invalid site URL'),
  issue_id: z.string().min(1, 'Issue ID is required'),
  issue_type: MobileIssueTypeEnum,
});

export const RequestMobileRevalidationArgsSchema = z.object({
  site_url: z.string().url('Invalid site URL'),
  affected_urls: z.array(z.string().url()).min(1, 'At least one URL is required'),
});

/**
 * Structured Data Schemas
 */
export const StructuredDataIssueTypeEnum = z.enum([
  'SCHEMA_INVALID',
  'MISSING_REQUIRED_FIELD',
  'INVALID_VALUE',
  'INVALID_FORMAT',
  'DUPLICATE_PROPERTY',
  'DEPRECATED_PROPERTY',
]);

export const RichResultsTestTypeEnum = z.enum([
  'RECIPE',
  'PRODUCT',
  'ARTICLE',
  'FAQ',
  'HOW_TO',
  'JOB_POSTING',
  'EVENT',
  'REVIEW',
  'BREADCRUMB',
  'VIDEO',
]);

export const MarkStructuredDataIssueResolvedArgsSchema = z.object({
  site_url: z.string().url('Invalid site URL'),
  issue_id: z.string().min(1, 'Issue ID is required'),
  issue_type: StructuredDataIssueTypeEnum,
});

export const RequestRichResultsTestArgsSchema = z.object({
  site_url: z.string().url('Invalid site URL'),
  url: z.string().url('Invalid URL'),
  test_type: RichResultsTestTypeEnum,
});

/**
 * International Targeting Schemas
 */
export const SetInternationalTargetingArgsSchema = z.object({
  site_url: z.string().url('Invalid site URL'),
  target_country: z.string().length(2, 'Country code must be ISO 3166-1 alpha-2 (2 characters)'),
  target_language: z.string().optional(),
});

export const HrefLangTagSchema = z.object({
  lang: z.string().min(2, 'Language code required'),
  region: z.string().optional(),
  url: z.string().url('Invalid URL'),
});

export const SetHrefLangConfigurationArgsSchema = z.object({
  site_url: z.string().url('Invalid site URL'),
  hreflang_tags: z.array(HrefLangTagSchema).min(1, 'At least one hreflang tag is required'),
});

/**
 * URL Parameter Handling Schemas
 */
export const ParameterBehaviorEnum = z.enum([
  'CRAWL_NONE',
  'CRAWL_ALL',
  'CRAWL_REPRESENTATIVE',
]);

export const CrawlRateEnum = z.enum(['SLOW', 'NORMAL', 'FAST']);

export const ConfigureUrlParametersArgsSchema = z.object({
  site_url: z.string().url('Invalid site URL'),
  parameter_name: z.string().min(1, 'Parameter name is required'),
  behavior: ParameterBehaviorEnum,
});

export const SetCrawlRateArgsSchema = z.object({
  site_url: z.string().url('Invalid site URL'),
  crawl_rate: z.union([CrawlRateEnum, z.number().min(0).max(10)]),
});

/**
 * Disavow Links Schemas
 */
export const UploadDisavowFileArgsSchema = z.object({
  site_url: z.string().url('Invalid site URL'),
  disavow_content: z.string().min(1, 'Disavow content is required'),
});

export const GetDisavowFileArgsSchema = z.object({
  site_url: z.string().url('Invalid site URL'),
});

export const DeleteDisavowFileArgsSchema = z.object({
  site_url: z.string().url('Invalid site URL'),
  confirmation: z.boolean().refine((val) => val === true, {
    message: 'Confirmation must be true to delete disavow file',
  }),
});
