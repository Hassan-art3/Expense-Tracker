import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  X,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Trash2,
  Sparkles,
  Target,
} from 'lucide-react';
import { convertCurrency, formatCurrency } from '../../lib/currency';

export const NotificationDropdown: React.FC = () => {
  const {
    toasts,
    removeToast,
    clearAllToasts,
    addToast,
    budgets,
    expenses,
    goals,
    settings,
    exchangeRates,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const baseCurr = settings.baseCurrency;

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Compute active budget warnings (over 80% or exceeded)
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthlyExpenses = expenses.filter((e) => e.date.startsWith(currentMonthStr));

  const budgetAlerts = budgets
    .map((b) => {
      const isOverall = b.categoryId === 'overall';
      const relevant = isOverall
        ? monthlyExpenses
        : monthlyExpenses.filter((e) => e.categoryId === b.categoryId);

      const spent = relevant.reduce(
        (acc, e) => acc + convertCurrency(e.amount, e.currency, baseCurr, exchangeRates.rates),
        0
      );
      const cap = convertCurrency(b.amount, b.currency, baseCurr, exchangeRates.rates);
      const pct = cap > 0 ? Math.round((spent / cap) * 100) : 0;

      if (pct >= 80) {
        return {
          id: `budget-alert-${b.id}`,
          title: pct >= 100 ? `Budget Exceeded: ${isOverall ? 'Overall' : b.categoryId}` : `Budget Warning (${pct}%): ${isOverall ? 'Overall' : b.categoryId}`,
          message: `Spent ${formatCurrency(spent, baseCurr)} of ${formatCurrency(cap, baseCurr)} budget cap.`,
          type: pct >= 100 ? ('error' as const) : ('warning' as const),
        };
      }
      return null;
    })
    .filter(Boolean);

  // Completed savings goals alerts
  const completedGoals = goals.filter((g) => g.currentAmount >= g.targetAmount);

  const totalNotificationCount = toasts.length + budgetAlerts.length;

  const handleSendTestNotification = () => {
    addToast({
      type: 'info',
      title: 'Test System Alert',
      message: 'Notification system is working properly.',
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="View Notifications & System Alerts"
        className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all active:scale-95"
      >
        <Bell className="w-4 h-4" />
        {totalNotificationCount > 0 && (
          <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          {/* Panel Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-500" />
              <h3 className="font-bold text-xs text-slate-800 dark:text-slate-100">
                Notifications
              </h3>
              {totalNotificationCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/20">
                  {totalNotificationCount}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {toasts.length > 0 && (
                <button
                  onClick={clearAllToasts}
                  className="px-2 py-1 rounded-lg hover:bg-rose-500/10 text-rose-500 text-[10px] font-semibold transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Panel Content Body */}
          <div className="max-h-80 overflow-y-auto p-3 space-y-2 divide-y divide-slate-100 dark:divide-slate-800/60">
            {/* Active Toasts */}
            {toasts.map((toast) => {
              const icons = {
                success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
                warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
                error: <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />,
                info: <Info className="w-4 h-4 text-sky-500 shrink-0" />,
              };

              return (
                <div key={toast.id} className="pt-2 first:pt-0 flex items-start gap-2.5">
                  <div className="mt-0.5">{icons[toast.type]}</div>
                  <div className="flex-1 space-y-0.5">
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                      {toast.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      {toast.message}
                    </p>
                  </div>
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}

            {/* Smart Budget Alerts */}
            {budgetAlerts.map((bAlert: any) => (
              <div key={bAlert.id} className="pt-2 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-0.5">
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                    {bAlert.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    {bAlert.message}
                  </p>
                </div>
              </div>
            ))}

            {/* Savings Goal Achievements */}
            {completedGoals.map((g) => (
              <div key={`goal-alert-${g.id}`} className="pt-2 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                <div className="flex-1 space-y-0.5">
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                    Savings Milestone Achieved!
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    Goal "{g.name}" target reached ({formatCurrency(g.targetAmount, g.currency)}).
                  </p>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {toasts.length === 0 && budgetAlerts.length === 0 && completedGoals.length === 0 && (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mx-auto" />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  No pending notifications
                </p>
                <p className="text-[10px] text-slate-400">Your financial vault status is all clear.</p>
              </div>
            )}
          </div>

          {/* Panel Footer */}
          <div className="p-3 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">System Status: Active</span>
            <button
              onClick={handleSendTestNotification}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
            >
              Test Alert
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
