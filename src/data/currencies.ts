import { Currency, CurrencyCode } from '../types';

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', defaultRateToUSD: 1 },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', defaultRateToUSD: 0.92 },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', defaultRateToUSD: 0.78 },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰', defaultRateToUSD: 278.5 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', defaultRateToUSD: 83.4 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', flag: '🇨🇦', defaultRateToUSD: 1.37 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', defaultRateToUSD: 1.52 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', defaultRateToUSD: 155.2 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: 'CN¥', flag: '🇨🇳', defaultRateToUSD: 7.23 },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED', flag: '🇦🇪', defaultRateToUSD: 3.67 },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR', flag: '🇸🇦', defaultRateToUSD: 3.75 },
];

export const DEFAULT_EXCHANGE_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.78,
  PKR: 278.5,
  INR: 83.4,
  CAD: 1.37,
  AUD: 1.52,
  JPY: 155.2,
  CNY: 7.23,
  AED: 3.67,
  SAR: 3.75,
};
