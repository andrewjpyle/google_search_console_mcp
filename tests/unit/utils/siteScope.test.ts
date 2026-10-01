/**
 * The site allowlist is the server's main safety boundary: with GOOGLE_SEARCH_CONSOLE_SITE_URLS
 * set, no tool (including submit_sitemap and request_indexing) may act on another property.
 */

import { resolveSiteUrl } from '../../../src/utils/siteScope.js';
import { AuthorizationError, ValidationError } from '../../../src/utils/errors.js';

describe('resolveSiteUrl', () => {
  const allowed = ['sc-domain:example.com', 'https://blog.example.com/'];

  it('returns the requested property when it is on the allowlist', () => {
    expect(resolveSiteUrl('https://blog.example.com/', null, allowed)).toBe('https://blog.example.com/');
  });

  it('refuses a property that is not on the allowlist', () => {
    expect(() => resolveSiteUrl('sc-domain:someone-else.com', null, allowed)).toThrow(AuthorizationError);
  });

  it('refuses an off-list default too, so a stray GOOGLE_SEARCH_CONSOLE_SITE_URL cannot widen scope', () => {
    expect(() => resolveSiteUrl(undefined, 'sc-domain:someone-else.com', allowed)).toThrow(AuthorizationError);
  });

  it('falls back to the default when no property is requested', () => {
    expect(resolveSiteUrl(undefined, 'sc-domain:example.com', allowed)).toBe('sc-domain:example.com');
  });

  it('allows any property when no allowlist is configured', () => {
    expect(resolveSiteUrl('sc-domain:anything.com', null, [])).toBe('sc-domain:anything.com');
  });

  it('requires a property when none is requested and there is no default', () => {
    expect(() => resolveSiteUrl(undefined, null, [])).toThrow(ValidationError);
  });
});
