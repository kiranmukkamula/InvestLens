import companyTool from './companyTool.js';
import financialTool from './financialTool.js';
import newsTool from './newsTool.js';
import logger from '../../logger/logger.js';

/**
 * Research Node (Upgraded - Deterministic JS Parallel)
 *
 * Purpose:
 * Core LangGraph node that manages data collection for the target company.
 * Invokes the three data retrieval tools directly and concurrently in JS,
 * bypassing any token-heavy and rate-limited LLM ReAct loops.
 *
 * Inputs:
 * - state (GraphState): Current shared state containing target stock/companyName.
 *
 * Returns:
 * - GraphState updates: Appends rawResearch and logs errors if any tool failed.
 */
export async function researchNode(state) {
  const companyName = state.companyName || '';
  logger.info(`[ResearchNode] Starting deterministic parallel data collection for: "${companyName}"`);

  let companyData = null;
  let financialData = null;
  let newsData = null;
  const errors = [];

  try {
    // Invoke all three data tools concurrently in JS
    const [profileRaw, financialsRaw, newsRaw] = await Promise.all([
      companyTool.invoke({ symbol: companyName }),
      financialTool.invoke({ symbol: companyName }),
      newsTool.invoke({ symbol: companyName })
    ]);

    companyData = JSON.parse(profileRaw);
    financialData = JSON.parse(financialsRaw);
    newsData = JSON.parse(newsRaw);
  } catch (error) {
    logger.error(`[ResearchNode] Direct tool queries failed: ${error.message}`);
  }

  // Build research dataset
  const rawResearch = {
    company: companyData,
    financials: financialData,
    news: newsData
  };

  // Check completeness and gather errors
  if (!companyData) errors.push('Failed to gather company profile information.');
  if (!financialData) errors.push('Failed to gather financial statements.');
  if (!newsData) errors.push('Failed to gather latest news articles.');

  logger.info(`[ResearchNode] Complete. Gathered Company Profile: ${!!companyData}, Financials: ${!!financialData}, News: ${!!newsData}`);

  return {
    rawResearch,
    errors
  };
}

export default researchNode;
