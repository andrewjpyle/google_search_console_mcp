# Google Search Console MCP

A [Model Context Protocol](https://modelcontextprotocol.io) server that gives AI
assistants (Claude Desktop, Claude Code, and any other MCP client) direct access
to **Google Search Console** — search analytics, URL inspection, and sitemap
management.

Every tool in this server makes a **real** Google Search Console / Web Search
Indexing API call. There are no simulated, mocked, or "coming soon" tools.

---

## Why this exists

Most SEO work starts with the same question — *what is this site actually doing in
search?* — and then a few concrete actions: inspect a URL, submit a sitemap, nudge
a page for indexing. This server puts that loop directly in front of an LLM, so you
can ask an assistant "what are my top losing queries this month?" or "submit the new
sitemap and inspect the three pages I just published" and have it happen against the
live API.

It's a focused, dependency-light server with real engineering underneath: a
namespaced TTL cache, retry with backoff, zod-validated inputs, and structured
logging.

## Tools

| Tool | Type | What it does |
|------|------|--------------|
| `test_connection` | read | Verify auth and connectivity to the API |
| `list_sites` | read | List all verified properties on the account |
| `get_site_info` | read | Permission level / details for one property |
| `search_analytics` | read | Clicks, impressions, CTR, position by dimension (query/page/country/device/date) |
| `get_top_queries` | read | Top queries over a lookback window |
| `get_top_pages` | read | Top pages over a lookback window |
| `list_sitemaps` | read | List submitted sitemaps for a property |
| `submit_sitemap` | **write** | Submit or resubmit a sitemap |
| `get_indexing_status` | read | URL Inspection API — index status, coverage, canonical, richness |
| `request_indexing` | **write** | Notify Google of a new/updated URL via the Web Search Indexing API |

> **Scope note (read this).** Google's public API only exposes a subset of what you
> can do in the Search Console UI. Operations like disavow-file uploads, hreflang
> configuration, crawl-rate, URL parameters, adding/removing properties, and URL
> removal **have no public API** and are therefore **not** included here — rather
> than ship fake versions of them. The crawl-errors API was retired by Google in
> 2019 and is likewise omitted. What's here is what the API genuinely supports.

## Requirements

- Node.js 18+
- A Google Cloud project with the **Search Console API** enabled
- Credentials for a Google account (or service account) that has access to the
  Search Console properties you want to use

## Setup

```bash
git clone https://github.com/andrewjpyle/google_search_console_mcp.git
cd google_search_console_mcp
npm install
npm run build
```

Copy `.env.example` to `.env` and fill in **one** auth method:

- **OAuth2** — `GOOGLE_SEARCH_CONSOLE_CLIENT_ID`, `GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET`,
  `GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN`
- **Service account** — `GOOGLE_SEARCH_CONSOLE_CREDENTIALS` (the full JSON on one
  line). Add the service-account email as a user on each property.

Set `GOOGLE_SEARCH_CONSOLE_SITE_URLS` to a comma-separated list of the properties
this server may act on. The first entry is the default when a tool omits `site_url`.

## Use with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "google-search-console": {
      "command": "node",
      "args": ["/absolute/path/to/google_search_console_mcp/dist/index.js"],
      "env": {
        "GOOGLE_SEARCH_CONSOLE_CREDENTIALS": "{...service account json...}",
        "GOOGLE_SEARCH_CONSOLE_SITE_URLS": "https://example.com/"
      }
    }
  }
}
```

## Use with Claude Code

```bash
claude mcp add google-search-console -- node /absolute/path/to/google_search_console_mcp/dist/index.js
```

(Provide the same environment variables via your shell or an `.env` file.)

## Development

```bash
npm run dev      # run from source with tsx
npm test         # jest
npm run build    # tsc → dist/
```

## Security

- Credentials are read **only** from environment variables; nothing is hardcoded.
- `.env` and any `*credentials*.json` are gitignored — keep them out of version control.
- The two write tools (`submit_sitemap`, `request_indexing`) act on whatever
  properties your credentials can access. Scope `GOOGLE_SEARCH_CONSOLE_SITE_URLS` and
  your credentials to exactly the properties you intend to manage.

## License

MIT © Andrew J. Pyle
