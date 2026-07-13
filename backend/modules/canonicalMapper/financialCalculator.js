import Decimal from 'decimal.js';
import logger from '../../logger/logger.js';

/**
 * Financial Calculator
 * 
 * Purpose:
 * Computes essential accounting and valuation ratios cleanly.
 * Employs Decimal.js to prevent JavaScript floating point precision issues.
 * Gracefully handles missing values and division by zero.
 */

/**
 * Safely parse a value into a Decimal instance.
 * Returns null if invalid or undefined.
 */
function toDecimal(val) {
  if (val === null || val === undefined || val === '') return null;
  try {
    const dec = new Decimal(val);
    if (dec.isNaN()) return null;
    return dec;
  } catch {
    return null;
  }
}

/**
 * Calculates percentage growth between current and prior values.
 * Formula: ((current - previous) / previous)
 */
export function calculateGrowth(currentVal, priorVal) {
  const current = toDecimal(currentVal);
  const prior = toDecimal(priorVal);
  if (!current || !prior || prior.isZero()) return 0;
  try {
    return current.minus(prior).div(prior).toNumber();
  } catch (err) {
    logger.debug(`Growth calculation failure: ${err.message}`);
    return 0;
  }
}

/**
 * Calculates margin.
 * Formula: (part / revenue)
 */
export function calculateMargin(partVal, revenueVal) {
  const part = toDecimal(partVal);
  const revenue = toDecimal(revenueVal);
  if (!part || !revenue || revenue.isZero()) return 0;
  try {
    return part.div(revenue).toNumber();
  } catch (err) {
    return 0;
  }
}

/**
 * Calculates Debt-to-Assets ratio.
 * Formula: (liabilities / assets)
 */
export function calculateDebtRatio(liabilitiesVal, assetsVal) {
  const liabilities = toDecimal(liabilitiesVal);
  const assets = toDecimal(assetsVal);
  if (!liabilities || !assets || assets.isZero()) return 0;
  try {
    return liabilities.div(assets).toNumber();
  } catch (err) {
    return 0;
  }
}

/**
 * Calculates Current liquidity ratio.
 * Formula: (currentAssets / currentLiabilities)
 */
export function calculateCurrentRatio(assetsVal, liabilitiesVal) {
  const assets = toDecimal(assetsVal);
  const liabilities = toDecimal(liabilitiesVal);
  if (!assets || !liabilities || liabilities.isZero()) return 0;
  try {
    return assets.div(liabilities).toNumber();
  } catch (err) {
    return 0;
  }
}

/**
 * Calculates Quick liquidity ratio.
 * Formula: ((currentAssets - inventory) / currentLiabilities)
 */
export function calculateQuickRatio(assetsVal, inventoryVal, liabilitiesVal) {
  const assets = toDecimal(assetsVal);
  const inventory = toDecimal(inventoryVal) || new Decimal(0);
  const liabilities = toDecimal(liabilitiesVal);
  if (!assets || !liabilities || liabilities.isZero()) return 0;
  try {
    return assets.minus(inventory).div(liabilities).toNumber();
  } catch (err) {
    return 0;
  }
}

/**
 * Calculates Return on Equity (ROE).
 * Formula: (netIncome / stockholderEquity)
 */
export function calculateROE(incomeVal, equityVal) {
  const income = toDecimal(incomeVal);
  const equity = toDecimal(equityVal);
  if (!income || !equity || equity.isZero()) return 0;
  try {
    return income.div(equity).toNumber();
  } catch (err) {
    return 0;
  }
}

/**
 * Calculates Return on Assets (ROA).
 * Formula: (netIncome / totalAssets)
 */
export function calculateROA(incomeVal, assetsVal) {
  const income = toDecimal(incomeVal);
  const assets = toDecimal(assetsVal);
  if (!income || !assets || assets.isZero()) return 0;
  try {
    return income.div(assets).toNumber();
  } catch (err) {
    return 0;
  }
}

/**
 * Calculates price to earnings ratio if market cap and net income exist.
 * Formula: (marketCap / netIncome)
 */
export function calculatePE(marketCapVal, netIncomeVal) {
  const marketCap = toDecimal(marketCapVal);
  const netIncome = toDecimal(netIncomeVal);
  if (!marketCap || !netIncome || netIncome.lessThanOrEqualTo(0)) return 0;
  try {
    return marketCap.div(netIncome).toNumber();
  } catch (err) {
    return 0;
  }
}

/**
 * Calculates price earnings to growth ratio.
 * Formula: (peRatio / (earningsGrowthPercent * 100))
 */
export function calculatePEG(peVal, growthVal) {
  const pe = toDecimal(peVal);
  // Growth is passed as decimal e.g. 0.15 for 15%. We multiply by 100 for percentage basis
  const growth = toDecimal(growthVal ? growthVal * 100 : 0);
  if (!pe || !growth || growth.lessThanOrEqualTo(0)) return 0;
  try {
    return pe.div(growth).toNumber();
  } catch (err) {
    return 0;
  }
}
