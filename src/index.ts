#!/usr/bin/env node

/**
 * Google Search Console MCP Server
 *
 * Exposes Google Search Console data and operations to AI assistants through the
 * Model Context Protocol. Every tool here makes a real call to the Google Search
 * Console / Web Search Indexing API — there are no simulated or stubbed tools.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Tools (all real API calls)
import {
  testConnection,
  listSites,
  getSiteInfo,
} from './tools/connection.js';
import {
  searchAnalytics,
  getTopQueries,
  getTopPages,
} from './tools/analytics.js';
import {
  listSitemaps,
  submitSitemap,
} from './tools/sitemaps.js';
import {
  getIndexingStatus,
  requestIndexing,
} from './tools/indexing.js';

// Utilities
import { logger } from './utils/logger.js';
import { formatError } from './utils/formatting.js';

class GoogleSearchConsoleMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'google-search-console-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'test_connection',
          description: 'Test connection and authentication to the Google Search Console API',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'list_sites',
          description: 'List all verified sites in the authenticated Search Console account',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_site_info',
          description: 'Get details and permission level for a specific verified site',
          inputSchema: {
            type: 'object',
            properties: {
              site_url: {
                type: 'string',
                description: 'The site URL (e.g., https://example.com/ or sc-domain:example.com)',
              },
            },
          },
        },
        {
          name: 'search_analytics',
          description: 'Query Search Analytics data (clicks, impressions, CTR, position) by dimension',
          inputSchema: {
            type: 'object',
            properties: {
              site_url: { type: 'string', description: 'The site URL' },
              start_date: {
                type: 'string',
                description: 'Start date (YYYY-MM-DD)',
                default: '7daysAgo',
              },
              end_date: {
                type: 'string',
                description: 'End date (YYYY-MM-DD)',
                default: 'today',
              },
              dimensions: {
                type: 'array',
                items: { type: 'string' },
                description: 'Dimensions (query, page, country, device, searchAppearance, date)',
                default: ['query'],
              },
              row_limit: {
                type: 'number',
                description: 'Maximum number of rows',
                default: 100,
              },
              search_type: {
                type: 'string',
                description: 'Type of search (web, image, video, news, discover, googleNews)',
                default: 'web',
              },
            },
          },
        },
        {
          name: 'get_top_queries',
          description: 'Get the top search queries for a site over a lookback window',
          inputSchema: {
            type: 'object',
            properties: {
              site_url: { type: 'string', description: 'The site URL' },
              days: { type: 'number', description: 'Number of days to look back', default: 28 },
              limit: { type: 'number', description: 'Number of top queries to return', default: 50 },
            },
          },
        },
        {
          name: 'get_top_pages',
          description: 'Get the top performing pages for a site over a lookback window',
          inputSchema: {
            type: 'object',
            properties: {
              site_url: { type: 'string', description: 'The site URL' },
              days: { type: 'number', description: 'Number of days to look back', default: 28 },
              limit: { type: 'number', description: 'Number of top pages to return', default: 50 },
            },
          },
        },
        {
          name: 'list_sitemaps',
          description: 'List all sitemaps submitted for a site',
          inputSchema: {
            type: 'object',
            properties: {
              site_url: { type: 'string', description: 'The site URL' },
            },
          },
        },
        {
          name: 'submit_sitemap',
          description: 'Submit (or resubmit) a sitemap to Search Console — a real write operation',
          inputSchema: {
            type: 'object',
            properties: {
              site_url: { type: 'string', description: 'The site URL' },
              sitemap_url: {
                type: 'string',
                description: 'The full sitemap URL (e.g., https://example.com/sitemap.xml)',
              },
            },
            required: ['sitemap_url'],
          },
        },
        {
          name: 'get_indexing_status',
          description: 'Inspect a URL with the URL Inspection API (index status, coverage, canonical, richness)',
          inputSchema: {
            type: 'object',
            properties: {
              site_url: { type: 'string', description: 'The site URL' },
              inspection_url: { type: 'string', description: 'The URL to inspect' },
            },
            required: ['inspection_url'],
          },
        },
        {
          name: 'request_indexing',
          description: 'Notify Google of a new or updated URL via the Web Search Indexing API — a real write operation',
          inputSchema: {
            type: 'object',
            properties: {
              site_url: { type: 'string', description: 'The site URL' },
              url: { type: 'string', description: 'The URL to submit for indexing' },
            },
            required: ['url'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        logger.info(`Executing tool: ${name}`, { args });

        switch (name) {
          case 'test_connection':
            return await testConnection();
          case 'list_sites':
            return await listSites();
          case 'get_site_info':
            return await getSiteInfo(args || {});
          case 'search_analytics':
            return await searchAnalytics(args || {});
          case 'get_top_queries':
            return await getTopQueries(args || {});
          case 'get_top_pages':
            return await getTopPages(args || {});
          case 'list_sitemaps':
            return await listSitemaps(args || {});
          case 'submit_sitemap':
            return await submitSitemap((args as any) || {});
          case 'get_indexing_status':
            return await getIndexingStatus((args as any) || {});
          case 'request_indexing':
            return await requestIndexing((args as any) || {});
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        logger.error(`Tool execution failed: ${name}`, error);
        return formatError(error as Error);
      }
    });
  }

  private setupErrorHandlers() {
    this.server.onerror = (error) => {
      logger.error('MCP Server error', error);
    };

    process.on('SIGINT', async () => {
      logger.info('Shutting down Google Search Console MCP server');
      await this.server.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Shutting down Google Search Console MCP server');
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.info('Google Search Console MCP server running on stdio');
  }
}

const server = new GoogleSearchConsoleMCPServer();
server.run().catch((error) => {
  logger.error('Failed to start server', error);
  process.exit(1);
});
