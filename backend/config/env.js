import dotenv from 'dotenv';
import logger from '../logger/logger.js';

// Load environmental parameters
dotenv.config();

/**
 * Environmental Configuration Configuration
 *
 * Purpose:
 * Centralizes, parses, and validates environment variables.
 * Exports a read-only frozen configuration object.
 */

const env = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  FINNHUB_API_KEY: process.env.FINNHUB_API_KEY || '',
  NEWS_API_KEY: process.env.NEWS_API_KEY || '',
  TAVILY_API_KEY: process.env.TAVILY_API_KEY || '',
  FMP_API_KEY: process.env.FMP_API_KEY || '',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

// Check for missing or placeholder credentials to warn the administrator on startup
const placeholders = [
  'your_gemini_api_key_here',
  'your_finnhub_api_key_here',
  'your_news_api_key_here',
  'your_tavily_api_key_here',
  'your_fmp_api_key_here',
  'your_groq_api_key_here'
];

if (!env.GEMINI_API_KEY || placeholders.includes(env.GEMINI_API_KEY)) {
  logger.warn('GEMINI_API_KEY is not defined or is set to placeholder. Gemini agent calls will fail.');
}

if (!env.FINNHUB_API_KEY || placeholders.includes(env.FINNHUB_API_KEY)) {
  logger.warn('FINNHUB_API_KEY is not defined or is set to placeholder. Finnhub API requests will fail.');
}

if (!env.NEWS_API_KEY || placeholders.includes(env.NEWS_API_KEY)) {
  logger.warn('NEWS_API_KEY is not defined or is set to placeholder. NewsAPI requests will fail.');
}

if (!env.TAVILY_API_KEY || placeholders.includes(env.TAVILY_API_KEY)) {
  logger.warn('TAVILY_API_KEY is not defined or is set to placeholder. Tavily search operations will fail.');
}

if (!env.FMP_API_KEY || placeholders.includes(env.FMP_API_KEY)) {
  logger.warn('FMP_API_KEY is not defined or is set to placeholder. FMP data requests will fail and fall back to mock data.');
}

if (!env.GROQ_API_KEY || placeholders.includes(env.GROQ_API_KEY)) {
  logger.warn('GROQ_API_KEY is not defined or is set to placeholder. Groq LLM queries will fail.');
}

export default Object.freeze(env);
