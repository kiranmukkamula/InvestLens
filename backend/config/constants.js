/**
 * Application Constants
 *
 * Purpose:
 * Stores non-environmental static thresholds, endpoints, configurations, and magic numbers.
 * Groups them logically under frozen namespaces for easy discovery and type safety.
 */

const constants = {
  // Caching configuration defaults
  CACHE: {
    TTL_SECONDS: 300, // 5 minutes cache lifetime
  },

  // API Client retry parameters (e.g. exponential backoff)
  RETRY: {
    MAX_ATTEMPTS: 3,
    INITIAL_DELAY_MS: 500,
    MAX_DELAY_MS: 3000,
    BACKOFF_FACTOR: 2,
    TIMEOUT_MS: 15000, // 15 seconds request timeout
  },

  // Agent parameters
  DECISION: {
    DEFAULT_CONFIDENCE_THRESHOLD: 0.75, // Standard threshold for high-conviction ratings
  },

  // Core URLs
  APIS: {
    FINNHUB_BASE_URL: 'https://finnhub.io/api/v1',
    NEWS_BASE_URL: 'https://newsapi.org/v2',
    FMP_BASE_URL: 'https://financialmodelingprep.com/api/v3',
  }
};

export default Object.freeze(constants);
