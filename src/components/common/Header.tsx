import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Plus,
  Moon,
  Sun,
  Lock,
  Wifi,
  Globe,
  Sparkles,
  Menu,
  RefreshCw,
} from 'lucide-react';
import { SUPPORTED_CURRENCIES } from '../../data/currencies';
import { CurrencyCode } from '../../types';
import { NotificationDropdown } from './NotificationDropdown';

export const Header: React.FC = () => {
  const {
    settings,
    updateSettings,
    setCommandPaletteOpen,
    openExpenseModal,
    lockApp,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    refreshExchangeRates,
  } = useApp();

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
  };

  const handleBaseCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ baseCurrency: e.target.value as CurrencyCode });
  };

  return (
    <header className="h-14 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between sticky top-0 z-30 select-none transition-colors">
      {/* Left: Mobile Menu Trigger & App Branding */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 md:hidden transition-colors"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-100 text-xs sm:text-sm tracking-tight hidden xs:inline">
            Expense Tracker
          </span>
        </div>
      </div>

      {/* Middle: Search Bar */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 text-xs transition-all w-28 sm:w-64 md:w-80 justify-between group mx-1"
      >
        <div className="flex items-center gap-1.5 truncate">
          <Search className="w-3.5 h-3.5 shrink-0 group-hover:text-emerald-500 transition-colors" />
          <span className="truncate text-[11px] sm:text-xs">Search...</span>
        </div>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-400 shadow-xs">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Right: Currency Selector, Theme, Quick Add */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Currency Switcher */}
        <div className="relative flex items-center bg-slate-100/80 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 rounded-xl px-1.5 py-1 text-xs">
          <Globe className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0 hidden sm:inline" />
          <select
            value={settings.baseCurrency}
            onChange={handleBaseCurrencyChange}
            className="bg-transparent text-slate-700 dark:text-slate-200 font-medium outline-none cursor-pointer text-xs pr-0.5"
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                {c.code}
              </option>
            ))}
          </select>
        </div>

        {/* Live Web Currency Sync Indicator */}
        <button
          onClick={() => refreshExchangeRates()}
          title="Rates auto-updated live from web API. Click to refresh manually."
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[11px] font-medium border border-teal-500/20 hover:bg-teal-500/20 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3 h-3 text-teal-500 animate-spin-slow" />
          <span>Live Web Rates</span>
        </button>

        {/* Notification Bell */}
        <NotificationDropdown />

        {/* PIN Lock button if enabled */}
        {settings.pinLockEnabled && (
          <button
            onClick={lockApp}
            title="Lock Application"
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors hidden sm:block"
          >
            <Lock className="w-4 h-4" />
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle Dark / Light Theme"
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
        >
          {settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
        </button>

        {/* Quick Add Expense Button */}
        <button
          onClick={() => openExpenseModal()}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-sm hover:shadow-emerald-500/20 active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Expense</span>
        </button>
      </div>
    </header>
  );
};
