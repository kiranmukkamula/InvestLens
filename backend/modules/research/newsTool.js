import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import axios from 'axios';
import env from '../../config/env.js';
import logger from '../../logger/logger.js';
import { runWithRetry } from './retryManager.js';

/**
 * Robust Mock Corporate News for Testing/Demonstration
 */
const MOCK_NEWS = {
  AAPL: [
    { title: 'Apple launches new AI-powered features for iPhone', url: 'https://finance.yahoo.com/news/apple-ai-iphone', source: 'Yahoo Finance', publishedAt: '2026-07-10', summary: 'Apple Inc. announced updates introducing generative AI capabilities directly integrated into iOS, boosting developer interest and upgrading hardware demand expectations.' },
    { title: 'Apple Reports Record Services Revenue in Latest Quarter', url: 'https://www.bloomberg.com/news/apple-services', source: 'Bloomberg', publishedAt: '2026-07-08', summary: 'Apples Services division reached an all-time high of $23.9B, offsetting flat hardware sales and highlighting shift toward ecosystem monetization.' },
    { title: 'Antitrust regulators intensify scrutiny on App Store fees', url: 'https://www.reuters.com/technology/apple-antitrust', source: 'Reuters', publishedAt: '2026-07-05', summary: 'The Department of Justice and EU antitrust authorities launched parallel investigations into Apples payment terms, signaling potential compliance and litigation risks.' }
  ],
  TSLA: [
    { title: 'Tesla delivers record number of vehicles in Q2', url: 'https://finance.yahoo.com/news/tesla-deliveries-q2', source: 'Yahoo Finance', publishedAt: '2026-07-11', summary: 'Tesla Inc. announced quarterly deliveries exceeding analysts expectations, driven by strong growth in China and ramp-up of the Cybertruck production lines.' },
    { title: 'Tesla expansion plans in Berlin hit local regulatory roadblocks', url: 'https://www.bloomberg.com/news/tesla-berlin-halt', source: 'Bloomberg', publishedAt: '2026-07-09', summary: 'Teslas Gigafactory extension in Germany is paused due to environmental complaints regarding water consumption, delaying production growth estimates.' },
    { title: 'Tesla CEO Elon Musk hints at upcoming Robotaxi event', url: 'https://www.reuters.com/business/autos/tesla-robotaxi', source: 'Reuters', publishedAt: '2026-07-06', summary: 'Musk confirms the self-driving Robotaxi demonstration is scheduled for next month, shifting focus toward autonomous driving tech and AI capabilities.' }
  ]
};

/**
 * Fetch news articles from NewsAPI
 */
async function fetchNewsApi(symbol, token) {
  const url = `https://newsapi.org/v2/everything?q=${symbol.toUpperCase()}+company+financials&sortBy=publishedAt&pageSize=10&apiKey=${token}`;
  const response = await axios.get(url);
  
  if (response.data && response.data.articles) {
    return response.data.articles.map(article => ({
      title: article.title || 'No Title',
      url: article.url || '',
      source: article.source?.name || 'NewsAPI',
      publishedAt: article.publishedAt ? article.publishedAt.split('T')[0] : 'Unknown',
      summary: article.description || article.content || 'No summary available.'
    }));
  }
  return [];
}

/**
 * Fetch search results from Tavily Search
 */
async function fetchTavilySearch(symbol, token) {
  const url = 'https://api.tavily.com/search';
  const query = `${symbol.toUpperCase()} company stock financials recent news earnings acquisitions lawsuits management changes`;
  
  const response = await axios.post(url, {
    api_key: token,
    query: query,
    search_depth: 'basic',
    max_results: 6
  });

  if (response.data && response.data.results) {
    return response.data.results.map(result => ({
      title: result.title || 'No Title',
      url: result.url || '',
      source: 'Tavily Search',
      publishedAt: new Date().toISOString().split('T')[0], // Tavily returns live search content
      summary: result.content || 'No summary available.'
    }));
  }
  return [];
}

/**
 * News Tool
 *
 * Purpose:
 * LangChain tool that queries news articles and web search summaries for a stock symbol.
 * Uses NewsAPI and/or Tavily Search. Integrates RetryManager for reliability and serves
 * mock news entries on credential deficiency.
 */
export const newsTool = tool(
  async ({ symbol }) => {
    const ticker = symbol.toUpperCase();
    logger.info(`[NewsTool] Retrieving corporate news for ticker: ${ticker}`);

    const hasNewsKey = env.NEWS_API_KEY && env.NEWS_API_KEY !== 'your_news_api_key_here';
    const hasTavilyKey = env.TAVILY_API_KEY && env.TAVILY_API_KEY !== 'your_tavily_api_key_here';

    // If both keys are missing, return mock news for testing
    if (!hasNewsKey && !hasTavilyKey) {
      logger.warn(`[NewsTool] News API Keys missing. Fetching mock articles for ${ticker}.`);
      if (MOCK_NEWS[ticker]) {
        return JSON.stringify(MOCK_NEWS[ticker]);
      }
      return JSON.stringify([
        {
          title: `No live news available for ${ticker}`,
          url: '',
          source: 'System Mock',
          publishedAt: new Date().toISOString().split('T')[0],
          summary: 'Please configure either NEWS_API_KEY or TAVILY_API_KEY to retrieve live news reports.'
        }
      ]);
    }

    // Try NewsAPI first if key is present
    if (hasNewsKey) {
      try {
        const news = await runWithRetry(
          () => fetchNewsApi(ticker, env.NEWS_API_KEY),
          `NewsAPI Query for ${ticker}`
        );
        if (news.length > 0) {
          return JSON.stringify(news);
        }
      } catch (error) {
        logger.error(`[NewsTool] NewsAPI failed. Attempting Tavily fallback. Error: ${error.message}`);
      }
    }

    // Fallback to Tavily Search if key is present
    if (hasTavilyKey) {
      try {
        const news = await runWithRetry(
          () => fetchTavilySearch(ticker, env.TAVILY_API_KEY),
          `Tavily Search Query for ${ticker}`
        );
        if (news.length > 0) {
          return JSON.stringify(news);
        }
      } catch (error) {
        logger.error(`[NewsTool] Tavily search failed: ${error.message}`);
      }
    }

    // If live queries failed, try mocks before throwing
    if (MOCK_NEWS[ticker]) {
      logger.warn(`[NewsTool] Returning mock news for ${ticker} as a fallback.`);
      return JSON.stringify(MOCK_NEWS[ticker]);
    }

    throw new Error(`Failed to query news from NewsAPI or Tavily Search for symbol ${ticker}.`);
  },
  {
    name: 'fetch_latest_news',
    description: 'Retrieves latest news headlines, earnings reports, lawsuits, product launches, and general search reports for a stock ticker.',
    schema: z.object({
      symbol: z.string().describe('The stock ticker symbol of the company, e.g. TSLA, AAPL'),
    }),
  }
);

export default newsTool;
