# Changelog

## 1.1.0 (2026-10-01)

- **Site allowlist is now enforced.** When `GOOGLE_SEARCH_CONSOLE_SITE_URLS` is set, every tool,
  including `submit_sitemap` and `request_indexing`, refuses any property outside it. Before, the
  variable only chose the default property, so a write could reach any property the credentials
  could access.
- **`npm run call`** runs one tool from the terminal through a real MCP client, no Claude needed.
- MCP SDK upgraded from 0.5 to 1.x.
- Removed two unused utilities (`cache.ts`, `batch.ts`) and the `node-cache` dependency. The README
  no longer claims a cache.
- `package.json` description corrected: it listed disavow, hreflang and structured-data
  revalidation, which Google's public API does not offer and this server never implemented.

## 1.0.0

- Initial release: 10 tools over the Search Console and Web Search Indexing APIs.
