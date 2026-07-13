/**
 * Scoring Engine Criteria
 * 
 * Purpose:
 * Codifies the rules for assigning category scores (0-100) based on qualitative analysis
 * and metrics to eliminate arbitrary scoring by the LLM.
 */

export const scoringEngineRules = `
=== Scoring System Guidelines (0 to 100) ===

1. Business Score:
   - [90-100]: Dominant market lead, wide economic moat (network effects, patents, high switching costs), and strong pricing power.
   - [70-89]: Healthy market share, clear competitive advantage, stable customer base.
   - [50-69]: Average position, intense competition, vulnerable to industry shifts.
   - [<50]: Declining brand value, no technological edge, or operates in a highly commoditized market.

2. Financial Score:
   - [85-100]: Consistent revenue and profit growth, operating margins > 15%, debt ratio < 0.40, current ratio > 1.5, positive and expanding free cash flows.
   - [65-84]: Stable financials, flat margins, moderate leverage (debt ratio 0.40 to 0.60), positive operating cash flow.
   - [<65]: Declining revenue or net losses, contracting margins, high leverage (debt ratio > 0.70), current ratio < 1.0, or negative cash flow generation.

3. News Score:
   - [80-100]: Dominance of positive press (earnings beats, strategic partnerships, new product success), and zero regulatory filings or material lawsuits.
   - [50-79]: Mixed headlines, standard compliance lawsuits, normal management turnover, minor macro headwinds.
   - [<50]: High concentration of negative headlines (regulatory investigations, product recalls, key executive departures, class-action lawsuits).

4. Risk Score (Higher is Safer / Lower is More Dangerous):
   - [80-100]: Stable macroeconomic environment, minor litigation, low debt burden, low competitive threats.
   - [50-79]: Moderate threats from competitors, potential regulatory changes, or interest rate sensitivities.
   - [<50]: Critical distress flags (potential default, ongoing DOJ investigations, severe supply chain vulnerability, disruptive competitor entry).

5. Growth Score:
   - [80-100]: High secular growth industry, significant expansion runway, high R&D reinvestment rates.
   - [<50]: Stagnant or contracting industry, structural saturation, low capital expenditure, or failure to launch new products.
`;

export default scoringEngineRules;
