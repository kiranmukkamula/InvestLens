import {
  calculateGrowth,
  calculateMargin,
  calculateDebtRatio,
  calculateCurrentRatio,
  calculateQuickRatio,
  calculateROE,
  calculateROA,
  calculatePE,
  calculatePEG
} from './financialCalculator.js';
import logger from '../../logger/logger.js';

/**
 * Financials Mapper
 * 
 * Purpose:
 * Normalizes multi-year financial statements and calculates core financial metrics.
 * Ensures data points are formatted as standard numbers, sorts lists chronologically (newest first),
 * and handles missing data without failing.
 *
 * Inputs:
 * - rawFinancials (Object): Raw financials payload from Yahoo Finance
 * - marketCap (number): Current market capitalization for valuation metrics
 *
 * Returns:
 * - Object: Normalized statements and computed metrics namespace matching investmentSchema
 */
export function mapFinancials(rawFinancials, marketCap) {
  logger.info('[FinancialMapper] Normalizing financial statements...');

  // Fallback defaults if payload is null
  const annual = rawFinancials?.annual || { incomeStatements: [], balanceSheets: [], cashFlows: [] };
  const quarterly = rawFinancials?.quarterly || { incomeStatements: [] };

  // Helper: Sort array of statements by date descending (newest first)
  const sortByDate = (arr) => {
    if (!Array.isArray(arr)) return [];
    return [...arr].sort((a, b) => {
      const dateA = new Date(a.calendarDate || 0);
      const dateB = new Date(b.calendarDate || 0);
      return dateB - dateA;
    });
  };

  const incomeStatements = sortByDate(annual.incomeStatements);
  const balanceSheets = sortByDate(annual.balanceSheets);
  const cashFlows = sortByDate(annual.cashFlows);
  const quarterlyIncome = sortByDate(quarterly.incomeStatements);

  // Retrieve current and prior year financials for growth calculations
  const currInc = incomeStatements[0] || {};
  const priorInc = incomeStatements[1] || {};
  const currBal = balanceSheets[0] || {};
  const currCash = cashFlows[0] || {};

  // Parse key indicators
  const currentRev = parseFloat(currInc.totalRevenue) || 0;
  const priorRev = parseFloat(priorInc.totalRevenue) || 0;
  const currentNetInc = parseFloat(currInc.netIncome) || 0;
  const priorNetInc = parseFloat(priorInc.netIncome) || 0;

  // Calculate Growth, Margins, Liquidity, and Returns
  const revenueGrowth = calculateGrowth(currentRev, priorRev);
  const profitGrowth = calculateGrowth(currentNetInc, priorNetInc);
  
  let operatingMargin = calculateMargin(currInc.operatingIncome, currentRev);
  if (!operatingMargin && rawFinancials?.ratios?.operatingMargin !== undefined) {
    operatingMargin = rawFinancials.ratios.operatingMargin || 0;
  }

  let profitMargin = calculateMargin(currentNetInc, currentRev);
  if (!profitMargin && rawFinancials?.ratios?.profitMargin !== undefined) {
    profitMargin = rawFinancials.ratios.profitMargin || 0;
  }

  let debtRatio = calculateDebtRatio(currBal.totalLiabilitiesNetMinorityInterest, currBal.totalAssets);
  if (!debtRatio && rawFinancials?.ratios?.debtToEquity !== undefined) {
    // Convert debt-to-equity percentage basis to a raw decimal ratio (e.g. 22.8% -> 0.228)
    debtRatio = (rawFinancials.ratios.debtToEquity || 0) / 100;
  }

  let currentRatio = calculateCurrentRatio(currBal.currentAssets, currBal.currentLiabilities);
  if (!currentRatio && rawFinancials?.ratios?.currentRatio !== undefined) {
    currentRatio = rawFinancials.ratios.currentRatio || 0;
  }

  let quickRatio = calculateQuickRatio(currBal.currentAssets, currBal.inventory, currBal.currentLiabilities);
  if (!quickRatio && rawFinancials?.ratios?.quickRatio !== undefined) {
    quickRatio = rawFinancials.ratios.quickRatio || 0;
  }

  let roe = calculateROE(currentNetInc, currBal.totalStockholderEquity);
  if (!roe && rawFinancials?.ratios?.returnOnEquity !== undefined) {
    roe = rawFinancials.ratios.returnOnEquity || 0;
  }

  let roa = calculateROA(currentNetInc, currBal.totalAssets);
  if (!roa && rawFinancials?.ratios?.returnOnAssets !== undefined) {
    roa = rawFinancials.ratios.returnOnAssets || 0;
  }

  // PE & PEG Valuation Calculations
  // Try to use ratios parsed directly by Yahoo Finance first, otherwise fall back to calculation
  let pe = rawFinancials?.ratios?.peRatio || null;
  if (!pe && marketCap > 0 && currentNetInc > 0) {
    pe = calculatePE(marketCap, currentNetInc);
  }
  
  let peg = rawFinancials?.ratios?.pegRatio || null;
  if (!peg && pe > 0) {
    // PEG uses EPS growth or net income growth as denominator
    peg = calculatePEG(pe, revenueGrowth);
  }

  // Format historical statement elements to guarantee they match Zod numeric rules
  const mapIncome = (stmt) => ({
    calendarDate: stmt.calendarDate || 'Unknown',
    totalRevenue: parseFloat(stmt.totalRevenue) || 0,
    netIncome: parseFloat(stmt.netIncome) || 0,
    operatingIncome: parseFloat(stmt.operatingIncome) || 0,
    costOfRevenue: parseFloat(stmt.costOfRevenue) || 0,
    ebit: parseFloat(stmt.ebit) || 0
  });

  const mapBalance = (stmt) => ({
    calendarDate: stmt.calendarDate || 'Unknown',
    totalAssets: parseFloat(stmt.totalAssets) || 0,
    totalLiabilitiesNetMinorityInterest: parseFloat(stmt.totalLiabilitiesNetMinorityInterest) || 0,
    totalStockholderEquity: parseFloat(stmt.totalStockholderEquity) || 0,
    currentAssets: parseFloat(stmt.currentAssets) || 0,
    currentLiabilities: parseFloat(stmt.currentLiabilities) || 0,
    inventory: parseFloat(stmt.inventory) || 0,
    cashAndCashEquivalents: parseFloat(stmt.cashAndCashEquivalents) || 0
  });

  const mapCash = (stmt) => ({
    calendarDate: stmt.calendarDate || 'Unknown',
    operatingCashFlow: parseFloat(stmt.operatingCashFlow) || 0,
    capitalExpenditure: parseFloat(stmt.capitalExpenditure) || 0,
    freeCashFlow: parseFloat(stmt.freeCashFlow) || 0
  });

  return {
    metrics: {
      revenue: currentRev,
      priorRevenue: priorRev,
      revenueGrowth,
      netIncome: currentNetInc,
      priorNetIncome: priorNetInc,
      profitGrowth,
      operatingMargin,
      profitMargin,
      debtRatio,
      currentRatio,
      quickRatio,
      roe,
      roa,
      pe: pe ? parseFloat(pe) : null,
      peg: peg ? parseFloat(peg) : null
    },
    annual: {
      incomeStatements: incomeStatements.map(mapIncome),
      balanceSheets: balanceSheets.map(mapBalance),
      cashFlows: cashFlows.map(mapCash)
    },
    quarterly: {
      incomeStatements: quarterlyIncome.map(stmt => ({
        calendarDate: stmt.calendarDate || 'Unknown',
        totalRevenue: parseFloat(stmt.totalRevenue) || 0,
        netIncome: parseFloat(stmt.netIncome) || 0
      }))
    }
  };
}

export default mapFinancials;
