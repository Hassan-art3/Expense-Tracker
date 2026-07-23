import {
  Expense,
  Budget,
  FinancialGoal,
  Subscription,
  Category,
  AppSettings,
  ExchangeRates,
  BackupData,
} from '../types';
import { generateSampleData } from '../data/sampleData';
import Papa from 'papaparse';

const STORAGE_KEYS = {
  EXPENSES: 'aura_expenses_v1',
  BUDGETS: 'aura_budgets_v1',
  GOALS: 'aura_goals_v1',
  SUBSCRIPTIONS: 'aura_subscriptions_v1',
  CATEGORIES: 'aura_categories_v1',
  SETTINGS: 'aura_settings_v1',
  EXCHANGE_RATES: 'aura_exchange_rates_v1',
  BACKUPS: 'aura_backups_v1',
};

export function loadInitialAppData() {
  try {
    const rawExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    const rawBudgets = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    const rawGoals = localStorage.getItem(STORAGE_KEYS.GOALS);
    const rawSubscriptions = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    const rawCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    const rawSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const rawRates = localStorage.getItem(STORAGE_KEYS.EXCHANGE_RATES);

    // If first time opening app, initialize with sample data
    if (!rawExpenses && !rawSettings) {
      const sample = generateSampleData();
      saveAppData(sample);
      return sample;
    }

    const sampleFallback = generateSampleData();

    const loadedExpenses: Expense[] = rawExpenses ? JSON.parse(rawExpenses) : [];
    const loadedBudgets: Budget[] = rawBudgets ? JSON.parse(rawBudgets) : [];
    const loadedGoals: FinancialGoal[] = rawGoals ? JSON.parse(rawGoals) : [];
    const loadedSubs: Subscription[] = rawSubscriptions ? JSON.parse(rawSubscriptions) : [];

    // Filter out old pre-populated sample items
    const cleanExpenses = loadedExpenses.filter((e) => !e.id.startsWith('exp-'));
    const cleanBudgets = loadedBudgets.filter((b) => !b.id.startsWith('b-'));
    const cleanGoals = loadedGoals.filter((g) => !g.id.startsWith('g-'));
    const cleanSubs = loadedSubs.filter((s) => !s.id.startsWith('sub-'));

    return {
      expenses: cleanExpenses,
      budgets: cleanBudgets,
      goals: cleanGoals,
      subscriptions: cleanSubs,
      categories: rawCategories ? JSON.parse(rawCategories) : sampleFallback.categories,
      settings: rawSettings ? JSON.parse(rawSettings) : sampleFallback.settings,
      exchangeRates: rawRates ? JSON.parse(rawRates) : sampleFallback.exchangeRates,
    };
  } catch (error) {
    console.error('Error loading app data from localStorage, resetting to sample:', error);
    const sample = generateSampleData();
    saveAppData(sample);
    return sample;
  }
}

export function saveAppData(data: {
  expenses?: Expense[];
  budgets?: Budget[];
  goals?: FinancialGoal[];
  subscriptions?: Subscription[];
  categories?: Category[];
  settings?: AppSettings;
  exchangeRates?: ExchangeRates;
}) {
  try {
    if (data.expenses) localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(data.expenses));
    if (data.budgets) localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(data.budgets));
    if (data.goals) localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(data.goals));
    if (data.subscriptions) localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(data.subscriptions));
    if (data.categories) localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data.categories));
    if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
    if (data.exchangeRates) localStorage.setItem(STORAGE_KEYS.EXCHANGE_RATES, JSON.stringify(data.exchangeRates));
  } catch (error) {
    console.error('Failed to save app data to localStorage:', error);
  }
}

export function createLocalBackup(fullData: BackupData): void {
  try {
    const rawBackups = localStorage.getItem(STORAGE_KEYS.BACKUPS);
    const backups: BackupData[] = rawBackups ? JSON.parse(rawBackups) : [];
    // Keep max 5 recent auto backups
    const updatedBackups = [fullData, ...backups].slice(0, 5);
    localStorage.setItem(STORAGE_KEYS.BACKUPS, JSON.stringify(updatedBackups));
  } catch (err) {
    console.error('Error saving local backup snapshot:', err);
  }
}

export function exportToCSV(expenses: Expense[]): string {
  const exportRows = expenses.map((e) => ({
    ID: e.id,
    Title: e.title,
    Amount: e.amount,
    Currency: e.currency,
    Category: e.categoryId,
    Date: e.date,
    Time: e.time || '',
    PaymentMethod: e.paymentMethod,
    Tags: e.tags.join('; '),
    Notes: e.notes || '',
  }));

  return Papa.unparse(exportRows);
}

export function parseCSVToExpenses(csvText: string): Partial<Expense>[] {
  const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  if (result.errors && result.errors.length > 0) {
    console.warn('CSV parse warnings:', result.errors);
  }

  return (result.data as any[]).map((row) => ({
    title: row.Title || row.title || 'Imported Expense',
    amount: parseFloat(row.Amount || row.amount || '0') || 0,
    currency: (row.Currency || row.currency || 'USD').toUpperCase() as any,
    categoryId: (row.Category || row.category || 'other').toLowerCase(),
    date: row.Date || row.date || new Date().toISOString().split('T')[0],
    time: row.Time || row.time || '12:00',
    paymentMethod: row.PaymentMethod || row.paymentMethod || 'Credit Card',
    tags: row.Tags ? row.Tags.split(';').map((t: string) => t.trim()) : [],
    notes: row.Notes || row.notes || '',
  }));
}
