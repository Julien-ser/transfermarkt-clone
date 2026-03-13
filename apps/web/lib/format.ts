/**
 * Format a market value amount to a human-readable string.
 * Examples: 1000000 -> "€1.0m", 50000000 -> "€50.0m", 120000000 -> "€120.0m"
 *
 * @param value - Market value in smallest currency unit (e.g., cents or smallest unit)
 * @param currency - Currency code (default: EUR)
 * @returns Formatted string with currency symbol and unit (k = thousand, m = million)
 */
export function formatMarketValue(value: number, currency: string = 'EUR'): string {
  if (value === 0 || value == null) return 'N/A';

  const currencySymbols: Record<string, string> = {
    EUR: '€',
    GBP: '£',
    USD: '$',
  };

  const symbol = currencySymbols[currency] || currency;

  if (value >= 1000000) {
    return `${symbol}${(value / 1000000).toFixed(1)}m`;
  } else if (value >= 1000) {
    return `${symbol}${(value / 1000).toFixed(1)}k`;
  }

  return `${symbol}${value}`;
}

/**
 * Format a transfer fee to a human-readable string.
 * Handles free transfers and loan deals.
 *
 * @param fee - Transfer fee (null for free/loan)
 * @returns Formatted fee string or label for free/loan
 */
export function formatTransferFee(fee: number | null): string {
  if (fee === null || fee === 0) {
    return 'Free/Loan';
  }
  return formatMarketValue(fee);
}

/**
 * Format a date string to a localized date format.
 *
 * @param dateString - ISO date string
 * @returns Formatted date like "Jan 15, 2024"
 */
export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a player's full name from firstName and lastName.
 *
 * @param firstName - Player's first name
 * @param lastName - Player's last name
 * @returns Full name
 */
export function formatPlayerName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

/**
 * Get market value change indicator (arrow and color).
 *
 * @param change - Percentage change (positive or negative)
 * @returns Object with arrow symbol and color class
 */
export function getMarketValueChangeIndicator(change: number | null) {
  if (change === null || change === undefined) {
    return { arrow: '', color: 'text-gray-500' };
  }

  if (change > 0) {
    return {
      arrow: '↑',
      color: 'text-green-600 dark:text-green-400',
    };
  } else if (change < 0) {
    return {
      arrow: '↓',
      color: 'text-red-600 dark:text-red-400',
    };
  }

  return {
    arrow: '→',
    color: 'text-gray-500',
  };
}
