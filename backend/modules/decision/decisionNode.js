import logger from '../../logger/logger.js';

/**
 * Decision Node (Groq Upgraded - Pass-Through)
 *
 * Purpose:
 * Core LangGraph node that produces the final Investment Decision Report.
 * Acting as a pass-through when decision parameters are already populated
 * in the single-pass unified node, saving redundant API calls and rate limits.
 *
 * Inputs:
 * - state (GraphState): Includes qualitative analysis and rating decision from unified step.
 *
 * Returns:
 * - GraphState updates: Empty (or errors if missing).
 */
export async function decisionNode(state) {
  const companyName = state.companyName || '';
  logger.info(`[DecisionNode] Evaluating unified decision state for: "${companyName}"`);

  const decision = state.decision;
  if (!decision) {
    logger.error('[DecisionNode] Decision report missing in GraphState. Retrying backup analysis might be needed.');
    return {
      errors: ['Decision report missing in GraphState.']
    };
  }

  logger.info(`[DecisionNode] Unified decision found. Skipping second LLM call. Stance: ${decision.recommendation}, Score: ${decision.overallInvestmentScore}`);
  return {};
}

export default decisionNode;
