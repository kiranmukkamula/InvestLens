/**
 * Company Mapper
 * 
 * Purpose:
 * Transforms raw corporate profile data into the canonical company structure.
 * Renames fields, sanitizes employees/market cap, and secures defaults.
 *
 * Inputs:
 * - company (Object): Raw profile returned from the Research Node
 * - ticker (string): Ticker identifier fallback
 *
 * Returns:
 * - Object: Conforming to the company section of the investmentSchema
 */
export function mapCompany(company, ticker) {
  const fallbackTicker = (ticker || 'UNKNOWN').toUpperCase();

  if (!company) {
    return {
      name: `${fallbackTicker} Corporation`,
      ticker: fallbackTicker,
      industry: 'Unknown',
      ceo: 'Unknown',
      headquarters: 'Unknown',
      employees: 0,
      ipoDate: 'Unknown',
      marketCapitalization: 0,
      competitors: [],
      description: `Historical data available for ${fallbackTicker}. Profile details missing.`
    };
  }

  // Standardize employees and capital counts
  const cleanEmployees = typeof company.employees === 'number' && !isNaN(company.employees) 
    ? company.employees 
    : parseInt(company.employees, 10) || 0;

  const cleanMarketCap = typeof company.marketCapitalization === 'number' && !isNaN(company.marketCapitalization)
    ? company.marketCapitalization
    : parseFloat(company.marketCapitalization) || 0;

  return {
    name: company.name || `${fallbackTicker} Corporation`,
    ticker: company.ticker || fallbackTicker,
    industry: company.industry || 'Unknown',
    ceo: company.ceo || 'Unknown',
    headquarters: company.headquarters || 'Unknown',
    employees: cleanEmployees,
    ipoDate: company.ipoDate || 'Unknown',
    marketCapitalization: cleanMarketCap,
    competitors: Array.isArray(company.competitors) ? company.competitors : [],
    description: company.description || 'Corporate description not provided.'
  };
}

export default mapCompany;
