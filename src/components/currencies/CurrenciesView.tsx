import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SUPPORTED_CURRENCIES } from '../../data/currencies';
import { formatDate } from '../../lib/utils';
import { RefreshCw, Globe, Clock, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';

export const CurrenciesView: React.FC = () => {
  const { exchangeRates, refreshExchangeRates, settings, updateSettings, addToast } = useApp();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncLive = async () => {
    setIsSyncing(true);
    await refreshExchangeRates();
    setIsSyncing(false);
    addToast({
      type: 'success',
      title: 'Exchange Rates Updated',
      message: 'Latest live web market exchange rates fetched successfully.',
    });
  };

  return (
    <div className="p-3.5 sm:p-6 pb-24 md:pb-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
            Multi-Currency & Exchange Rates
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Automated live web market rates for verified multi-currency conversion.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncLive}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing Web API...' : 'Refresh Live Web Rates'}</span>
          </button>
        </div>
      </div>

      {/* Info Notice Banner */}
      <div className="p-4 rounded-3xl bg-teal-500/10 border border-teal-500/20 text-teal-800 dark:text-teal-200 flex items-start gap-3 text-xs leading-relaxed">
        <ShieldCheck className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Automated Web Sync Enabled (Read-Only Exchange Rates)</p>
          <p className="text-slate-600 dark:text-slate-300 text-[11px]">
            Exchange rates are synchronized directly from official live web market feeds (<code className="font-mono bg-teal-500/10 px-1 rounded">open.er-api.com</code>) to ensure accuracy. Manual editing of currency conversion rates is disabled to prevent incorrect or distorted calculations.
          </p>
        </div>
      </div>

      {/* Base Currency Status Banner */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <Globe className="w-4 h-4 text-emerald-500" />
          <span>
            Primary App Display Currency:{' '}
            <strong className="text-slate-900 dark:text-slate-100 font-mono text-sm ml-1">{settings.baseCurrency}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
          <Clock className="w-3.5 h-3.5" />
          <span>Last Web Sync: {formatDate(exchangeRates.lastUpdated)}</span>
        </div>
      </div>

      {/* Currencies Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="p-4">Currency</th>
              <th className="p-4">Symbol</th>
              <th className="p-4">Live Market Rate (1 USD =)</th>
              <th className="p-4 text-right">App Base Currency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {SUPPORTED_CURRENCIES.map((c) => {
              const liveRate = exchangeRates.rates[c.code] || c.defaultRateToUSD;
              const isBase = settings.baseCurrency === c.code;

              return (
                <tr key={c.code} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{c.flag}</span>
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-100">{c.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{c.code}</div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 font-mono font-bold text-slate-700 dark:text-slate-200 text-sm">
                    {c.symbol}
                  </td>

                  <td className="p-4 font-mono">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                        {liveRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase">{c.code}</span>
                    </div>
                  </td>

                  <td className="p-4 text-right">
                    {isBase ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Active Base</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          updateSettings({ baseCurrency: c.code });
                          addToast({
                            type: 'info',
                            title: 'Base Currency Updated',
                            message: `App totals now rendered in ${c.code} (${c.symbol}).`,
                          });
                        }}
                        className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 text-[11px] font-medium transition-all cursor-pointer"
                      >
                        Set as Base
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

