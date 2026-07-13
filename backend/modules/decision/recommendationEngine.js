/**
 * Recommendation Engine Rules
 * 
 * Purpose:
 * Specifies the mathematical weights for computing the overall investment score,
 * and sets strict gating rules for ratings (INVEST, WATCH, PASS) to ensure consistency.
 */

export const recommendationEngineRules = `
=== Recommendation Gating Rules & Weights ===

1. Weighted Score Calculations:
   Compute the Overall Investment Score using these weights:
   - Financial Score: 40% (Primary anchor of viability)
   - Business Score: 30% (Moat and position)
   - Growth Score: 10% (Expansion vectors)
   - Risk Score: 10% (Safety mitigation)
   - News Score: 10% (Sentiment and updates)

2. Actionable Ratings Selection Criteria (You must choose EXACTLY one of 'INVEST' or 'PASS'):

   - 'INVEST' (Requires ALL conditions):
     * Overall Investment Score >= 80
     * Financial Score >= 75
     * Risk Score >= 70 (No immediate default or critical distress risks)
     * Confidence Level >= 0.75
     
   - 'PASS' (Triggered if ANY condition is met, or if any condition for 'INVEST' is not met):
     * Overall Investment Score < 80
     * Financial Score < 75
     * Risk Score < 70
     * Confidence Level < 0.75
     * Net Income is negative for all years evaluated.
     * Debt Ratio (Liabilities / Assets) exceeds 0.80.
`;

export default recommendationEngineRules;
