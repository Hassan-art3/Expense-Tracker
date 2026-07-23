import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Expense, CurrencyCode, PaymentMethod } from '../../types';
import { convertCurrency, formatCurrency } from '../../lib/currency';
import { CategoryBadge } from '../common/CategoryBadge';
import { formatDate } from '../../lib/utils';
import {
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  Copy,
  Edit2,
  Trash2,
  FileText,
  X,
  ArrowUpDown,
  Tag,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const {
    expenses,
    categories,
    settings,
    exchangeRates,
    openExpenseModal,
    deleteExpense,
    duplicateExpense,
    bulkDeleteExpenses,
    exportDataCSV,
    importDataCSV,
  } = useApp();

  const baseCurr = settings.baseCurrency;

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // CSV Import State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');

  // Filtered & Sorted Expenses
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((item) => {
        const matchesSearch =
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.notes?.toLowerCase().includes(search.toLowerCase()) ||
          item.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

        const matchesCat = selectedCategory === 'all' || item.categoryId === selectedCategory;
        const matchesPayment = selectedPayment === 'all' || item.paymentMethod === selectedPayment;

        return matchesSearch && matchesCat && matchesPayment;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'date') {
          comp = new Date(a.date).getTime() - new Date(b.date).getTime();
        } else if (sortBy === 'amount') {
          const valA = convertCurrency(a.amount, a.currency, baseCurr, exchangeRates.rates);
          const valB = convertCurrency(b.amount, b.currency, baseCurr, exchangeRates.rates);
          comp = valA - valB;
        } else if (sortBy === 'title') {
          comp = a.title.localeCompare(b.title);
        }
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [expenses, search, selectedCategory, selectedPayment, sortBy, sortOrder, baseCurr, exchangeRates]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredExpenses.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredExpenses.map((e) => e.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.length > 0) {
      if (confirm(`Are you sure you want to delete ${selectedIds.length} expense records?`)) {
        bulkDeleteExpenses(selectedIds);
        setSelectedIds([]);
      }
    }
  };

  const handleCSVImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (importText) {
      const ok = importDataCSV(importText);
      if (ok) {
        setIsImportModalOpen(false);
        setImportText('');
      }
    }
  };

  return (
    <div className="p-3.5 sm:p-6 pb-24 md:pb-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">Expenses & Transactions</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage, search, filter, and audit all expense records in your local vault.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={exportDataCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => openExpenseModal()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search expenses by title, notes, or tags..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-xs outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          {/* Filters dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs outline-none cursor-pointer"
            >
              <option value="all">All Payment Methods</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Apple Pay">Apple Pay</option>
              <option value="Google Pay">Google Pay</option>
            </select>

            {/* Sort controls */}
            <button
              onClick={() => {
                if (sortBy === 'date') setSortBy('amount');
                else if (sortBy === 'amount') setSortBy('title');
                else setSortBy('date');
              }}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort: {sortBy.toUpperCase()}</span>
            </button>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold"
            >
              {sortOrder.toUpperCase()}
            </button>
          </div>
        </div>

        {/* Batch Selection Action Strip */}
        {selectedIds.length > 0 && (
          <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between animate-in fade-in">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              {selectedIds.length} items selected
            </span>
            <button
              onClick={handleBatchDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white font-medium text-xs shadow-sm hover:bg-rose-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Expenses Data View */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
        {/* Mobile Card View (visible on screens < md) */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredExpenses.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No expense records found matching your query.
            </div>
          ) : (
            filteredExpenses.map((exp) => {
              const isSelected = selectedIds.includes(exp.id);
              const convertedAmount = convertCurrency(exp.amount, exp.currency, baseCurr, exchangeRates.rates);

              return (
                <div
                  key={exp.id}
                  className={`p-4 space-y-3 transition-colors ${
                    isSelected ? 'bg-emerald-500/5' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <button onClick={() => toggleSelectOne(exp.id)} className="p-1 text-slate-400 mt-0.5">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                          <span>{exp.title}</span>
                          {exp.receiptUrl && <FileText className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <CategoryBadge categoryId={exp.categoryId} size="sm" />
                          <span className="text-[10px] font-mono text-slate-400">{formatDate(exp.date)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                        {formatCurrency(exp.amount, exp.currency)}
                      </div>
                      {exp.currency !== baseCurr && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          ≈ {formatCurrency(convertedAmount, baseCurr)}
                        </div>
                      )}
                    </div>
                  </div>

                  {exp.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl">
                      {exp.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/40 text-[11px] text-slate-400">
                    <span className="font-medium text-slate-500 dark:text-slate-400">{exp.paymentMethod}</span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => duplicateExpense(exp.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openExpenseModal(exp)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteExpense(exp.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table View (visible on screens >= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="p-4 w-10">
                  <button onClick={toggleSelectAll} className="p-1 text-slate-400 hover:text-slate-600">
                    {selectedIds.length === filteredExpenses.length && filteredExpenses.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="p-4">Title & Details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Tags</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    No expense records found matching your query.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const isSelected = selectedIds.includes(exp.id);
                  const convertedAmount = convertCurrency(exp.amount, exp.currency, baseCurr, exchangeRates.rates);

                  return (
                    <tr
                      key={exp.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-emerald-500/5' : ''
                      }`}
                    >
                      <td className="p-4">
                        <button onClick={() => toggleSelectOne(exp.id)} className="p-1 text-slate-400">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                          <span>{exp.title}</span>
                          {exp.receiptUrl && <FileText className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                        </div>
                        {exp.notes && <p className="text-[11px] text-slate-400 truncate max-w-xs">{exp.notes}</p>}
                      </td>

                      <td className="p-4">
                        <CategoryBadge categoryId={exp.categoryId} size="sm" />
                      </td>

                      <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                        {exp.paymentMethod}
                      </td>

                      <td className="p-4 text-slate-500 dark:text-slate-400 font-mono">
                        <div>{formatDate(exp.date)}</div>
                        {exp.time && <div className="text-[10px] text-slate-400">{exp.time}</div>}
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {exp.tags.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <div className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                          {formatCurrency(exp.amount, exp.currency)}
                        </div>
                        {exp.currency !== baseCurr && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            ≈ {formatCurrency(convertedAmount, baseCurr)}
                          </div>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => duplicateExpense(exp.id)}
                            title="Duplicate Expense"
                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openExpenseModal(exp)}
                            title="Edit Expense"
                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteExpense(exp.id)}
                            title="Delete Expense"
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {filteredExpenses.length} of {expenses.length} records
          </span>
          <span className="font-mono font-semibold">
            Filtered Total: {formatCurrency(filteredExpenses.reduce((a, e) => a + convertCurrency(e.amount, e.currency, baseCurr, exchangeRates.rates), 0), baseCurr)}
          </span>
        </div>
      </div>

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Import Expenses CSV</h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Paste raw CSV content below with columns: Title, Amount, Currency, Category, Date, PaymentMethod, Notes.
            </p>

            <textarea
              rows={6}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Title,Amount,Currency,Category,Date,PaymentMethod&#10;Trader Joes,89.50,USD,food,2026-07-20,Credit Card"
              className="w-full p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-800 dark:text-slate-100 outline-none"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={handleCSVImportSubmit}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs"
              >
                Process CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
