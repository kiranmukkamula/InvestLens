import env from '../config/env.js';
import logger from '../logger/logger.js';

try {
  logger.info('Attempting to list models using old SDK @google/generative-ai...');
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  
  // We can fetch from ListModels endpoint directly using native fetch
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${env.GEMINI_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  
  if (data.error) {
    logger.error('Google API returned error: ' + JSON.stringify(data.error));
  } else {
    logger.info('Available models for your API key:');
    for (const model of data.models || []) {
      logger.info(`- Name: ${model.name} (DisplayName: ${model.displayName})`);
    }
  }
} catch (err) {
  logger.error('Failed to list models: ' + err.stack);
}
