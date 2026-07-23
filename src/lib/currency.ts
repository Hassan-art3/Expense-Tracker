import { CurrencyCode, ExchangeRates } from '../types';
import { SUPPORTED_CURRENCIES, DEFAULT_EXCHANGE_RATES } from '../data/currencies';

/**
 * Convert an amount from source currency to target currency using USD as pivot
 */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates: Record<CurrencyCode, number> = DEFAULT_EXCHANGE_RATES
): number {
  if (from === to) return amount;
  if (!rates[from] || !rates[to]) return amount;

  // Convert to USD first
  const rateFrom = rates[from]; // Amount of 'from' currency per 1 USD
  const amountInUSD = amount / rateFrom;

  // Convert USD to target currency
  const rateTo = rates[to]; // Amount of 'to' currency per 1 USD
  return amountInUSD * rateTo;
}

/**
 * Format currency with appropriate symbol and fraction digits
 */
export function formatCurrency(
  amount: number,
  currencyCode: CurrencyCode = 'USD',
  showSymbol: boolean = true
): string {
  const currencyInfo = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode);
  const symbol = currencyInfo ? currencyInfo.symbol : '$';

  // No decimals for JPY
  const fractionDigits = currencyCode === 'JPY' ? 0 : 2;

  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);

  return showSymbol ? `${symbol}${formattedNumber}` : formattedNumber;
}

export function getCurrencySymbol(code: CurrencyCode): string {
  const currencyInfo = SUPPORTED_CURRENCIES.find((c) => c.code === code);
  return currencyInfo ? currencyInfo.symbol : '$';
}

/**
 * Fetch live exchange rates from free open API with fallback
 */
export async function fetchLiveExchangeRates(): Promise<ExchangeRates | null> {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!response.ok) throw new Error('Failed to fetch rates');
    const data = await response.json();
    
    if (data && data.rates) {
      const fetchedRates: Partial<Record<CurrencyCode, number>> = {};
      SUPPORTED_CURRENCIES.forEach((curr) => {
        if (data.rates[curr.code]) {
          fetchedRates[curr.code] = data.rates[curr.code];
        } else {
          fetchedRates[curr.code] = DEFAULT_EXCHANGE_RATES[curr.code];
        }
      });

      return {
        base: 'USD',
        rates: fetchedRates as Record<CurrencyCode, number>,
        lastUpdated: new Date().toISOString(),
      };
    }
    return null;
  } catch (error) {
    console.warn('Unable to fetch live exchange rates, using local fallback:', error);
    return null;
  }
}
