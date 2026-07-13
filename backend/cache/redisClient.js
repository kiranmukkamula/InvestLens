import Redis from 'ioredis';
import env from '../config/env.js';
import logger from '../logger/logger.js';
import constants from '../config/constants.js';

/**
 * Redis Connection Client
 *
 * Purpose:
 * Directly connects to the Redis caching instance using environment-specified parameters.
 * Sets up linear retry logic and logs status updates (connection, disconnection, error).
 * Exports the active Redis connection instance.
 */

let redisClient = null;

try {
  logger.info(`Attempting to connect to Redis cache server at: ${env.REDIS_URL}`);
  
  redisClient = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      // Connect up to MAX_ATTEMPTS from config/constants
      if (times > constants.RETRY.MAX_ATTEMPTS) {
        logger.warn(`Redis connection failed after ${times} retries. Operating in cache-less mode.`);
        return null; // Cease reconnection attempts
      }
      // Calculate backoff delay
      return Math.min(times * constants.RETRY.INITIAL_DELAY_MS, constants.RETRY.MAX_DELAY_MS);
    }
  });

  redisClient.on('connect', () => {
    logger.info('Connected to Redis cache server successfully.');
  });

  redisClient.on('error', (err) => {
    logger.error(`Redis Client Error: ${err.message}`);
  });
} catch (error) {
  logger.error('Failed to initialize Redis client connection:', error);
}

export default redisClient;
