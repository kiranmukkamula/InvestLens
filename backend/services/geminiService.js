import { ChatGroq } from '@langchain/groq';
import env from '../config/env.js';
import logger from '../logger/logger.js';

/**
 * Reusable LLM Service Client (Groq Pivot)
 *
 * Purpose:
 * Instantiates the ChatGroq model client exactly once.
 * Configures the Groq API key, model name (llama-3.3-70b-versatile), and temperature.
 * Retains the export name `geminiInstance` for seamless backward compatibility.
 */

logger.info('Initializing reusable Groq Llama 3.3 70B client...');

let geminiInstance = null;

try {
  if (!env.GROQ_API_KEY) {
    logger.error('GROQ_API_KEY environment variable is missing. Reusable Groq service instantiation failed.');
  }

  geminiInstance = new ChatGroq({
    model: 'llama-3.3-70b-versatile', // Groq Llama 3.3 70B model name
    apiKey: env.GROQ_API_KEY,
    temperature: 0.1, // Set to low value for deterministic financial analysis and reasoning
    maxRetries: 2, // Standard LangChain retry attempt limit
  });

  logger.info('Groq Llama 3.3 70B client instantiated successfully.');
} catch (error) {
  logger.error('Error during Groq model client creation:', error);
}

export default geminiInstance;
