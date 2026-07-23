import React from 'react';
import { useApp } from '../../context/AppContext';
import { convertCurrency, formatCurrency } from '../../lib/currency';
import { CategoryBadge } from '../common/CategoryBadge';
import { formatDate } from '../../lib/utils';
import {
  TrendingUp,
  Wallet,
  Calendar,
  CreditCard,
  Target,
  ArrowUpRight,
  Plus,
  Flame,
  AlertTriangle,
  Receipt,
  Sparkles,
  PieChart,
  Sliders,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from 'recharts';

export const DashboardView: React.FC = () => {
  const {
    expenses,
    budgets,
    goals,
    subscriptions,
    categories,
    settings,
    exchangeRates,
    openExpenseModal,
    setActiveView,
  } = useApp();

  const baseCurr = settings.baseCurrency;

  // Calculate Key Metrics converted to Base Currency
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const totalSpending = expenses.reduce((acc, exp) => {
    return acc + convertCurrency(exp.amount, exp.currency, baseCurr, exchangeRates.rates);
  }, 0);

  const monthlyExpenses = expenses.filter((exp) => exp.date.startsWith(currentMonthStr));
  const monthlySpending = monthlyExpenses.reduce((acc, exp) => {
    return acc + convertCurrency(exp.amount, exp.currency, baseCurr, exchangeRates.rates);
  }, 0);

  // Weekly spending (last 7 days)
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weeklyExpenses = expenses.filter((exp) => new Date(exp.date) >= sevenDaysAgo);
  const weeklySpending = weeklyExpenses.reduce((acc, exp) => {
    return acc + convertCurrency(exp.amount, exp.currency, baseCurr, exchangeRates.rates);
  }, 0);

  // Daily spending (today)
  const todayStr = now.toISOString().split('T')[0];
  const todayExpenses = expenses.filter((exp) => exp.date === todayStr);
  const todaySpending = todayExpenses.reduce((acc, exp) => {
    return acc + convertCurrency(exp.amount, exp.currency, baseCurr, exchangeRates.rates);
  }, 0);

  // Overall & Category monthly budgets
  const overallBudgetObj = budgets.find((b) => b.categoryId === 'overall');
  const categoryBudgetsSum = budgets
    .filter((b) => b.categoryId !== 'overall')
    .reduce((acc, b) => acc + convertCurrency(b.amount, b.currency, baseCurr, exchangeRates.rates), 0);

  // Total budget target is either explicit overall budget OR sum of category budgets
  const totalBudgetCap = overallBudgetObj && overallBudgetObj.amount > 0
    ? convertCurrency(overallBudgetObj.amount, overallBudgetObj.currency, baseCurr, exchangeRates.rates)
    : categoryBudgetsSum;

  const remainingBudget = totalBudgetCap > 0 ? totalBudgetCap - monthlySpending : 0;
  const budgetPercentUsed = totalBudgetCap > 0
    ? Math.min(100, Math.round((monthlySpending / totalBudgetCap) * 100))
    : 0;

  // Top spending category
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((exp) => {
    const converted = convertCurrency(exp.amount, exp.currency, baseCurr, exchangeRates.rates);
    categoryTotals[exp.categoryId] = (categoryTotals[exp.categoryId] || 0) + converted;
  });

  let topCategoryId = 'food';
  let maxCatAmount = 0;
  Object.entries(categoryTotals).forEach(([catId, amount]) => {
    if (amount > maxCatAmount) {
      maxCatAmount = amount;
      topCategoryId = catId;
    }
  });

  // Prepare chart trend data (last 14 days)
  const last14DaysData = Array.from({ length: 14 }).map((_, idx) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (13 - idx));
    const dStr = d.toISOString().split('T')[0];
    const dayTotal = expenses
      .filter((e) => e.date === dStr)
      .reduce((acc, e) => acc + convertCurrency(e.amount, e.currency, baseCurr, exchangeRates.rates), 0);

    return {
      date: formatDate(dStr).split(',')[0], // e.g. "Jul 22"
      amount: Math.round(dayTotal * 100) / 100,
    };
  });

  // Doughnut category breakdown chart data
  const pieChartData = Object.entries(categoryTotals)
    .map(([catId, value]) => {
      const catObj = categories.find((c) => c.id === catId);
      return {
        name: catObj ? catObj.name : catId,
        value: Math.round(value),
        color: catObj ? catObj.color : '#64748b',
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Recent 5 expenses
  const recentExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="p-3.5 sm:p-6 pb-24 md:pb-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome & Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Personal Vault</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Financial Overview</h1>
          <p className="text-xs text-emerald-100 max-w-lg">
            Track expenses, manage budgets, and achieve your financial goals with full offline privacy.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => openExpenseModal()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-emerald-700 hover:bg-emerald-50 font-semibold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Expense</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Spending */}
        <div className="p-3.5 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-1 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">Total Spending</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => openExpenseModal()}
                title="Quick Add Expense"
                className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
          </div>
          <div className="text-base sm:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 truncate">
            {formatCurrency(totalSpending, baseCurr)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">Lifetime recorded</p>
        </div>

        {/* Monthly Spending */}
        <div className="p-3.5 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-1 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">This Month</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => openExpenseModal()}
                title="Quick Add Expense"
                className="p-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <div className="p-1.5 sm:p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
          </div>
          <div className="text-base sm:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 truncate">
            {formatCurrency(monthlySpending, baseCurr)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">{monthlyExpenses.length} transactions</p>
        </div>

        {/* Weekly & Today */}
        <div className="p-3.5 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-1 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">Weekly / Today</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => openExpenseModal()}
                title="Quick Add Expense"
                className="p-1 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 hover:bg-violet-500 hover:text-white transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <div className="p-1.5 sm:p-2 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
          </div>
          <div className="text-sm sm:text-xl font-bold font-mono text-slate-900 dark:text-slate-100 flex flex-wrap items-baseline gap-1 truncate">
            <span>{formatCurrency(weeklySpending, baseCurr)}</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">{formatCurrency(todaySpending, baseCurr)} today</p>
        </div>

        {/* Monthly Budget Remaining */}
        <div className="p-3.5 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-1 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">Remaining Budget</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveView('budgets')}
                title="Configure / Manage Budgets"
                className="p-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <div className="p-1.5 sm:p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
          </div>
          <div className="text-base sm:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 truncate">
            {totalBudgetCap > 0
              ? formatCurrency(Math.max(0, remainingBudget), baseCurr)
              : formatCurrency(0, baseCurr)}
          </div>
          <div className="w-full h-1.5 sm:h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                budgetPercentUsed > 90 ? 'bg-rose-500' : budgetPercentUsed > 75 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${budgetPercentUsed}%` }}
            />
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
            {totalBudgetCap > 0
              ? `${budgetPercentUsed}% used of ${formatCurrency(totalBudgetCap, baseCurr)} target`
              : 'No budget target set'}
          </p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Trend Line Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">14-Day Spending Velocity</h3>
              <p className="text-xs text-slate-400">Daily expenses converted to {baseCurr}</p>
            </div>
            <button
              onClick={() => setActiveView('analytics')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Full Analytics</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last14DaysData}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${formatCurrency(Number(val), baseCurr)}`, 'Spent']}
                />
                <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Doughnut */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Top Category Breakdown</h3>
            <p className="text-xs text-slate-400">Distribution of spending</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
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

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {pieChartData.slice(0, 3).map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                  {formatCurrency(item.value, baseCurr)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overall & Category Budgets Live Summary Widget */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Overall & Category Budget Status</h3>
              <p className="text-xs text-slate-400">
                Total Cap: {formatCurrency(totalBudgetCap, baseCurr)} • Month-to-date Spent: {formatCurrency(monthlySpending, baseCurr)}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveView('budgets')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/10 hover:text-emerald-500 text-slate-600 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Manage Budgets</span>
          </button>
        </div>

        {/* Overall Total Budget Bar */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5">
              <span>Overall Monthly Total Budget</span>
              {overallBudgetObj ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Explicit Cap</span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">Sum of Category Classes</span>
              )}
            </span>
            <span className="font-mono text-slate-800 dark:text-slate-100">
              {formatCurrency(monthlySpending, baseCurr)} / {formatCurrency(totalBudgetCap, baseCurr)}
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                budgetPercentUsed >= 100 ? 'bg-rose-500' : budgetPercentUsed >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, budgetPercentUsed)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>{budgetPercentUsed}% Used</span>
            <span>
              {remainingBudget >= 0
                ? `Remaining: ${formatCurrency(remainingBudget, baseCurr)}`
                : `Over budget by ${formatCurrency(Math.abs(remainingBudget), baseCurr)}`}
            </span>
          </div>
        </div>

        {/* Category Classes Breakdown Grid */}
        {budgets.filter((b) => b.categoryId !== 'overall').length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {budgets
              .filter((b) => b.categoryId !== 'overall')
              .map((b) => {
                const catExpenses = monthlyExpenses.filter((e) => e.categoryId === b.categoryId);
                const spent = catExpenses.reduce(
                  (acc, exp) => acc + convertCurrency(exp.amount, exp.currency, baseCurr, exchangeRates.rates),
                  0
                );
                const cap = convertCurrency(b.amount, b.currency, baseCurr, exchangeRates.rates);
                const pct = cap > 0 ? Math.round((spent / cap) * 100) : 0;

                return (
                  <div
                    key={b.id}
                    className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/40 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <CategoryBadge categoryId={b.categoryId} showName={true} size="sm" />
                      <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                        {pct}%
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          pct >= 100 ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Spent: {formatCurrency(spent, baseCurr)}</span>
                      <span>Cap: {formatCurrency(cap, baseCurr)}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Bottom Section: Recent Activity & Financial Goals Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions List */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-500" />
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Recent Transactions</h3>
            </div>
            <button
              onClick={() => setActiveView('expenses')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
            >
              View All ({expenses.length})
            </button>
          </div>

          <div className="space-y-2">
            {recentExpenses.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-400">No expenses recorded yet.</p>
            ) : (
              recentExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CategoryBadge categoryId={exp.categoryId} showName={false} size="md" />
                    <div>
                      <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-100">{exp.title}</h4>
                      <p className="text-[11px] text-slate-400">
                        {formatDate(exp.date)} • {exp.paymentMethod}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                      {formatCurrency(exp.amount, exp.currency)}
                    </div>
                    {exp.currency !== baseCurr && (
                      <div className="text-[10px] text-slate-400 font-mono">
                        ≈ {formatCurrency(convertCurrency(exp.amount, exp.currency, baseCurr, exchangeRates.rates), baseCurr)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Goals Progress Snapshot */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-500" />
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Financial Goals</h3>
            </div>
            <button
              onClick={() => setActiveView('goals')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
            >
              Manage
            </button>
          </div>

          <div className="space-y-4">
            {goals.slice(0, 3).map((goal) => {
              const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              return (
                <div key={goal.id} className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-700/40">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800 dark:text-slate-200">{goal.name}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">{pct}%</span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: goal.color }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{formatCurrency(goal.currentAmount, goal.currency)}</span>
                    <span>Target: {formatCurrency(goal.targetAmount, goal.currency)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
