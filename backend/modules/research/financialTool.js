import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import YahooFinanceClass from 'yahoo-finance2';
import logger from '../../logger/logger.js';
import { runWithRetry } from './retryManager.js';

const yahooFinance = new YahooFinanceClass();

/**
 * Robust Mock Financial Data for Demonstration/Testing
 */
const MOCK_FINANCIALS = {
  AAPL: {
    annual: {
      incomeStatements: [
        { calendarDate: '2023-09-30', totalRevenue: 383285000000, netIncome: 96995000000, operatingIncome: 114301000000, costOfRevenue: 214137000000, ebit: 114301000000 },
        { calendarDate: '2022-09-24', totalRevenue: 394328000000, netIncome: 99803000000, operatingIncome: 119437000000, costOfRevenue: 223546000000, ebit: 119437000000 }
      ],
      balanceSheets: [
        { calendarDate: '2023-09-30', totalAssets: 352583000000, totalLiabilitiesNetMinorityInterest: 290437000000, totalStockholderEquity: 62146000000, currentAssets: 143566000000, currentLiabilities: 145308000000, inventory: 6331000000, cashAndCashEquivalents: 29965000000 }
      ],
      cashFlows: [
        { calendarDate: '2023-09-30', operatingCashFlow: 110543000000, capitalExpenditure: -10959000000, freeCashFlow: 99584000000 }
      ]
    },
    quarterly: {
      incomeStatements: [
        { calendarDate: '2024-03-30', totalRevenue: 90753000000, netIncome: 23636000000 }
      ]
    }
  },
  TSLA: {
    annual: {
      incomeStatements: [
        { calendarDate: '2023-12-31', totalRevenue: 96773000000, netIncome: 14974000000, operatingIncome: 8891000000, costOfRevenue: 79113000000, ebit: 8891000000 }
      ],
      balanceSheets: [
        { calendarDate: '2023-12-31', totalAssets: 104409000000, totalLiabilitiesNetMinorityInterest: 43009000000, totalStockholderEquity: 61399000000, currentAssets: 49616000000, currentLiabilities: 28748000000, inventory: 13626000000, cashAndCashEquivalents: 16388000000 }
      ],
      cashFlows: [
        { calendarDate: '2023-12-31', operatingCashFlow: 13256000000, capitalExpenditure: -8899000000, freeCashFlow: 4357000000 }
      ]
    },
    quarterly: {
      incomeStatements: [
        { calendarDate: '2024-03-31', totalRevenue: 21301000000, netIncome: 1129000000 }
      ]
    }
  }
};

/**
 * Normalizes Yahoo Finance modules into a clean data layout
 *
 * Inputs:
 * - data (Object): Quote summary response object
 */
