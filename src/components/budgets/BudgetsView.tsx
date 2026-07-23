import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Budget, CurrencyCode } from '../../types';
import { convertCurrency, formatCurrency } from '../../lib/currency';
import { CategoryBadge } from '../common/CategoryBadge';
import {
  PieChart,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Trash2,
  X,
  Target,
  Sparkles,
} from 'lucide-react';

export const BudgetsView: React.FC = () => {
  const {
    budgets,
    expenses,
    categories,
    settings,
    exchangeRates,
    addBudget,
    updateBudget,
    deleteBudget,
  } = useApp();

  const baseCurr = settings.baseCurrency;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('overall');
  const [amountInput, setAmountInput] = useState<string>('500');

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthlyExpenses = expenses.filter((e) => e.date.startsWith(currentMonthStr));

  const handleOpenModal = (b?: Budget) => {
    if (b) {
      setEditingBudget(b);
      setSelectedCategory(b.categoryId);
      setAmountInput(b.amount.toString());
    } else {
      setEditingBudget(null);
      setSelectedCategory('food');
      setAmountInput('0');
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amountInput);
    if (isNaN(val) || val < 0) return;

    if (editingBudget) {
      updateBudget(editingBudget.id, {
        categoryId: selectedCategory,
        amount: val,
        currency: baseCurr,
      });
    } else {
      addBudget({
        categoryId: selectedCategory,
        amount: val,
        currency: baseCurr,
        period: 'monthly',
      });
    }
    setIsModalOpen(false);
  };

  const handleMatchSpentToZero = (budget: Budget, spentAmount: number) => {
    updateBudget(budget.id, {
      amount: spentAmount,
      currency: baseCurr,
    });
  };

  // Summary calculations for BudgetsView
  const overallBudgetObj = budgets.find((b) => b.categoryId === 'overall');
  const categoryBudgetsSum = budgets
    .filter((b) => b.categoryId !== 'overall')
    .reduce((acc, b) => acc + convertCurrency(b.amount, b.currency, baseCurr, exchangeRates.rates), 0);

  const totalEffectiveBudgetCap = overallBudgetObj && overallBudgetObj.amount > 0
    ? convertCurrency(overallBudgetObj.amount, overallBudgetObj.currency, baseCurr, exchangeRates.rates)
    : categoryBudgetsSum;

  const totalMonthlySpent = monthlyExpenses.reduce((acc, exp) => {
    return acc + convertCurrency(exp.amount, exp.currency, baseCurr, exchangeRates.rates);
  }, 0);

  const totalRemainingBudget = totalEffectiveBudgetCap - totalMonthlySpent;

  return (
    <div className="p-3.5 sm:p-6 pb-24 md:pb-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">Budget Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set overall spending targets and individual category class caps to maintain strict financial health.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md transition-all active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Budget Plan</span>
        </button>
      </div>

      {/* Overall Budget Summary Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border border-slate-700/60 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold tracking-wider text-emerald-400 uppercase">
              Overall Total Monthly Budget
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight">
              {formatCurrency(totalEffectiveBudgetCap, baseCurr)}
            </div>
            <p className="text-xs text-slate-300">
              {overallBudgetObj
                ? 'Custom explicit overall monthly target'
                : `Calculated from ${budgets.filter((b) => b.categoryId !== 'overall').length} active category class budgets`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenModal(overallBudgetObj || undefined)}
              className="px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              {overallBudgetObj ? 'Edit Overall Budget' : '+ Set Overall Budget'}
            </button>
          </div>
        </div>

        {/* Overall Progress Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-700/80">
          <div>
            <span className="text-[11px] text-slate-400">Total Spent</span>
            <div className="text-base font-bold font-mono text-slate-100">
              {formatCurrency(totalMonthlySpent, baseCurr)}
            </div>
          </div>

          <div>
            <span className="text-[11px] text-slate-400">Remaining</span>
            <div className={`text-base font-bold font-mono ${totalRemainingBudget >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(Math.max(0, totalRemainingBudget), baseCurr)}
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-400">Budget Usage</span>
            <div className="text-base font-bold font-mono text-amber-400">
              {totalEffectiveBudgetCap > 0 ? Math.round((totalMonthlySpent / totalEffectiveBudgetCap) * 100) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Budget Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
        {budgets.map((b) => {
          const isOverall = b.categoryId === 'overall';

          // Calculate spent for this category or overall
          const relevantExpenses = isOverall
            ? monthlyExpenses
            : monthlyExpenses.filter((e) => e.categoryId === b.categoryId);

          const spentInBase = relevantExpenses.reduce((acc, exp) => {
            return acc + convertCurrency(exp.amount, exp.currency, baseCurr, exchangeRates.rates);
          }, 0);

          const budgetCapInBase = convertCurrency(b.amount, b.currency, baseCurr, exchangeRates.rates);
          const percentUsed = Math.round((spentInBase / budgetCapInBase) * 100);
          const remaining = budgetCapInBase - spentInBase;

          let statusColor = 'emerald';
          if (percentUsed >= 100) statusColor = 'rose';
          else if (percentUsed >= 80) statusColor = 'amber';

          const catObj = categories.find((c) => c.id === b.categoryId);

          return (
            <div
              key={b.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {isOverall ? (
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <PieChart className="w-5 h-5" />
                    </div>
                  ) : (
                    <CategoryBadge categoryId={b.categoryId} showName={false} size="lg" />
                  )}

                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                      {isOverall ? 'Overall Monthly Cap' : catObj?.name || b.categoryId}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Cap: {formatCurrency(budgetCapInBase, baseCurr)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenModal(b)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {!isOverall && (
                    <button
                      onClick={() => deleteBudget(b.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500 dark:text-slate-400">Spent: {formatCurrency(spentInBase, baseCurr)}</span>
                  <span
                    className={
                      statusColor === 'rose'
                        ? 'text-rose-500 font-bold'
                        : statusColor === 'amber'
                        ? 'text-amber-500'
                        : 'text-emerald-500'
                    }
                  >
                    {percentUsed}%
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      statusColor === 'rose'
                        ? 'bg-rose-500'
                        : statusColor === 'amber'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, percentUsed)}%` }}
                  />
                </div>
              </div>

              {/* Status footer */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-700/40 flex items-center justify-between text-xs font-mono">
                {remaining >= 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Remaining: {formatCurrency(remaining, baseCurr)}
                  </span>
                ) : (
                  <span className="text-rose-500 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Exceeded by {formatCurrency(Math.abs(remaining), baseCurr)}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => handleMatchSpentToZero(b, spentInBase)}
                  title="Set budget target equal to spent amount so remaining budget becomes $0"
                  className="px-2.5 py-1 rounded-lg bg-slate-200/70 dark:bg-slate-700/70 hover:bg-emerald-500 hover:text-white text-slate-600 dark:text-slate-300 text-[10px] font-sans font-medium transition-colors"
                >
                  Set Remaining = $0
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                {editingBudget ? 'Edit Budget' : 'Add New Budget Cap'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm outline-none"
                >
                  <option value="overall">Overall Monthly Total</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Monthly Target ({baseCurr})
                  </label>
                  <span className="text-[10px] text-slate-400">Set 0 to clear target</span>
                </div>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm font-mono outline-none"
                />

                {/* Quick Presets */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setAmountInput('0')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-[11px] font-medium"
                  >
                    Set to $0
                  </button>
                  {editingBudget && (
                    <button
                      type="button"
                      onClick={() => {
                        const isOverall = editingBudget.categoryId === 'overall';
                        const relevant = isOverall
                          ? monthlyExpenses
                          : monthlyExpenses.filter((e) => e.categoryId === editingBudget.categoryId);
                        const spent = relevant.reduce((acc, exp) => {
                          return acc + convertCurrency(exp.amount, exp.currency, baseCurr, exchangeRates.rates);
                        }, 0);
                        setAmountInput(spent.toString());
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/10 hover:text-emerald-500 text-slate-600 dark:text-slate-300 text-[11px] font-medium"
                    >
                      Match Current Spent (Remaining = $0)
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md"
                >
                  Save Budget Cap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
