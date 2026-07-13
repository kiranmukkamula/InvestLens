import logger from '../../logger/logger.js';
import constants from '../../config/constants.js';

/**
 * Exponential Backoff Retry Manager
 *
 * Purpose:
 * Executes asynchronous tasks (e.g., API requests) and handles temporary network failures
 * by retrying with an exponential delay backoff.
 *
 * Inputs:
 * - fn (Function): An asynchronous function to be executed.
 * - identifier (string): Descriptive label of the operation for logging.
 *
 * Returns:
 * - Promise<any>: The resolved value of the input async function.
 *
 * Internal Workflow:
 * 1. Executes the target function.
 * 2. If it succeeds, returns the result immediately.
 * 3. If it fails, checks if the attempt limit (RETRY.MAX_ATTEMPTS) is reached.
 * 4. If yes, throws a finalized exception.
 * 5. If no, calculates the delay using exponential growth capped at RETRY.MAX_DELAY_MS, waits, and retries.
 */
export async function runWithRetry(fn, identifier) {
  let attempt = 1;
  let currentDelay = constants.RETRY.INITIAL_DELAY_MS;

  while (attempt <= constants.RETRY.MAX_ATTEMPTS) {
    try {
      logger.info(`[RetryManager] Executing: ${identifier} (Attempt ${attempt}/${constants.RETRY.MAX_ATTEMPTS})`);
      
      // Inject timeout to prevent requests from hanging indefinitely
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request Timeout')), constants.RETRY.TIMEOUT_MS)
      );
      
      // Race the actual function against the configured timeout
      const result = await Promise.race([fn(), timeoutPromise]);
      return result;
    } catch (error) {
      logger.error(`[RetryManager] Error on attempt ${attempt} for ${identifier}: ${error.message}`);

      if (attempt === constants.RETRY.MAX_ATTEMPTS) {
        logger.error(`[RetryManager] All ${constants.RETRY.MAX_ATTEMPTS} attempts exhausted for ${identifier}.`);
        throw new Error(`Failed execution of '${identifier}' after ${constants.RETRY.MAX_ATTEMPTS} attempts. Error: ${error.message}`);
      }

      logger.info(`[RetryManager] Waiting ${currentDelay}ms before retrying ${identifier}...`);
      await new Promise((resolve) => setTimeout(resolve, currentDelay));

      // Calculate next backoff delay
      currentDelay = Math.min(
        currentDelay * constants.RETRY.BACKOFF_FACTOR,
        constants.RETRY.MAX_DELAY_MS
      );
      attempt++;
    }
  }
}
