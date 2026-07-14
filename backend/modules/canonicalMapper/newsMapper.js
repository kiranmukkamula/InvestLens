import logger from '../../logger/logger.js';

/**
 * Refine news article titles:
 * - Removes trailing site name/source suffixes separated by |, ||, -, —, –
 * - Removes starting source prefixes like "CNBC: ", "Reuters: "
 * - Truncates excessively long titles gracefully
 */
export function refineTitle(title) {
  if (!title) return '';
  let cleaned = title.trim();

  // 1. Remove trailing site/source info separated by |, ||, —, –
  // e.g. "Apple launches new iPhone || Reuters" or "Apple launches new iPhone | Bloomberg"
  cleaned = cleaned.replace(/\s*(?:\|\||\||—|–)\s+([^|||—|–]+)$/, (match, p1) => {
    const lastPart = p1.trim();
    if (lastPart.length < 35) {
      return '';
    }
    return match;
  });

  // 2. Remove trailing site/source info separated by " - " (spaces around dash)
  // e.g. "Tesla recalls 2M cars - USA TODAY"
  cleaned = cleaned.replace(/\s+-\s+([^|-]+)$/, (match, p1) => {
    const lastPart = p1.trim();
    const isPublisher = lastPart.length < 12 || /yahoo|bloomberg|reuters|forbes|cnbc|wsj|techcrunch|marketwatch|investing|motley|seeking|ap|nytimes|guardian|ft|cnn|bbc|press|wire|times|today|post|journal|herald|tribune/i.test(lastPart);
    if (isPublisher) {
      return '';
    }
    return match;
  });

  // 3. Remove common starting news source prefixes (e.g. "CNBC: ...")
  const prefixRegex = /^(breaking|update|cnbc|reuters|bloomberg|yahoo(?:\s*finance)?|marketwatch|forbes|cnn|bbc):\s+/i;
  cleaned = cleaned.replace(prefixRegex, '');

  // 4. Clean outer quotes, brackets, and extra spaces
  cleaned = cleaned.replace(/^["'“‘\[(]+|["'”’\])]+$/g, ''); // Remove outer quotes/brackets
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // 5. Truncate if still excessively long
  if (cleaned.length > 100) {
    const truncated = cleaned.slice(0, 97);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 60) {
      cleaned = cleaned.slice(0, lastSpace) + '...';
    } else {
      cleaned = truncated + '...';
    }
  }

  return cleaned;
}

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
    // 1. Skip if title is missing after refinement
    const rawTitle = article.title ? article.title.trim() : '';
    const cleanedTitle = refineTitle(rawTitle);
    if (!cleanedTitle) continue;

    // 2. Normalize and check unique URLs (if URL is present)
    const rawUrl = article.url ? article.url.trim() : '';
    if (rawUrl) {
      if (seenUrls.has(rawUrl)) {
        continue; // Skip exact URL duplicates
      }
    }

    // 3. Check simplified title uniqueness
    const simplifiedTitle = sanitizeTitle(cleanedTitle);
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
      title: cleanedTitle,
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
