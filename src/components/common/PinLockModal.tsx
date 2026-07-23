import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, KeyRound, Sparkles } from 'lucide-react';

export const PinLockModal: React.FC = () => {
  const { isPinLocked, unlockApp } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isPinLocked) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = unlockApp(pin);
    if (!success) {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2">
            <span>Aura Finance Vault</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter your security PIN code to unlock your personal finances.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="password"
              maxLength={8}
              value={pin}
              onChange={(e) => {
                setError(false);
                setPin(e.target.value);
              }}
              placeholder="Enter PIN code"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-center font-mono text-lg tracking-widest bg-slate-100 dark:bg-slate-800 border ${
                error ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
              } outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-100`}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-md active:scale-98"
          >
            Unlock Vault
          </button>
        </form>
      </div>
    </div>
  );
};
