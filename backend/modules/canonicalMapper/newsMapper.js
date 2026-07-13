import logger from '../../logger/logger.js';

/**
 * News Mapper
 * 
 * Purpose:
 * Sanitizes raw news articles from Tavily/NewsAPI, maps fields, and merges duplicates.
 * A duplicate is defined by:
 * 1. Matching exact URLs.
 * 2. High title similarity (stripping punctuation, spaces, and matching case-insensitively).
 *
 * Inputs:
 * - rawNews (Array): Raw news array retrieved by the Research Node.
 *
 * Returns:
 * - Array: Deduplicated and normalized articles conforming to the news schema.
 */
export function mapNews(rawNews) {
  logger.info('[NewsMapper] Normalizing and deduplicating news articles...');

  if (!rawNews || !Array.isArray(rawNews)) {
    logger.warn('[NewsMapper] Raw news is not an array. Returning empty collection.');
    return [];
  }

  const seenUrls = new Set();
  const seenTitles = new Set();
  const normalizedArticles = [];

  // Helper function to simplify titles for similarity matching
  const sanitizeTitle = (title) => {
    if (!title) return '';
    return title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '') // Remove punctuation
      .replace(/\s+/g, ' ')      // Consolidate whitespace
      .trim();
  };

  for (const article of rawNews) {
    // 1. Skip if title is missing
    const rawTitle = article.title ? article.title.trim() : '';
    if (!rawTitle) continue;

    // 2. Normalize and check unique URLs (if URL is present)
    const rawUrl = article.url ? article.url.trim() : '';
    if (rawUrl) {
      if (seenUrls.has(rawUrl)) {
        continue; // Skip exact URL duplicates
      }
    }

    // 3. Check simplified title uniqueness
    const simplifiedTitle = sanitizeTitle(rawTitle);
    if (simplifiedTitle) {
      if (seenTitles.has(simplifiedTitle)) {
        continue; // Skip highly similar title duplicates
      }
    }

    // Add identifiers to sets
    if (rawUrl) seenUrls.add(rawUrl);
    if (simplifiedTitle) seenTitles.add(simplifiedTitle);

    // Format article entry
    normalizedArticles.push({
      title: rawTitle,
      url: rawUrl,
      source: article.source ? article.source.trim() : 'Unknown Source',
      publishedAt: article.publishedAt ? article.publishedAt.trim() : 'Unknown Date',
      summary: article.summary ? article.summary.trim() : 'No summary provided.'
    });
  }

  logger.info(`[NewsMapper] Deduplicated news from ${rawNews.length} down to ${normalizedArticles.length} articles.`);
  return normalizedArticles;
}

export default mapNews;