function parseYahooFinanceData(data) {
  const getVal = (obj) => {
    if (obj === null || obj === undefined) return null;
    if (typeof obj === 'object') {
      return obj.raw !== undefined ? obj.raw : (obj.value !== undefined ? obj.value : null);
    }
    return obj;
  };

  const statistics = data.defaultKeyStatistics || {};
  const financialData = data.financialData || {};

  let annualIncome = data.incomeStatementHistory?.incomeStatementHistory || [];
  if (annualIncome.length === 0 && data.earnings?.financialsChart?.yearly) {
    annualIncome = data.earnings.financialsChart.yearly.map(item => ({
      endDate: `${item.date}-12-31`,
      totalRevenue: item.revenue,
      netIncome: item.earnings,
      operatingIncome: null,
      costOfRevenue: null,
      ebit: null
    }));
  }

  const annualBalance = data.balanceSheetHistory?.balanceSheetStatements || [];
  const annualCashFlow = data.cashflowStatementHistory?.cashflowStatements || [];
  
  let quarterlyIncome = data.incomeStatementHistoryQuarterly?.incomeStatementHistory || [];
  if (quarterlyIncome.length === 0 && data.earnings?.financialsChart?.quarterly) {
    quarterlyIncome = data.earnings.financialsChart.quarterly.map(item => ({
      endDate: item.date,
      totalRevenue: item.revenue,
      netIncome: item.earnings
    }));
  }

  const quarterlyBalance = data.balanceSheetHistoryQuarterly?.balanceSheetStatements || [];
  const quarterlyCashFlow = data.cashflowStatementHistoryQuarterly?.cashflowStatements || [];

  return {
    annual: {
      incomeStatements: annualIncome.map(item => ({
        calendarDate: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : 'Unknown',
        totalRevenue: getVal(item.totalRevenue) || 0,
        netIncome: getVal(item.netIncome) || 0,
        operatingIncome: getVal(item.operatingIncome) || 0,
        costOfRevenue: getVal(item.costOfRevenue) || 0,
        ebit: getVal(item.ebit) || 0
      })),
      balanceSheets: annualBalance.map(item => ({
        calendarDate: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : 'Unknown',
        totalAssets: getVal(item.totalAssets) || 0,
        totalLiabilitiesNetMinorityInterest: getVal(item.totalLiabilitiesNetMinorityInterest) || 0,
        totalStockholderEquity: getVal(item.totalStockholderEquity) || 0,
        currentAssets: getVal(item.currentAssets) || 0,
        currentLiabilities: getVal(item.currentLiabilities) || 0,
        inventory: getVal(item.inventory) || 0,
        cashAndCashEquivalents: getVal(item.cash) || 0
      })),
      cashFlows: annualCashFlow.map(item => ({
        calendarDate: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : 'Unknown',
        operatingCashFlow: getVal(item.totalCashFromOperatingActivities) || 0,
        capitalExpenditure: getVal(item.capitalExpenditures) || 0,
        freeCashFlow: (getVal(item.totalCashFromOperatingActivities) || 0) + (getVal(item.capitalExpenditures) || 0)
      }))
    },
    quarterly: {
      incomeStatements: quarterlyIncome.map(item => ({
        calendarDate: item.endDate ? (String(item.endDate).includes('Q') ? item.endDate : new Date(item.endDate).toISOString().split('T')[0]) : 'Unknown',
        totalRevenue: getVal(item.totalRevenue) || 0,
        netIncome: getVal(item.netIncome) || 0
      })),
      balanceSheets: quarterlyBalance.map(item => ({
        calendarDate: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : 'Unknown',
        totalAssets: getVal(item.totalAssets) || 0,
        currentAssets: getVal(item.totalCurrentAssets) || 0,
        currentLiabilities: getVal(item.totalCurrentLiabilities) || 0
      })),
      cashFlows: quarterlyCashFlow.map(item => ({
        calendarDate: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : 'Unknown',
        operatingCashFlow: getVal(item.totalCashFromOperatingActivities) || 0
      }))
    },
    ratios: {
      peRatio: getVal(statistics.forwardPE) || getVal(statistics.trailingPE) || null,
      pegRatio: getVal(statistics.pegRatio) || null,
      returnOnAssets: getVal(financialData.returnOnAssets) || null,
      returnOnEquity: getVal(financialData.returnOnEquity) || null,
      debtToEquity: getVal(financialData.debtToEquity) || null,
      currentRatio: getVal(financialData.currentRatio) || null,
      quickRatio: getVal(financialData.quickRatio) || null,
      operatingMargin: getVal(financialData.operatingMargins) || null,
      profitMargin: getVal(financialData.profitMargins) || null
    }
  };
}

/**
 * Fetch financial stats from Yahoo Finance
 */
async function fetchYahooFinancials(symbol) {
  const ticker = symbol.toUpperCase();
  const modules = [
    'incomeStatementHistory',
    'balanceSheetHistory',
    'cashflowStatementHistory',
    'incomeStatementHistoryQuarterly',
    'balanceSheetHistoryQuarterly',
    'cashflowStatementHistoryQuarterly',
    'defaultKeyStatistics',
    'financialData',
    'earnings'
  ];
  
  const response = await yahooFinance.quoteSummary(ticker, { modules });
  return parseYahooFinanceData(response);
}

/**
 * Financial Statements Tool (Yahoo Finance Powered)
 *
 * Purpose:
 * LangChain tool that queries multiple financial statement lists from Yahoo Finance.
 * Integrates RetryManager and falls back to mock stats if query fails.
 */
export const financialTool = tool(
  async ({ symbol }) => {
    const ticker = symbol.toUpperCase();
    logger.info(`[FinancialTool] Fetching financials for ticker: ${ticker}`);

    try {
      const financials = await runWithRetry(
        () => fetchYahooFinancials(ticker),
        `Yahoo Finance Financials for ${ticker}`
      );
      return JSON.stringify(financials);
    } catch (error) {
      logger.error(`[FinancialTool] Yahoo Finance failed. Checking fallback mocks. Error: ${error.message}`);
      if (MOCK_FINANCIALS[ticker]) {
        logger.warn(`[FinancialTool] Serving fallback mock financial statements for ${ticker}`);
        return JSON.stringify(MOCK_FINANCIALS[ticker]);
      }
      throw error;
    }
  },
  {
    name: 'fetch_financial_statements',
    description: 'Retrieves multi-year annual and quarterly financial statements (Income Statement, Balance Sheet, Cash Flow) and statistic ratios.',
    schema: z.object({
      symbol: z.string().describe('The stock ticker symbol of the company, e.g. TSLA, AAPL'),
    }),
  }
);

export default financialTool;
