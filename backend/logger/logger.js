import pino from 'pino';
import dotenv from 'dotenv';

// Load environment variables for configuration
dotenv.config();

/**
 * Pino Logger Initialization
 *
 * Purpose:
 * Provides structured, low-overhead logging for the entire application.
 * Categorizes logs for API calls, caching status, LangGraph nodes, and server requests.
 * Uses 'pino-pretty' in development mode and JSON serialization in production.
 */

const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});

export default logger;
