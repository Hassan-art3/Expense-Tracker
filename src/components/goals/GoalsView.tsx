import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FinancialGoal } from '../../types';
import { formatCurrency } from '../../lib/currency';
import { formatDate } from '../../lib/utils';
import {
  Target,
  Plus,
  CheckCircle2,
  Calendar,
  Sparkles,
  Edit2,
  Trash2,
  X,
  ArrowUpRight,
} from 'lucide-react';

export const GoalsView: React.FC = () => {
  const { goals, addGoal, updateGoal, depositToGoal, deleteGoal, settings } = useApp();
  const baseCurr = settings.baseCurrency;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('1000');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#10b981');

  // Deposit Modal
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmountInput, setDepositAmountInput] = useState('100');

  const handleOpenGoalModal = (g?: FinancialGoal) => {
    if (g) {
      setEditingGoal(g);
      setName(g.name);
      setTargetAmount(g.targetAmount.toString());
      setCurrentAmount(g.currentAmount.toString());
      setDeadline(g.deadline);
      setDescription(g.description || '');
      setColor(g.color);
    } else {
      setEditingGoal(null);
      setName('');
      setTargetAmount('2000');
      setCurrentAmount('0');
      setDeadline(new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]);
      setDescription('');
      setColor('#10b981');
    }
    setIsModalOpen(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const curr = parseFloat(currentAmount);
    if (!name || isNaN(target) || target <= 0) return;

    if (editingGoal) {
      updateGoal(editingGoal.id, {
        name,
        targetAmount: target,
        currentAmount: curr,
        deadline,
        description,
        color,
      });
    } else {
      addGoal({
        name,
        targetAmount: target,
        currentAmount: curr,
        deadline,
        currency: baseCurr,
        description,
        color,
      });
    }
    setIsModalOpen(false);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (depositGoalId) {
      const amt = parseFloat(depositAmountInput);
      if (!isNaN(amt) && amt > 0) {
        depositToGoal(depositGoalId, amt);
        setDepositGoalId(null);
      }
    }
  };

  return (
    <div className="p-3.5 sm:p-6 pb-24 md:pb-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">Financial Savings Goals</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set target savings milestones, track growth, and celebrate financial victories.
          </p>
        </div>

        <button
          onClick={() => handleOpenGoalModal()}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
          const remaining = Math.max(0, g.targetAmount - g.currentAmount);

          return (
            <div
              key={g.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm"
                      style={{ backgroundColor: g.color }}
                    >
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
                        <span>{g.name}</span>
                        {g.isCompleted && <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />}
                      </h3>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Deadline: {formatDate(g.deadline)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenGoalModal(g)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteGoal(g.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {g.description && <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{g.description}</p>}

                {/* Progress bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">
                      Saved: {formatCurrency(g.currentAmount, g.currency)}
                    </span>
                    <span style={{ color: g.color }} className="font-bold">
                      {pct}%
                    </span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full transition-all duration-500 rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: g.color }}
                    />
                  </div>
                </div>
              </div>

              {/* Deposit Action Strip */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px]">
                  Target: {formatCurrency(g.targetAmount, g.currency)}
                </span>

                <button
                  onClick={() => {
                    setDepositGoalId(g.id);
                    setDepositAmountInput('100');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/10 hover:text-emerald-500 font-semibold text-xs transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Deposit</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                {editingGoal ? 'Edit Financial Goal' : 'Create New Savings Goal'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Goal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rainy Day Reserve, New Car, Japan Trip"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Target ({baseCurr}) *</label>
                  <input
                    type="number"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm font-mono outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Current Saved</label>
                  <input
                    type="number"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm font-mono outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Target Deadline Date</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description / Memo</label>
                <input
                  type="text"
                  placeholder="Optional details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm outline-none"
                />
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
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {depositGoalId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Deposit to Goal</h3>
              <button onClick={() => setDepositGoalId(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Deposit Amount</label>
                <input
                  type="number"
                  step="1"
                  required
                  value={depositAmountInput}
                  onChange={(e) => setDepositAmountInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm font-mono outline-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDepositGoalId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md"
                >
                  Confirm Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
