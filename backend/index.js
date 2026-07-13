import express from 'express';
import cors from 'cors';
import env from './config/env.js';
import analyzeRoutes from './routes/analyzeRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import logger from './logger/logger.js';

/**
 * Express Server Initialization
 * 
 * Purpose:
 * Core entrypoint file for the backend server.
 * Instantiates the Express application, configures CORS/body-parser middleware,
 * logs request traffic, mounts API routes, and binds the final exception handlers.
 */

const app = express();

// Enable Cross-Origin Resource Sharing for React client interactions
app.use(cors());

// Parse incoming application/json requests
app.use(express.json());

// Log all incoming server request logs using Pino
app.use((req, res, next) => {
  logger.info(`[Server] ${req.method} request received on path: ${req.path}`);
  next();
});

// Mount modular API routing pipelines
app.use('/api/analyze', analyzeRoutes);

// Register global exception catching middleware
app.use(errorHandler);

// Retrieve server port configuration from variables
const PORT = env.PORT || 3000;

// Start server listener
app.listen(PORT, () => {
  logger.info(`[Server] Enterprise AI Investment Advisor server is listening on port: ${PORT}`);
  logger.info(`[Server] Node Environment: ${env.NODE_ENV}`);
});

export default app;
