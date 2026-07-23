import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { convertCurrency, formatCurrency } from '../../lib/currency';
import { CategoryBadge } from '../common/CategoryBadge';
import { formatDate } from '../../lib/utils';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { expenses, settings, exchangeRates, openExpenseModal } = useApp();
  const baseCurr = settings.baseCurrency;

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(() => new Date().toISOString().split('T')[0]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Month navigation
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Get number of days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Expenses for selected date
  const selectedDayExpenses = expenses.filter((e) => e.date === selectedDateStr);
  const selectedDayTotal = selectedDayExpenses.reduce((acc, e) => {
    return acc + convertCurrency(e.amount, e.currency, baseCurr, exchangeRates.rates);
  }, 0);

  return (
    <div className="p-3.5 sm:p-6 pb-24 md:pb-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">Calendar View</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Browse expenses geographically by day on an interactive monthly grid.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-2xl shadow-xs">
            <button onClick={prevMonth} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold font-mono px-3 text-slate-800 dark:text-slate-100">
              {monthName} {year}
            </span>
            <button onClick={nextMonth} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Calendar Grid (2 Cols) */}
        <div className="lg:col-span-2 p-3.5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3 sm:space-y-4">
          <div className="grid grid-cols-7 gap-1 text-center font-semibold text-[11px] sm:text-xs text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2 pt-1">
            {/* Empty slots for offset */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-14 sm:h-20 rounded-2xl bg-slate-50/30 dark:bg-slate-900/30" />
            ))}

            {/* Days of Month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayExps = expenses.filter((e) => e.date === dStr);
              const daySpent = dayExps.reduce(
                (acc, e) => acc + convertCurrency(e.amount, e.currency, baseCurr, exchangeRates.rates),
                0
              );

              const isSelected = selectedDateStr === dStr;
              const isToday = new Date().toISOString().split('T')[0] === dStr;

              return (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDateStr(dStr)}
                  className={`h-14 sm:h-20 p-1 sm:p-2 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                      : 'border-slate-200/50 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayExps.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                  </div>

                  {daySpent > 0 && (
                    <div className="text-[10px] font-mono font-bold text-slate-900 dark:text-slate-100 truncate">
                      {formatCurrency(daySpent, baseCurr)}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details Panel */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  {formatDate(selectedDateStr)}
                </h3>
                <p className="text-xs text-slate-400">
                  Total: <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{formatCurrency(selectedDayTotal, baseCurr)}</span>
                </p>
              </div>

              <button
                onClick={() => openExpenseModal()}
                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white"
                title="Add Expense for this date"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {selectedDayExpenses.length === 0 ? (
                <p className="text-center py-12 text-xs text-slate-400">No expenses recorded on this date.</p>
              ) : (
                selectedDayExpenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-700/40 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <CategoryBadge categoryId={exp.categoryId} showName={false} size="sm" />
                      <div>
                        <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-100">{exp.title}</h4>
                        <p className="text-[10px] text-slate-400">{exp.paymentMethod}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                      {formatCurrency(exp.amount, exp.currency)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
