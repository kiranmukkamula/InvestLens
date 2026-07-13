import mapCompany from './companyMapper.js';
import mapFinancials from './financialMapper.js';
import mapNews from './newsMapper.js';
import investmentSchema from './investmentSchema.js';
import logger from '../../logger/logger.js';

/**
 * Canonical Data Mapper Node
 *
 * Purpose:
 * Core LangGraph node that processes and standardizes raw gathered research.
 * Combines profiles, financial matrices, and news into a validated common schema structure.
 *
 * Inputs:
 * - state (GraphState): Includes rawResearch datasets gathered in the prior node.
 *
 * Returns:
 * - GraphState updates: Appends validated investmentData structure and reports errors if any.
 *
 * Internal Workflow:
 * 1. Invokes mapCompany to build profile objects.
 * 2. Invokes mapFinancials (combining financial data & market capitalization) to format statements.
 * 3. Invokes mapNews to filter duplicates.
 * 4. Merges sections and validates via investmentSchema (Zod).
 * 5. Returns validated result to graph state.
 */
export async function canonicalMapperNode(state) {
  const companyName = state.companyName || '';
  const rawResearch = state.rawResearch || {};
  logger.info(`[CanonicalMapperNode] Executing mapper node for: "${companyName}"`);

  const mapperErrors = [];
  let investmentData = null;

  try {
    // 1. Map Company Profile Details
    const company = mapCompany(rawResearch.company, companyName);

    // 2. Map Financial Statements (pass market cap for PE/PEG valuations if missing)
    const financials = mapFinancials(rawResearch.financials, company.marketCapitalization);

    // 3. Map News Headlines
    const news = mapNews(rawResearch.news);

    // 4. Assemble the unified InvestmentData object
    const candidatePayload = {
      company,
      financials,
      news
    };

    // 5. Apply strict schema validation
    const validationResult = investmentSchema.safeParse(candidatePayload);
    
    if (!validationResult.success) {
      const detailedErrors = validationResult.error.errors
        .map(err => `[${err.path.join('.')}] - ${err.message}`)
        .join('; ');
      
      logger.error(`[CanonicalMapperNode] Schema Validation Failed: ${detailedErrors}`);
      mapperErrors.push(`Zod validation error: ${detailedErrors}`);
      
      // Fallback: store candidate to allow agents to attempt reasoning despite strict syntax alerts
      investmentData = candidatePayload;
    } else {
      logger.info('[CanonicalMapperNode] Output verified successfully against InvestmentData schema.');
      investmentData = validationResult.data;
    }
  } catch (error) {
    logger.error(`[CanonicalMapperNode] Mapping process crash: ${error.message}`);
    mapperErrors.push(`Mapper Exception: ${error.message}`);
  }

  return {
    investmentData,
    errors: mapperErrors
  };
}

export {
  mapCompany,
  mapFinancials,
  mapNews
};

export default canonicalMapperNode;
