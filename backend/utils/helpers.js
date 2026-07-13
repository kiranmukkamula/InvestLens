/**
 * General Utilities & Helper Functions
 * 
 * Purpose:
 * Centralizes basic utility logic (safe parsing, delays) for reuse across backend files.
 */

/**
 * Attempts to parse JSON string. Returns fallback if it fails.
 *
 * Inputs:
 * - str (string): JSON string
 * - fallback (any): Value to return on parse failure
 *
 * Returns:
 * - Object|Array|any: Parsed JSON payload or fallback
 */
export function safeJsonParse(str, fallback = null) {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/**
 * Asynchronous Sleep helper
 *
 * Inputs:
 * - ms (number): Milliseconds to sleep
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default {
  safeJsonParse,
  sleep
};
