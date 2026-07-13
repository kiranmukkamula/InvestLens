/**
 * Data Formatters
 * 
 * Purpose:
 * Normalizes numerical figures, currencies, and ratios into human-readable strings.
 */

/**
 * Abbreviates large numerical currencies (Millions, Billions, Trillions)
 * E.g., 3450000000000 -> "$3.45T"
 *
 * Inputs:
 * - value (number|string): Numeric value
 *
 * Returns:
 * - string: Formatted currency representation
 */
export function formatCurrency(value) {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  const num = parseFloat(value);
  const absolute = Math.abs(num);

  if (absolute >= 1.0e12) {
    return `$${(num / 1.0e12).toFixed(2)}T`;
  }
  if (absolute >= 1.0e9) {
    return `$${(num / 1.0e9).toFixed(2)}B`;
  }
  if (absolute >= 1.0e6) {
    return `$${(num / 1.0e6).toFixed(2)}M`;
  }
  return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Formats standard decimal ratios as percentages
 * E.g., 0.1456 -> "14.56%"
 *
 * Inputs:
 * - value (number|string): Decimal ratio
 *
 * Returns:
 * - string: Formatted percentage string
 */
export function formatPercent(value) {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  const val = parseFloat(value) * 100;
  return `${val.toFixed(2)}%`;
}

/**
 * Formats plain integers with commas
 * E.g., 140473 -> "140,473"
 */
export function formatInteger(value) {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return parseInt(value, 10).toLocaleString();
}

export default {
  formatCurrency,
  formatPercent,
  formatInteger
};
