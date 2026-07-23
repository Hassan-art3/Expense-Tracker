import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { convertCurrency, formatCurrency } from '../../lib/currency';
import { CategoryBadge } from '../common/CategoryBadge';
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Calendar,
  CreditCard,
  Printer,
  Download,
  Flame,
  Award,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

export const AnalyticsView: React.FC = () => {
  const { expenses, categories, settings, exchangeRates, exportDataCSV } = useApp();
  const baseCurr = settings.baseCurrency;

  const [timeframe, setTimeframe] = useState<'30days' | 'thisYear' | 'allTime'>('30days');

  // Filter expenses by timeframe
  const now = new Date();
  const filteredExpenses = expenses.filter((e) => {
    if (timeframe === '30days') {
      const d = new Date(e.date);
      const diff = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
      return diff <= 30;
    }
    if (timeframe === 'thisYear') {
      return e.date.startsWith(`${now.getFullYear()}`);
    }
    return true;
  });

  const totalSpent = filteredExpenses.reduce((acc, e) => {
    return acc + convertCurrency(e.amount, e.currency, baseCurr, exchangeRates.rates);
  }, 0);

  // Category aggregations & percentages
  const catTotals: Record<string, number> = {};
  filteredExpenses.forEach((e) => {
    const conv = convertCurrency(e.amount, e.currency, baseCurr, exchangeRates.rates);
    catTotals[e.categoryId] = (catTotals[e.categoryId] || 0) + conv;
  });

  const catListSorted = Object.entries(catTotals)
    .map(([catId, amount]) => {
      const catObj = categories.find((c) => c.id === catId);
      const percentage = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
      return {
        id: catId,
        name: catObj ? catObj.name : catId,
        amount,
        percentage,
        color: catObj ? catObj.color : '#64748b',
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const highestCat = catListSorted[0];
  const lowestCat = catListSorted[catListSorted.length - 1];

  // Payment method distribution
  const paymentTotals: Record<string, number> = {};
  filteredExpenses.forEach((e) => {
    const conv = convertCurrency(e.amount, e.currency, baseCurr, exchangeRates.rates);
    paymentTotals[e.paymentMethod] = (paymentTotals[e.paymentMethod] || 0) + conv;
  });

  const paymentData = Object.entries(paymentTotals).map(([method, amount]) => ({
    name: method,
    value: Math.round(amount),
  }));

  const COLORS = ['#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#f59e0b', '#06b6d4', '#ef4444'];

  // Heatmap: expenses by day of month (last 30 days)
  const days30 = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (29 - i));
    const dStr = d.toISOString().split('T')[0];
    const daySpent = expenses
      .filter((e) => e.date === dStr)
      .reduce((acc, e) => acc + convertCurrency(e.amount, e.currency, baseCurr, exchangeRates.rates), 0);

    return {
      date: dStr.substring(8), // day of month e.g. "22"
      spent: Math.round(daySpent),
    };
  });

  // Daily & Monthly Averages
  const avgDaily = Math.round(totalSpent / (timeframe === '30days' ? 30 : 365));
  const avgMonthly = Math.round(totalSpent / (timeframe === '30days' ? 1 : 12));

  return (
    <div className="p-3.5 sm:p-6 pb-24 md:pb-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">Spending Analytics</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Deep financial intelligence, category distribution, averages, and payment trends.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setTimeframe('30days')}
              className={`px-2.5 py-1 rounded-lg transition-colors text-xs ${
                timeframe === '30days'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeframe('thisYear')}
              className={`px-2.5 py-1 rounded-lg transition-colors text-xs ${
                timeframe === 'thisYear'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              This Year
            </button>
            <button
              onClick={() => setTimeframe('allTime')}
              className={`px-2.5 py-1 rounded-lg transition-colors text-xs ${
                timeframe === 'allTime'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              All Time
            </button>
          </div>

          <button
            onClick={exportDataCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="p-3.5 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-1">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-400">Total Analyzed</span>
          <div className="text-base sm:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 truncate">
            {formatCurrency(totalSpent, baseCurr)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-emerald-500 font-medium truncate">{filteredExpenses.length} records</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400">Avg. Daily Spending</span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
            {formatCurrency(avgDaily, baseCurr)}
          </div>
          <p className="text-[11px] text-slate-400">Calculated per calendar day</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400">Highest Category</span>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
            {highestCat ? highestCat.name : 'N/A'}
          </div>
          {highestCat && (
            <p className="text-[11px] text-rose-500 font-mono font-medium">
              {formatCurrency(highestCat.amount, baseCurr)} ({highestCat.percentage}%)
            </p>
          )}
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400">Lowest Category</span>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
            {lowestCat ? lowestCat.name : 'N/A'}
          </div>
          {lowestCat && (
            <p className="text-[11px] text-emerald-500 font-mono font-medium">
              {formatCurrency(lowestCat.amount, baseCurr)} ({lowestCat.percentage}%)
            </p>
          )}
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Share Bar Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Category Spending Shares</h3>
            <p className="text-xs text-slate-400">Total expenditure grouped by category</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catListSorted} layout="vertical">
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={100} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${formatCurrency(Number(val), baseCurr)}`, 'Amount']}
                />
                <Bar dataKey="amount" fill="#10b981" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Method Distribution */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Payment Methods Split</h3>
            <p className="text-xs text-slate-400">Where your money flows from</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${formatCurrency(Number(val), baseCurr)}`, 'Amount']}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 30-Day Heatmap Visualization */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Daily Expense Heatmap (Last 30 Days)</h3>
          <p className="text-xs text-slate-400">Visual intensity of daily financial transactions</p>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 pt-2">
          {days30.map((d, idx) => {
            let heatColor = 'bg-slate-100 dark:bg-slate-800';
            if (d.spent > 500) heatColor = 'bg-emerald-600 text-white font-bold';
            else if (d.spent > 200) heatColor = 'bg-emerald-500/80 text-white';
            else if (d.spent > 50) heatColor = 'bg-emerald-500/40 text-emerald-900 dark:text-emerald-100';
            else if (d.spent > 0) heatColor = 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-200';

            return (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 flex flex-col items-center justify-center transition-all hover:scale-105 ${heatColor}`}
                title={`Day ${d.date}: ${formatCurrency(d.spent, baseCurr)}`}
              >
                <span className="text-[10px] font-mono opacity-80">{d.date}</span>
                <span className="text-xs font-mono font-bold mt-0.5">{d.spent > 0 ? `$${d.spent}` : '-'}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
