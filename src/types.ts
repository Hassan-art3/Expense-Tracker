export type CurrencyCode =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'PKR'
  | 'INR'
  | 'CAD'
  | 'AUD'
  | 'JPY'
  | 'CNY'
  | 'AED'
  | 'SAR';

export interface Currency {
  code: CurrencyCode;
  name: string;
  symbol: string;
  flag: string;
  defaultRateToUSD: number; // exchange rate relative to USD
}

export type CategoryId =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'rent'
  | 'bills'
  | 'entertainment'
  | 'education'
  | 'health'
  | 'travel'
  | 'salary'
  | 'gifts'
  | 'investments'
  | 'other';

export interface Category {
  id: CategoryId | string;
  name: string;
  iconName: string;
  color: string; // Hex or tailwind color
  isCustom?: boolean;
}

export type PaymentMethod =
  | 'Credit Card'
  | 'Debit Card'
  | 'Cash'
  | 'Bank Transfer'
  | 'Apple Pay'
  | 'Google Pay'
  | 'Crypto'
  | 'Other';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: CurrencyCode;
  categoryId: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  paymentMethod: PaymentMethod;
  notes?: string;
  tags: string[];
  receiptUrl?: string; // Base64 or ObjectURL string
  receiptName?: string;
  isRecurring?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  categoryId: string | 'overall'; // 'overall' or specific category id
  amount: number;
  currency: CurrencyCode;
  period: 'monthly' | 'yearly' | 'weekly';
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  currency: CurrencyCode;
  description?: string;
  color: string;
  iconName?: string;
  createdAt: string;
  isCompleted?: boolean;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: CurrencyCode;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string; // YYYY-MM-DD
  categoryId: string;
  paymentMethod: PaymentMethod;
  autoRecordExpense: boolean;
  active: boolean;
  iconName?: string;
}

export interface ExchangeRates {
  base: CurrencyCode;
  rates: Record<CurrencyCode, number>;
  lastUpdated: string; // ISO string
}

export type ViewType =
  | 'dashboard'
  | 'expenses'
  | 'budgets'
  | 'goals'
  | 'analytics'
  | 'calendar'
  | 'subscriptions'
  | 'currencies'
  | 'settings';

export type AccentColor = 'emerald' | 'indigo' | 'violet' | 'cyan' | 'rose' | 'amber';

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  accentColor: AccentColor;
  baseCurrency: CurrencyCode;
  autoFetchExchangeRates: boolean;
  pinLockEnabled: boolean;
  pinCode?: string;
  soundEnabled: boolean;
  autoBackupFrequency: 'daily' | 'weekly' | 'monthly' | 'never';
  compactMode: boolean;
  windowDecoration: 'mac' | 'windows';
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  duration?: number;
}

export interface ExpenseFilter {
  searchQuery: string;
  categories: string[];
  currencies: CurrencyCode[];
  paymentMethods: PaymentMethod[];
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  tags: string[];
  sortBy: 'date' | 'amount' | 'title';
  sortOrder: 'asc' | 'desc';
}

export interface BackupData {
  version: string;
  exportedAt: string;
  expenses: Expense[];
  budgets: Budget[];
  goals: FinancialGoal[];
  subscriptions: Subscription[];
  categories: Category[];
  settings: AppSettings;
  exchangeRates: ExchangeRates;
}
