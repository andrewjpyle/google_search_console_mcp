/**
 * Mock responses for Google Search Console API
 */

export const mockSitesListResponse = {
  siteEntry: [
    {
      siteUrl: 'https://example.com/',
      permissionLevel: 'siteOwner',
    },
    {
      siteUrl: 'https://test.example.com/',
      permissionLevel: 'siteFullUser',
    },
  ],
};

export const mockSiteInfoResponse = {
  siteUrl: 'https://example.com/',
  permissionLevel: 'siteOwner',
};

export const mockSearchAnalyticsResponse = {
  rows: [
    {
      keys: ['test query'],
      clicks: 100,
      impressions: 1000,
      ctr: 0.1,
      position: 5.5,
    },
    {
      keys: ['another query'],
      clicks: 50,
      impressions: 500,
      ctr: 0.1,
      position: 8.2,
    },
  ],
  responseAggregationType: 'byProperty',
};

export const mockSitemapsListResponse = {
  sitemap: [
    {
      path: 'https://example.com/sitemap.xml',
      lastSubmitted: '2024-01-01T00:00:00.000Z',
      lastDownloaded: '2024-01-02T00:00:00.000Z',
      isPending: false,
      isSitemapsIndex: false,
      type: 'sitemap',
      warnings: 0,
      errors: 0,
      contents: [
        {
          type: 'web',
          submitted: 100,
          indexed: 95,
        },
      ],
    },
  ],
};

export const mockCrawlErrorsResponse = {
  countPerTypes: [
    {
      type: 'notFound',
      entries: [
        {
          count: 10,
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      ],
    },
  ],
};

export const mockUrlInspectionResponse = {
  inspectionResult: {
    indexStatusResult: {
      verdict: 'PASS',
      coverageState: 'Indexed',
      robotsTxtState: 'ALLOWED',
      indexingState: 'INDEXING_ALLOWED',
      lastCrawlTime: '2024-01-01T00:00:00.000Z',
      pageFetchState: 'SUCCESSFUL',
      googleCanonical: 'https://example.com/page',
      userCanonical: 'https://example.com/page',
      sitemap: ['https://example.com/sitemap.xml'],
      referringUrls: [],
    },
  },
};
