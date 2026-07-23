import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Expense,
  Budget,
  FinancialGoal,
  Subscription,
  Category,
  AppSettings,
  ExchangeRates,
  ViewType,
  ToastNotification,
  ExpenseFilter,
  BackupData,
  CurrencyCode,
} from '../types';
import { loadInitialAppData, saveAppData, createLocalBackup, exportToCSV, parseCSVToExpenses } from '../lib/storage';
import { fetchLiveExchangeRates, convertCurrency } from '../lib/currency';
import { generateSampleData } from '../data/sampleData';
import { generateId, downloadFile } from '../lib/utils';
import confetti from 'canvas-confetti';

interface AppContextType {
  expenses: Expense[];
  budgets: Budget[];
  goals: FinancialGoal[];
  subscriptions: Subscription[];
  categories: Category[];
  settings: AppSettings;
  exchangeRates: ExchangeRates;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  isPinLocked: boolean;
  unlockApp: (pin: string) => boolean;
  lockApp: () => void;
  toasts: ToastNotification[];
  addToast: (toast: Omit<ToastNotification, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  filters: ExpenseFilter;
  setFilters: React.Dispatch<React.SetStateAction<ExpenseFilter>>;
  resetFilters: () => void;

  // Expense Actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  duplicateExpense: (id: string) => void;
  bulkDeleteExpenses: (ids: string[]) => void;
  isExpenseModalOpen: boolean;
  editingExpense: Expense | null;
  openExpenseModal: (expenseToEdit?: Expense | null) => void;
  closeExpenseModal: () => void;

  // Budget Actions
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;

  // Goal Actions
  addGoal: (goal: Omit<FinancialGoal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<FinancialGoal>) => void;
  depositToGoal: (id: string, amount: number) => void;
  deleteGoal: (id: string) => void;

  // Subscription Actions
  addSubscription: (sub: Omit<Subscription, 'id'>) => void;
  updateSubscription: (id: string, updates: Partial<Subscription>) => void;
  toggleSubscriptionActive: (id: string) => void;
  deleteSubscription: (id: string) => void;

  // Category Actions
  addCategory: (category: Omit<Category, 'id' | 'isCustom'>) => void;

  // Settings & Exchange Rates
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  updateExchangeRates: (rates: Record<CurrencyCode, number>) => void;
  refreshExchangeRates: () => Promise<void>;

  // Data & Backup
  exportDataJSON: () => void;
  exportDataCSV: () => void;
  importDataJSON: (jsonText: string) => boolean;
  importDataCSV: (csvText: string) => boolean;
  resetToDemoData: () => void;
  clearAllData: () => void;

  // Confetti
  triggerConfetti: () => void;
}

const DEFAULT_FILTER: ExpenseFilter = {
  searchQuery: '',
  categories: [],
  currencies: [],
  paymentMethods: [],
  tags: [],
  sortBy: 'date',
  sortOrder: 'desc',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initialData] = useState(() => loadInitialAppData());

