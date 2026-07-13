import logger from '../logger/logger.js';

/**
 * Global Express Error Handling Middleware
 * 
 * Purpose:
 * Intercepts uncaught errors inside route handlers.
 * Logs structured details with Pino, and formats standard JSON payloads to the user.
 */

export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`[ErrorHandler] Captured exception on path ${req.path}: ${message}`, {
    stack: err.stack,
    status
  });

  return res.status(status).json({
    success: false,
    error: message,
    // Avoid returning stacks in production environments for compliance security
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

export default errorHandler;
