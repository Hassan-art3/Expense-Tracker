import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CurrencyCode, PaymentMethod, Expense } from '../../types';
import { SUPPORTED_CURRENCIES } from '../../data/currencies';
import {
  X,
  Upload,
  Sparkles,
  Receipt,
  Tag,
  DollarSign,
  Calendar,
  Clock,
  CreditCard,
  FileText,
  Trash2,
} from 'lucide-react';

export const ExpenseModal: React.FC = () => {
  const {
    isExpenseModalOpen,
    closeExpenseModal,
    editingExpense,
    addExpense,
    updateExpense,
    categories,
    settings,
    addToast,
  } = useApp();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>(settings.baseCurrency);
  const [categoryId, setCategoryId] = useState('food');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(() => new Date().toTimeString().substring(0, 5));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Credit Card');
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined);
  const [receiptName, setReceiptName] = useState<string | undefined>(undefined);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (editingExpense) {
      setTitle(editingExpense.title);
      setAmount(editingExpense.amount.toString());
      setCurrency(editingExpense.currency);
      setCategoryId(editingExpense.categoryId);
      setDate(editingExpense.date);
      setTime(editingExpense.time || '12:00');
      setPaymentMethod(editingExpense.paymentMethod);
      setNotes(editingExpense.notes || '');
      setTagsInput(editingExpense.tags.join(', '));
      setReceiptUrl(editingExpense.receiptUrl);
      setReceiptName(editingExpense.receiptName);
    } else {
      // Defaults
      setTitle('');
      setAmount('');
      setCurrency(settings.baseCurrency);
      setCategoryId('food');
      setDate(new Date().toISOString().split('T')[0]);
      setTime(new Date().toTimeString().substring(0, 5));
      setPaymentMethod('Credit Card');
      setNotes('');
      setTagsInput('');
      setReceiptUrl(undefined);
      setReceiptName(undefined);
    }
  }, [editingExpense, settings.baseCurrency, isExpenseModalOpen]);

  if (!isExpenseModalOpen) return null;

  const handleFileUpload = (file: File) => {
    setReceiptName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setReceiptUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleReceiptScan = () => {
    if (!receiptUrl) {
      addToast({
        type: 'warning',
        title: 'Upload Receipt First',
        message: 'Please select or drag a receipt image to scan with AI.',
      });
      return;
    }

    setIsScanning(true);
    setTimeout(() => {
      // Simulated receipt extraction or Gemini smart parse
      setTitle('Apple Store - Genius Bar Repair');
      setAmount('129.50');
      setCategoryId('shopping');
      setPaymentMethod('Credit Card');
      setNotes('Receipt OCR scanned automatically');
      setTagsInput('apple, tech, repair');
      setIsScanning(false);
      addToast({
        type: 'success',
        title: 'Receipt Scanned!',
        message: 'Extracted merchant, total amount ($129.50), and items.',
      });
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) {
      addToast({
        type: 'error',
        title: 'Invalid Input',
        message: 'Please provide a valid title and positive amount.',
      });
      return;
    }

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingExpense) {
      updateExpense(editingExpense.id, {
        title,
        amount: numAmount,
        currency,
        categoryId,
        date,
        time,
        paymentMethod,
        notes,
        tags: tagsArray,
        receiptUrl,
        receiptName,
      });
    } else {
      addExpense({
        title,
        amount: numAmount,
        currency,
        categoryId,
        date,
        time,
        paymentMethod,
        notes,
        tags: tagsArray,
        receiptUrl,
        receiptName,
      });
    }

    closeExpenseModal();
  };

  const paymentMethodsList: PaymentMethod[] = [
    'Credit Card',
    'Debit Card',
    'Cash',
    'Bank Transfer',
    'Apple Pay',
    'Google Pay',
    'Crypto',
    'Other',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                {editingExpense ? 'Edit Expense Record' : 'Record New Expense'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Log a personal or business expenditure into your local vault.
              </p>
            </div>
          </div>
          <button
            onClick={closeExpenseModal}
            className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title & Amount Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Expense Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Whole Foods Groceries, Uber Trip"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Amount *</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-3 pr-14 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm font-mono outline-none focus:border-emerald-500 font-bold"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                  className="absolute right-1 top-1 bottom-1 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold px-2 rounded-lg outline-none cursor-pointer border border-slate-200 dark:border-slate-600"
                >
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm outline-none focus:border-emerald-500 font-medium cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm outline-none focus:border-emerald-500 font-medium cursor-pointer"
              >
                {paymentMethodsList.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Transaction Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Tags & Notes */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tags (Comma Separated)</label>
              <div className="relative">
                <Tag className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. work, travel, tax-deductible"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Notes / Description</label>
              <textarea
                rows={2}
                placeholder="Optional memo, item details or tax notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Receipt Attachment / OCR */}
          <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Receipt Attachment & AI OCR</span>
              </label>

              {receiptUrl && (
                <button
                  type="button"
                  onClick={handleReceiptScan}
                  disabled={isScanning}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isScanning ? 'Scanning...' : 'OCR Scan Receipt'}</span>
                </button>
              )}
            </div>

            {receiptUrl ? (
              <div className="relative p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3 truncate">
                  <img src={receiptUrl} alt="Receipt Preview" className="w-12 h-12 rounded-lg object-cover border" />
                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {receiptName || 'Attached Receipt'}
                    </p>
                    <p className="text-[11px] text-slate-500">Image loaded ready for vault storage</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setReceiptUrl(undefined);
                    setReceiptName(undefined);
                  }}
                  className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                <Upload className="w-6 h-6 text-slate-400 group-hover:text-emerald-500 transition-colors mb-1" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Click to attach receipt or drag & drop image
                </span>
                <span className="text-[10px] text-slate-400">PNG, JPG, WebP supported</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
              </label>
            )}
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={closeExpenseModal}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md active:scale-95 transition-all"
            >
              {editingExpense ? 'Save Changes' : 'Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
