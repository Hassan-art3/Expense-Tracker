import { Expense, Budget, FinancialGoal, Subscription, AppSettings, ExchangeRates } from '../types';
import { DEFAULT_EXCHANGE_RATES } from './currencies';
import { DEFAULT_CATEGORIES } from './categories';

export const INITIAL_SETTINGS: AppSettings = {
  theme: 'dark',
  accentColor: 'emerald',
  baseCurrency: 'USD',
  autoFetchExchangeRates: true,
  pinLockEnabled: false,
  soundEnabled: true,
  autoBackupFrequency: 'weekly',
  compactMode: false,
  windowDecoration: 'mac',
};

export const INITIAL_EXCHANGE_RATES: ExchangeRates = {
  base: 'USD',
  rates: DEFAULT_EXCHANGE_RATES,
  lastUpdated: new Date().toISOString(),
};

export function generateSampleData() {
  return {
    expenses: [],
    budgets: [],
    goals: [],
    subscriptions: [],
    categories: DEFAULT_CATEGORIES,
    settings: INITIAL_SETTINGS,
    exchangeRates: INITIAL_EXCHANGE_RATES,
  };
}
