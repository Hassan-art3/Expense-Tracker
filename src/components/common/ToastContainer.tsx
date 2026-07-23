import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
          info: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
        };

        const bgColors = {
          success: 'border-emerald-500/30 bg-emerald-950/20 dark:bg-emerald-950/40',
          warning: 'border-amber-500/30 bg-amber-950/20 dark:bg-amber-950/40',
          error: 'border-rose-500/30 bg-rose-950/20 dark:bg-rose-950/40',
          info: 'border-sky-500/30 bg-sky-950/20 dark:bg-sky-950/40',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-2xl border backdrop-blur-md bg-white/90 dark:bg-slate-900/90 shadow-xl flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-bottom-2 ${
              bgColors[toast.type]
            }`}
          >
            {icons[toast.type]}
            <div className="flex-1 space-y-0.5">
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100">{toast.title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