  const [expenses, setExpenses] = useState<Expense[]>(initialData.expenses);
  const [budgets, setBudgets] = useState<Budget[]>(initialData.budgets);
  const [goals, setGoals] = useState<FinancialGoal[]>(initialData.goals);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialData.subscriptions);
  const [categories, setCategories] = useState<Category[]>(initialData.categories);
  const [settings, setSettings] = useState<AppSettings>(initialData.settings);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>(initialData.exchangeRates);

  const [activeView, setActiveViewRaw] = useState<ViewType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const setActiveView = useCallback((view: ViewType) => {
    setActiveViewRaw(view);
    setIsMobileMenuOpen(false);
  }, []);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [isPinLocked, setIsPinLocked] = useState<boolean>(initialData.settings.pinLockEnabled);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [filters, setFilters] = useState<ExpenseFilter>(DEFAULT_FILTER);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Sync with LocalStorage whenever key states change
  useEffect(() => {
    saveAppData({ expenses, budgets, goals, subscriptions, categories, settings, exchangeRates });
  }, [expenses, budgets, goals, subscriptions, categories, settings, exchangeRates]);

  // Apply dark/light theme on body
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');

    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.add('light');
    } else {
      // System mode
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(isDark ? 'dark' : 'light');
    }
  }, [settings.theme]);

  // Auto fetch live exchange rates from the web on load and currency change
  useEffect(() => {
    if (settings.autoFetchExchangeRates !== false) {
      fetchLiveExchangeRates().then((liveRates) => {
        if (liveRates) {
          setExchangeRates(liveRates);
        }
      });
    }
  }, [settings.baseCurrency, settings.autoFetchExchangeRates]);

  // Toast manager
  const addToast = useCallback((toast: Omit<ToastNotification, 'id'>) => {
    const id = generateId();
    setToasts((prev) => [...prev, { ...toast, id }]);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTER);
  }, []);

  // PIN Unlock
  const unlockApp = useCallback(
    (pin: string) => {
      if (settings.pinCode === pin || !settings.pinCode) {
        setIsPinLocked(false);
        addToast({ type: 'success', title: 'Unlocked', message: 'Welcome back to Aura Finance.' });
        return true;
      }
      addToast({ type: 'error', title: 'Invalid PIN', message: 'The entered PIN code is incorrect.' });
      return false;
    },
    [settings.pinCode, addToast]
  );

  const lockApp = useCallback(() => {
    if (settings.pinLockEnabled) {
      setIsPinLocked(true);
    }
  }, [settings.pinLockEnabled]);

  // Modal handlers
  const openExpenseModal = useCallback((expenseToEdit?: Expense | null) => {
    setEditingExpense(expenseToEdit || null);
    setIsExpenseModalOpen(true);
  }, []);

  const closeExpenseModal = useCallback(() => {
    setIsExpenseModalOpen(false);
    setEditingExpense(null);
  }, []);

  // Expense CRUD
  const addExpense = useCallback(
    (newExpense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const created: Expense = {
        ...newExpense,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      setExpenses((prev) => [created, ...prev]);
      addToast({
        type: 'success',
        title: 'Expense Recorded',
        message: `Added "${created.title}" of ${created.amount} ${created.currency}.`,
      });

      // Check if overall budget exceeded
      const overallBudget = budgets.find((b) => b.categoryId === 'overall');
      if (overallBudget) {
        const totalConverted = [created, ...expenses].reduce((acc, item) => {
          return acc + convertCurrency(item.amount, item.currency, overallBudget.currency, exchangeRates.rates);
        }, 0);

        if (totalConverted > overallBudget.amount) {
          addToast({
            type: 'warning',
            title: 'Budget Alert!',
            message: `You have exceeded your monthly budget target of ${overallBudget.amount} ${overallBudget.currency}!`,
          });
        }
      }
    },
    [expenses, budgets, exchangeRates, addToast]
  );

  const updateExpense = useCallback(
    (id: string, updates: Partial<Expense>) => {
      setExpenses((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e))
      );
      addToast({ type: 'info', title: 'Expense Updated', message: 'Your changes were saved.' });
    },
    [addToast]
  );

  const deleteExpense = useCallback(
    (id: string) => {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      addToast({ type: 'info', title: 'Expense Removed', message: 'Item deleted permanently.' });
    },
    [addToast]
  );

  const duplicateExpense = useCallback(
    (id: string) => {
      const existing = expenses.find((e) => e.id === id);
      if (existing) {
        const dup: Expense = {
          ...existing,
          id: generateId(),
          title: `${existing.title} (Copy)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setExpenses((prev) => [dup, ...prev]);
        addToast({ type: 'success', title: 'Expense Duplicated', message: `Copied "${existing.title}".` });
      }
    },
    [expenses, addToast]
  );

  const bulkDeleteExpenses = useCallback(
    (ids: string[]) => {
      setExpenses((prev) => prev.filter((e) => !ids.includes(e.id)));
      addToast({
        type: 'info',
        title: 'Batch Deleted',
        message: `Successfully removed ${ids.length} expense records.`,
      });
    },
    [addToast]
  );

  // Budget CRUD
  const addBudget = useCallback(
    (b: Omit<Budget, 'id'>) => {
      const newBudget: Budget = { ...b, id: generateId() };
      setBudgets((prev) => [...prev, newBudget]);
      addToast({ type: 'success', title: 'Budget Configured', message: 'New spending limit activated.' });
    },
    [addToast]
  );

  const updateBudget = useCallback(
    (id: string, updates: Partial<Budget>) => {
      setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
      addToast({ type: 'info', title: 'Budget Updated', message: 'Budget limit adjusted.' });
    },
    [addToast]
  );

  const deleteBudget = useCallback(
    (id: string) => {
      setBudgets((prev) => prev.filter((b) => b.id !== id));
      addToast({ type: 'info', title: 'Budget Removed', message: 'Budget plan deleted.' });
    },
    [addToast]
  );

  // Financial Goal CRUD
  const addGoal = useCallback(
    (g: Omit<FinancialGoal, 'id' | 'createdAt'>) => {
      const newGoal: FinancialGoal = {
        ...g,
        id: generateId(),
        createdAt: new Date().toISOString(),
        isCompleted: g.currentAmount >= g.targetAmount,
      };
      setGoals((prev) => [...prev, newGoal]);
      addToast({ type: 'success', title: 'Savings Goal Created', message: `Goal "${g.name}" registered.` });
    },
    [addToast]
  );

  const updateGoal = useCallback(
    (id: string, updates: Partial<FinancialGoal>) => {
      setGoals((prev) =>
        prev.map((g) => {
          if (g.id === id) {
            const updated = { ...g, ...updates };
            if (updated.currentAmount >= updated.targetAmount && !g.isCompleted) {
              updated.isCompleted = true;
              triggerConfetti();
              addToast({
                type: 'success',
                title: '🎉 Goal Achieved!',
                message: `Congratulations! You reached your goal "${updated.name}"!`,
              });
            }
            return updated;
          }
          return g;
        })
      );
    },
    [addToast, triggerConfetti]
  );

  const depositToGoal = useCallback(
    (id: string, amount: number) => {
      setGoals((prev) =>
        prev.map((g) => {
          if (g.id === id) {
            const newAmount = g.currentAmount + amount;
            const isCompletedNow = newAmount >= g.targetAmount;
            if (isCompletedNow && !g.isCompleted) {
              triggerConfetti();
              addToast({
                type: 'success',
                title: '🎉 Goal Complete!',
                message: `You completed target for "${g.name}"!`,
              });
            } else {
              addToast({
                type: 'success',
                title: 'Deposit Added',
                message: `Added ${amount} ${g.currency} to "${g.name}".`,
              });
            }
            return {
              ...g,
              currentAmount: newAmount,
              isCompleted: isCompletedNow || g.isCompleted,
            };
          }
          return g;
        })
      );
    },
    [addToast, triggerConfetti]
  );

  const deleteGoal = useCallback(
    (id: string) => {
      setGoals((prev) => prev.filter((g) => g.id !== id));
      addToast({ type: 'info', title: 'Goal Deleted', message: 'Financial goal removed.' });
    },
    [addToast]
  );

  // Subscriptions
  const addSubscription = useCallback(
    (s: Omit<Subscription, 'id'>) => {
      const newSub: Subscription = { ...s, id: generateId() };
      setSubscriptions((prev) => [...prev, newSub]);
      addToast({ type: 'success', title: 'Subscription Added', message: `Tracking "${s.name}".` });
    },
    [addToast]
  );

  const updateSubscription = useCallback(
    (id: string, updates: Partial<Subscription>) => {
      setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
      addToast({ type: 'info', title: 'Subscription Updated', message: 'Changes saved.' });
    },
    [addToast]
  );

  const toggleSubscriptionActive = useCallback((id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  }, []);

  const deleteSubscription = useCallback(
    (id: string) => {
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
      addToast({ type: 'info', title: 'Subscription Deleted', message: 'Subscription stopped.' });
    },
    [addToast]
  );

  // Categories
  const addCategory = useCallback(
    (cat: Omit<Category, 'id' | 'isCustom'>) => {
      const newCat: Category = {
        ...cat,
        id: cat.name.toLowerCase().replace(/\s+/g, '-'),
        isCustom: true,
      };
      setCategories((prev) => [...prev, newCat]);
      addToast({ type: 'success', title: 'Category Created', message: `Category "${cat.name}" added.` });
    },
    [addToast]
  );

  // Settings & Exchange Rates
  const updateSettings = useCallback(
    (newSet: Partial<AppSettings>) => {
      setSettings((prev) => ({ ...prev, ...newSet }));
      addToast({ type: 'success', title: 'Preferences Saved', message: 'Application settings updated.' });
    },
    [addToast]
  );

  const updateExchangeRates = useCallback(
    (rates: Record<CurrencyCode, number>) => {
      setExchangeRates({
        base: 'USD',
        rates,
        lastUpdated: new Date().toISOString(),
      });
      addToast({ type: 'success', title: 'Exchange Rates Saved', message: 'Rates updated successfully.' });
    },
    [addToast]
  );

  const refreshExchangeRates = useCallback(async () => {
    const liveRates = await fetchLiveExchangeRates();
    if (liveRates) {
      setExchangeRates(liveRates);
      addToast({
        type: 'success',
        title: 'Exchange Rates Updated',
        message: 'Live market conversion rates fetched successfully.',
      });
    } else {
      addToast({
        type: 'warning',
        title: 'Offline Mode',
        message: 'Could not reach live exchange API. Keeping cached local rates.',
      });
    }
  }, [addToast]);

  // Data Export / Import
  const exportDataJSON = useCallback(() => {
    const backup: BackupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      expenses,
      budgets,
      goals,
      subscriptions,
      categories,
      settings,
      exchangeRates,
    };
    const jsonString = JSON.stringify(backup, null, 2);
    downloadFile(jsonString, `aura-finance-backup-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
    addToast({ type: 'success', title: 'Backup Downloaded', message: 'JSON backup file exported successfully.' });
  }, [expenses, budgets, goals, subscriptions, categories, settings, exchangeRates, addToast]);

  const exportDataCSV = useCallback(() => {
    const csvContent = exportToCSV(expenses);
    downloadFile(csvContent, `aura-expenses-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
    addToast({ type: 'success', title: 'CSV Exported', message: 'Expense records saved to CSV.' });
  }, [expenses, addToast]);

  const importDataJSON = useCallback(
    (jsonText: string): boolean => {
      try {
        const parsed: BackupData = JSON.parse(jsonText);
        if (!parsed.expenses || !Array.isArray(parsed.expenses)) {
          throw new Error('Invalid backup file structure.');
        }

        // Take snapshot before replacing
        createLocalBackup({
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          expenses,
          budgets,
          goals,
          subscriptions,
          categories,
          settings,
          exchangeRates,
        });

        if (parsed.expenses) setExpenses(parsed.expenses);
        if (parsed.budgets) setBudgets(parsed.budgets);
        if (parsed.goals) setGoals(parsed.goals);
        if (parsed.subscriptions) setSubscriptions(parsed.subscriptions);
        if (parsed.categories) setCategories(parsed.categories);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.exchangeRates) setExchangeRates(parsed.exchangeRates);

        addToast({ type: 'success', title: 'Data Restored', message: 'Backup imported successfully.' });
        return true;
      } catch (err: any) {
        addToast({
          type: 'error',
          title: 'Import Failed',
          message: err.message || 'The provided JSON file is invalid or corrupted.',
        });
        return false;
      }
    },
    [expenses, budgets, goals, subscriptions, categories, settings, exchangeRates, addToast]
  );

  const importDataCSV = useCallback(
    (csvText: string): boolean => {
      try {
        const parsedExpenses = parseCSVToExpenses(csvText);
        if (parsedExpenses.length === 0) {
          throw new Error('No valid expense rows found in CSV.');
        }

        const newRecords: Expense[] = parsedExpenses.map((p) => ({
          id: generateId(),
          title: p.title || 'Imported Expense',
          amount: p.amount || 0,
          currency: p.currency || settings.baseCurrency,
          categoryId: p.categoryId || 'other',
          date: p.date || new Date().toISOString().split('T')[0],
          time: p.time || '12:00',
          paymentMethod: p.paymentMethod || 'Credit Card',
          notes: p.notes || 'Imported via CSV',
          tags: p.tags || ['imported'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        setExpenses((prev) => [...newRecords, ...prev]);
        addToast({
          type: 'success',
          title: 'CSV Import Complete',
          message: `Successfully imported ${newRecords.length} expenses.`,
        });
        return true;
      } catch (err: any) {
        addToast({
          type: 'error',
          title: 'CSV Parse Error',
          message: err.message || 'Failed to read CSV rows.',
        });
        return false;
      }
    },
    [settings.baseCurrency, addToast]
  );

  const resetToDemoData = useCallback(() => {
    const sample = generateSampleData();
    setExpenses(sample.expenses);
    setBudgets(sample.budgets);
    setGoals(sample.goals);
    setSubscriptions(sample.subscriptions);
    setCategories(sample.categories);
    setSettings(sample.settings);
    setExchangeRates(sample.exchangeRates);
    addToast({ type: 'info', title: 'Reset Complete', message: 'Demo data restored.' });
  }, [addToast]);

  const clearAllData = useCallback(() => {
    setExpenses([]);
    setBudgets([]);
    setGoals([]);
    setSubscriptions([]);
    addToast({ type: 'warning', title: 'Data Cleared', message: 'All financial records removed.' });
  }, [addToast]);

  return (
    <AppContext.Provider
      value={{
        expenses,
        budgets,
        goals,
        subscriptions,
        categories,
        settings,
        exchangeRates,
        activeView,
        setActiveView,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        isCommandPaletteOpen,
        setCommandPaletteOpen,
        isPinLocked,
        unlockApp,
        lockApp,
        toasts,
        addToast,
        removeToast,
        clearAllToasts,
        filters,
        setFilters,
        resetFilters,
        addExpense,
        updateExpense,
        deleteExpense,
        duplicateExpense,
        bulkDeleteExpenses,
        isExpenseModalOpen,
        editingExpense,
        openExpenseModal,
        closeExpenseModal,
        addBudget,
        updateBudget,
        deleteBudget,
        addGoal,
        updateGoal,
        depositToGoal,
        deleteGoal,
        addSubscription,
        updateSubscription,
        toggleSubscriptionActive,
        deleteSubscription,
        addCategory,
        updateSettings,
        updateExchangeRates,
        refreshExchangeRates,
        exportDataJSON,
        exportDataCSV,
        importDataJSON,
        importDataCSV,
        resetToDemoData,
        clearAllData,
        triggerConfetti,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
