import { z } from 'zod';

/**
 * Investment Decision Schema
 *
 * Purpose:
 * Defines the strict structural contract for the final Investment Decision Report.
 * Validates scores, the recommendation type, outlook details, risks, and cited sources.
 */

export const decisionSchema = z.object({
  businessScore: z.number().min(0).max(100).describe('Score reflecting business model moat, market share, and product quality (0-100).'),
  financialScore: z.number().min(0).max(100).describe('Score reflecting leverage health, cash flows, liquidity, and margins (0-100).'),
  newsScore: z.number().min(0).max(100).describe('Score reflecting sentiment and impact of recent corporate news (0-100).'),
  riskScore: z.number().min(0).max(100).describe('Score representing safety from risks. 100 means low risk/extremely safe, 0 means high danger (0-100).'),
  growthScore: z.number().min(0).max(100).describe('Score reflecting growth runway, market expansion, and R&D velocity (0-100).'),
  overallInvestmentScore: z.number().min(0).max(100).describe('Weighted overall score derived from individual category scores (0-100).'),
  recommendation: z.enum(['INVEST', 'PASS']).describe('The final actionable investment stance: INVEST or PASS.'),
  confidenceLevel: z.number().min(0).max(1).describe('The confidence index of the decision (0.0 to 1.0).'),
  shortTermOutlook: z.string().describe('Outlook and primary trends for the next 12 months (e.g. Bullish, Neutral, Bearish).'),
  longTermOutlook: z.string().describe('Outlook and secular trends for the next 3-5 years (e.g. Bullish, Neutral, Bearish).'),
  topReasons: z.array(z.string()).describe('Top reasons supporting the investment decision.'),
  majorRisks: z.array(z.string()).describe('Major headwinds, operational risks, or leverage red flags.'),
  detailedExplanation: z.string().describe('Comprehensive investment thesis explaining the rating, scores, and trade-offs.'),
  evidenceUsed: z.array(z.string()).describe('Explicit lists of numbers, margins, dates, or headlines used from the raw research.')
});

export default decisionSchema;
