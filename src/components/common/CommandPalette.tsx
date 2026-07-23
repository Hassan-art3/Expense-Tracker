import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ViewType } from '../../types';
import {
  Search,
  LayoutDashboard,
  Receipt,
  PieChart,
  Target,
  BarChart3,
  Calendar,
  Repeat,
  Coins,
  Settings,
  Plus,
  Moon,
  Sun,
  Download,
  RotateCcw,
  RefreshCw,
  X,
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    setActiveView,
    openExpenseModal,
    expenses,
    settings,
    updateSettings,
    exportDataCSV,
    resetToDemoData,
    refreshExchangeRates,
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  // Build items list based on query
  const navActions = [
    { label: 'Go to Dashboard', icon: LayoutDashboard, action: () => setActiveView('dashboard') },
    { label: 'Go to Expenses & Transactions', icon: Receipt, action: () => setActiveView('expenses') },
    { label: 'Go to Budgets', icon: PieChart, action: () => setActiveView('budgets') },
    { label: 'Go to Financial Goals', icon: Target, action: () => setActiveView('goals') },
    { label: 'Go to Analytics & Reports', icon: BarChart3, action: () => setActiveView('analytics') },
    { label: 'Go to Calendar', icon: Calendar, action: () => setActiveView('calendar') },
    { label: 'Go to Subscriptions', icon: Repeat, action: () => setActiveView('subscriptions') },
    { label: 'Go to Currencies', icon: Coins, action: () => setActiveView('currencies') },
    { label: 'Go to Settings', icon: Settings, action: () => setActiveView('settings') },
  ];

  const quickActions = [
    { label: 'Add New Expense', icon: Plus, action: () => openExpenseModal() },
    {
      label: `Toggle Theme (${settings.theme === 'dark' ? 'Light' : 'Dark'})`,
      icon: settings.theme === 'dark' ? Sun : Moon,
      action: () => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' }),
    },
    { label: 'Export Expenses to CSV', icon: Download, action: () => exportDataCSV() },
    { label: 'Refresh Exchange Rates', icon: RefreshCw, action: () => refreshExchangeRates() },
    { label: 'Reset to Demo Data', icon: RotateCcw, action: () => resetToDemoData() },
  ];

  const matchingExpenses = expenses
    .filter(
      (e) =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.notes?.toLowerCase().includes(search.toLowerCase()) ||
        e.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    )
    .slice(0, 5)
    .map((e) => ({
      label: `Expense: ${e.title} (${e.amount} ${e.currency})`,
      icon: Receipt,
      action: () => {
        setActiveView('expenses');
        openExpenseModal(e);
      },
    }));

  const allFiltered = [
    ...quickActions.filter((a) => a.label.toLowerCase().includes(search.toLowerCase())),
    ...navActions.filter((a) => a.label.toLowerCase().includes(search.toLowerCase())),
    ...matchingExpenses,
  ];

  const handleSelect = (action: () => void) => {
    action();
    setCommandPaletteOpen(false);
    setSearch('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or search expenses..."
            className="w-full bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm outline-none font-medium"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command List */}
        <div className="p-2 overflow-y-auto space-y-1 divide-y divide-slate-100 dark:divide-slate-800/50">
          {allFiltered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No actions or expenses matching "{search}"
            </div>
          ) : (
            allFiltered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(item.action)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center gap-3 transition-colors ${
                    isSelected
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  <span className="ml-auto text-[10px] font-mono text-slate-400">Jump</span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>
            Use <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px]">↑</kbd>{' '}
            <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px]">↓</kbd> to navigate
          </span>
          <span>
            Press <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px]">ESC</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
};
