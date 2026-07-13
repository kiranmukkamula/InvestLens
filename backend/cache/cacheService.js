import redisClient from './redisClient.js';
import logger from '../logger/logger.js';

/**
 * Cache Service Wrapper
 *
 * Purpose:
 * Provides standard interfaces (get, set, del, exists) for caching company advisor reports.
 * Checks connection state and intercepts errors to prevent server failures when Redis is offline.
 */

/**
 * Checks if the Redis client is instantiated and ready.
 *
 * Returns:
 * - boolean: True if ready to perform cache operations, false otherwise.
 */
function isCacheReady() {
  return redisClient && redisClient.status === 'ready';
}

/**
 * Retrieve cached JSON object by key.
 *
 * Inputs:
 * - key (string): Cache identifier
 *
 * Returns:
 * - Object | null: Parsed JSON object if cache hit, null if miss/offline.
 */
export async function get(key) {
  if (!isCacheReady()) {
    logger.debug(`Redis cache is offline. Skipping cache read for key: ${key}`);
    return null;
  }

  try {
    const rawData = await redisClient.get(key);
    if (rawData) {
      logger.info(`Cache HIT for key: ${key}`);
      return JSON.parse(rawData);
    }
    logger.info(`Cache MISS for key: ${key}`);
    return null;
  } catch (error) {
    logger.error(`Error reading key ${key} from Redis cache:`, error);
    return null;
  }
}

/**
 * Store an object in the cache with a specified TTL.
 *
 * Inputs:
 * - key (string): Cache identifier
 * - value (Object): Javascript object to stringify and cache
 * - ttlSeconds (number): Cache TTL in seconds
 *
 * Returns:
 * - boolean: True if caching succeeded, false otherwise.
 */
export async function set(key, value, ttlSeconds = 300) {
  if (!isCacheReady()) {
    logger.debug(`Redis cache is offline. Skipping cache write for key: ${key}`);
    return false;
  }

  try {
    const serialized = JSON.stringify(value);
    await redisClient.set(key, serialized, 'EX', ttlSeconds);
    logger.info(`Cache SAVE success for key: ${key} (TTL: ${ttlSeconds}s)`);
    return true;
  } catch (error) {
    logger.error(`Error saving key ${key} to Redis cache:`, error);
    return false;
  }
}

/**
 * Delete a cache entry by key.
 *
 * Inputs:
 * - key (string): Cache identifier
 *
 * Returns:
 * - boolean: True if key was deleted, false otherwise.
 */
export async function del(key) {
  if (!isCacheReady()) {
    logger.debug(`Redis cache is offline. Skipping delete for key: ${key}`);
    return false;
  }

  try {
    const count = await redisClient.del(key);
    logger.info(`Cache DELETE success for key: ${key}`);
    return count > 0;
  } catch (error) {
    logger.error(`Error deleting key ${key} from Redis cache:`, error);
    return false;
  }
}

/**
 * Check if cache key exists.
 *
 * Inputs:
 * - key (string): Cache identifier
 *
 * Returns:
 * - boolean: True if exists, false otherwise.
 */
export async function exists(key) {
  if (!isCacheReady()) {
    logger.debug(`Redis cache is offline. Skipping exists check for key: ${key}`);
    return false;
  }

  try {
    const presence = await redisClient.exists(key);
    return presence === 1;
  } catch (error) {
    logger.error(`Error checking presence for key ${key} in Redis cache:`, error);
    return false;
  }
}

export default {
  get,
  set,
  del,
  exists,
};
