import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import YahooFinanceClass from 'yahoo-finance2';
import logger from '../../logger/logger.js';
import { runWithRetry } from './retryManager.js';

const yahooFinance = new YahooFinanceClass();

/**
 * Robust Mock Profiles for Demonstration/Testing
 */
const MOCK_PROFILES = {
  AAPL: {
    name: 'Apple Inc.',
    industry: 'Technology / Consumer Electronics',
    ceo: 'Tim Cook',
    headquarters: 'Cupertino, CA, US',
    employees: 164000,
    ipoDate: '1980-12-12',
    marketCapitalization: 3450000000000,
    competitors: ['MSFT', 'GOOG', 'META', 'AMZN'],
    description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories, and sells various related services worldwide.'
  },
  TSLA: {
    name: 'Tesla, Inc.',
    industry: 'Automotive / Clean Energy',
    ceo: 'Elon Musk',
    headquarters: 'Austin, TX, US',
    employees: 140473,
    ipoDate: '2010-06-29',
    marketCapitalization: 780000000000,
    competitors: ['BYD', 'NIO', 'F', 'GM', 'VWAGY'],
    description: 'Tesla, Inc. designs, develops, manufactures, sells, and leases fully electric vehicles, energy generation and storage systems, and offers services related to its products.'
  },
  MSFT: {
    name: 'Microsoft Corporation',
    industry: 'Technology / Software',
    ceo: 'Satya Nadella',
    headquarters: 'Redmond, WA, US',
    employees: 221000,
    ipoDate: '1986-03-13',
    marketCapitalization: 3200000000000,
    competitors: ['AAPL', 'AMZN', 'GOOG', 'ORCL'],
    description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide, leading in cloud computing and enterprise software.'
  }
};

/**
 * Fetch company profile from Yahoo Finance
 *
 * Inputs:
 * - symbol (string): Company stock ticker
 */
async function fetchYahooProfile(symbol) {
  const ticker = symbol.toUpperCase();
  const result = await yahooFinance.quoteSummary(ticker, { modules: ['assetProfile', 'price'] });
  
  if (!result || !result.assetProfile) {
    throw new Error(`Profile not found for symbol: ${ticker}`);
  }
  
  const rawProfile = result.assetProfile;
  const rawPrice = result.price || {};
  
  // Find CEO
  const ceoOfficer = rawProfile.companyOfficers?.find(o => 
    o.title?.toLowerCase().includes('ceo') || 
    o.title?.toLowerCase().includes('chief executive officer')
  );
  const ceo = ceoOfficer ? ceoOfficer.name : (rawProfile.companyOfficers?.[0]?.name || 'Unknown');
  
  // Headquarters
  const city = rawProfile.city || '';
  const state = rawProfile.state || '';
  const country = rawProfile.country || '';
  const hqString = [city, state, country].filter(val => val !== '').join(', ');

  // Competitors list
  let competitors = ['MSFT', 'AAPL', 'GOOGL', 'AMZN', 'META'].filter(item => item !== ticker);

  return {
    name: rawPrice.longName || rawPrice.shortName || 'Unknown',
    industry: rawProfile.industry || 'Unknown',
    ceo: ceo,
    headquarters: hqString || 'Unknown',
    employees: rawProfile.fullTimeEmployees ? parseInt(rawProfile.fullTimeEmployees, 10) : 0,
    ipoDate: 'Unknown',
    marketCapitalization: rawPrice.marketCap || 0,
    competitors: competitors.slice(0, 5),
    description: rawProfile.longBusinessSummary || 'No description available.'
  };
}

/**
 * Company Tool (Yahoo Finance Powered)
 *
 * Purpose:
 * LangChain tool to fetch profile details using Yahoo Finance API.
 * Integrates RetryManager and falls back to mock profiles if query fails.
 */
export const companyTool = tool(
  async ({ symbol }) => {
    const ticker = symbol.toUpperCase();
    logger.info(`[CompanyTool] Fetching company details for: ${ticker}`);

    try {
      const profile = await runWithRetry(
        () => fetchYahooProfile(ticker),
        `Yahoo Finance Profile Fetch for ${ticker}`
      );
      return JSON.stringify(profile);
    } catch (error) {
      logger.error(`[CompanyTool] Yahoo Finance failed. Checking local mock fallback. Error: ${error.message}`);
      if (MOCK_PROFILES[ticker]) {
        logger.info(`[CompanyTool] Serving fallback mock data for: ${ticker}`);
        return JSON.stringify(MOCK_PROFILES[ticker]);
      }
      throw error;
    }
  },
  {
    name: 'fetch_company_profile',
    description: 'Retrieves corporate profile data including Name, CEO, Industry, HQ, Employees, IPO Date, Description, and Market Cap.',
    schema: z.object({
      symbol: z.string().describe('The stock ticker symbol of the company, e.g. TSLA, AAPL'),
    }),
  }
);

export default companyTool;
