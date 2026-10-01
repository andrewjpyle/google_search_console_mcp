/**
 * Site scope: the one place that decides which Search Console property a tool call may touch.
 *
 * GOOGLE_SEARCH_CONSOLE_SITE_URLS is an allowlist. When it is set, a tool may only act on a
 * property in that list, and that includes the two write tools. When it is unset, the tool acts on
 * the requested property (or the default) and the credentials' own access is the only limit.
 */

import { AuthorizationError, ValidationError } from './errors.js';

export function resolveSiteUrl(
  requested: string | undefined,
  defaultSiteUrl: string | null,
  allowedSiteUrls: string[]
): string {
  const siteUrl = requested || defaultSiteUrl;
  if (!siteUrl) {
    throw new ValidationError(
      'site_url is required: pass it to the tool or set GOOGLE_SEARCH_CONSOLE_SITE_URLS'
    );
  }
  if (allowedSiteUrls.length > 0 && !allowedSiteUrls.includes(siteUrl)) {
    throw new AuthorizationError(
      `${siteUrl} is not in GOOGLE_SEARCH_CONSOLE_SITE_URLS, so this server will not act on it`
    );
  }
  return siteUrl;
}
