import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Subscription, CurrencyCode, PaymentMethod } from '../../types';
import { convertCurrency, formatCurrency } from '../../lib/currency';
import { formatDate } from '../../lib/utils';
import { Repeat, Plus, CheckCircle2, Clock, Trash2, Edit2, X, AlertCircle } from 'lucide-react';

export const SubscriptionsView: React.FC = () => {
  const {
    subscriptions,
    addSubscription,
    updateSubscription,
    toggleSubscriptionActive,
    deleteSubscription,
    categories,
    settings,
    exchangeRates,
  } = useApp();

  const baseCurr = settings.baseCurrency;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('15');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [nextBillingDate, setNextBillingDate] = useState('');
  const [categoryId, setCategoryId] = useState('entertainment');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Credit Card');

  // Calculate run rates
  const activeSubs = subscriptions.filter((s) => s.active);

  const monthlyRunRate = activeSubs.reduce((acc, sub) => {
    const conv = convertCurrency(sub.amount, sub.currency, baseCurr, exchangeRates.rates);
    return acc + (sub.billingCycle === 'yearly' ? conv / 12 : conv);
  }, 0);

  const handleOpenModal = (s?: Subscription) => {
    if (s) {
      setEditingSub(s);
      setName(s.name);
      setAmount(s.amount.toString());
      setBillingCycle(s.billingCycle);
      setNextBillingDate(s.nextBillingDate);
      setCategoryId(s.categoryId);
      setPaymentMethod(s.paymentMethod);
    } else {
      setEditingSub(null);
      setName('');
      setAmount('15');
      setBillingCycle('monthly');
      setNextBillingDate(new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]);
      setCategoryId('entertainment');
      setPaymentMethod('Credit Card');
    }
    setIsModalOpen(true);
  };

  const handleSaveSub = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!name || isNaN(amt) || amt <= 0) return;

    if (editingSub) {
      updateSubscription(editingSub.id, {
        name,
        amount: amt,
        billingCycle,
        nextBillingDate,
        categoryId,
        paymentMethod,
      });
    } else {
      addSubscription({
        name,
        amount: amt,
        currency: baseCurr,
        billingCycle,
        nextBillingDate,
        categoryId,
        paymentMethod,
        autoRecordExpense: true,
        active: true,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-3.5 sm:p-6 pb-24 md:pb-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">Recurring Subscriptions</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor SaaS memberships, recurring bills, and annual service run-rates.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subscription</span>
        </button>
      </div>

      {/* Run Rate KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
        <div className="p-3.5 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-1">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-400">Monthly Run-Rate</span>
          <div className="text-base sm:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 truncate">
            {formatCurrency(monthlyRunRate, baseCurr)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">Fixed monthly cost</p>
        </div>

        <div className="p-3.5 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-1">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-400">Annualized Total</span>
          <div className="text-base sm:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 truncate">
            {formatCurrency(monthlyRunRate * 12, baseCurr)}
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">12-month projection</p>
        </div>

        <div className="p-3.5 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-400">Active Services</span>
          <div className="text-base sm:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 truncate">
            {activeSubs.length} / {subscriptions.length}
          </div>
          <p className="text-[10px] sm:text-[11px] text-emerald-500 font-medium truncate">Tracked services</p>
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
        {subscriptions.map((sub) => {
          const conv = convertCurrency(sub.amount, sub.currency, baseCurr, exchangeRates.rates);

          return (
            <div
              key={sub.id}
              className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border transition-all ${
                sub.active ? 'border-slate-200/80 dark:border-slate-800/80 shadow-xs' : 'border-slate-200/40 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
                    <Repeat className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{sub.name}</h3>
                    <p className="text-[11px] text-slate-400">{sub.paymentMethod}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenModal(sub)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteSubscription(sub.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 py-2 border-t border-b border-slate-100 dark:border-slate-800 my-2">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-slate-400">Cost:</span>
                  <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                    {formatCurrency(sub.amount, sub.currency)} / {sub.billingCycle}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Next Renewal:</span>
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {formatDate(sub.nextBillingDate)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => toggleSubscriptionActive(sub.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    sub.active
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {sub.active ? 'Active' : 'Paused'}
                </button>

                <span className="text-[10px] text-slate-400">Auto-logged</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subscription Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                {editingSub ? 'Edit Subscription' : 'Add Subscription'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSub} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Service Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix, Spotify, AWS"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Amount ({baseCurr}) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm font-mono outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Cycle</label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm outline-none"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Next Billing Date</label>
                <input
                  type="date"
                  value={nextBillingDate}
                  onChange={(e) => setNextBillingDate(e.target.value)}
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
                  Save Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
