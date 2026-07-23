import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Moon,
  Sun,
  Lock,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Shield,
  Palette,
  Keyboard,
  Sparkles,
  KeyRound,
  FileSpreadsheet,
  Info,
  User,
  Code,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    exportDataJSON,
    exportDataCSV,
    importDataJSON,
    resetToDemoData,
    clearAllData,
    addToast,
  } = useApp();

  const [pinInput, setPinInput] = useState(settings.pinCode || '');
  const [jsonImportText, setJsonImportText] = useState('');

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      pinLockEnabled: true,
      pinCode: pinInput,
    });
    addToast({ type: 'success', title: 'PIN Saved', message: 'Vault security PIN code enabled.' });
  };

  const handleDisablePin = () => {
    updateSettings({
      pinLockEnabled: false,
      pinCode: undefined,
    });
    setPinInput('');
    addToast({ type: 'info', title: 'PIN Disabled', message: 'PIN code lock turned off.' });
  };

  const handleJSONImport = () => {
    if (jsonImportText) {
      const ok = importDataJSON(jsonImportText);
      if (ok) setJsonImportText('');
    }
  };

  return (
    <div className="p-3.5 sm:p-6 pb-24 md:pb-6 space-y-4 sm:space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">Application Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Customize themes, vault security, local data backups, and shortcuts.
        </p>
      </div>

      {/* Theme & Visual Appearance */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Theme & Appearance</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={() => updateSettings({ theme: 'dark' })}
            className={`p-4 rounded-2xl border text-left space-y-2 transition-all ${
              settings.theme === 'dark'
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 font-bold'
                : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Moon className="w-5 h-5" />
            <div className="text-xs">Dark Mode</div>
          </button>

          <button
            onClick={() => updateSettings({ theme: 'light' })}
            className={`p-4 rounded-2xl border text-left space-y-2 transition-all ${
              settings.theme === 'light'
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 font-bold'
                : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Sun className="w-5 h-5" />
            <div className="text-xs">Light Mode</div>
          </button>

          <button
            onClick={() => updateSettings({ theme: 'system' })}
            className={`p-4 rounded-2xl border text-left space-y-2 transition-all ${
              settings.theme === 'system'
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 font-bold'
                : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <div className="text-xs">System Preference</div>
          </button>
        </div>
      </div>

      {/* Security & PIN Lock */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Vault PIN Code Protection</h3>
        </div>

        <form onSubmit={handleSavePin} className="space-y-3 pt-2 max-w-md">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Set 4 to 8 Digit PIN Code</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="e.g. 1234"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-sm"
            >
              {settings.pinLockEnabled ? 'Update PIN Code' : 'Enable PIN Protection'}
            </button>

            {settings.pinLockEnabled && (
              <button
                type="button"
                onClick={handleDisablePin}
                className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 font-medium text-xs"
              >
                Disable Security PIN
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Data Management & Vault Backups */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Data Backup & Export</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={exportDataJSON}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-left space-y-1 hover:border-emerald-500 transition-colors"
          >
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100 text-xs">
              <Download className="w-4 h-4 text-emerald-500" />
              <span>Export Full JSON Vault Backup</span>
            </div>
            <p className="text-[11px] text-slate-400">Download complete structured database with all expenses, budgets, goals & settings.</p>
          </button>

          <button
            onClick={exportDataCSV}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-left space-y-1 hover:border-emerald-500 transition-colors"
          >
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100 text-xs">
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              <span>Export CSV Table</span>
            </div>
            <p className="text-[11px] text-slate-400">Export expense ledger formatted for Excel, Google Sheets, or Apple Numbers.</p>
          </button>
        </div>

        {/* Restore / Import */}
        <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Restore from JSON Backup</label>
          <textarea
            rows={3}
            value={jsonImportText}
            onChange={(e) => setJsonImportText(e.target.value)}
            placeholder="Paste raw exported JSON contents here to restore..."
            className="w-full p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-800 dark:text-slate-100 outline-none"
          />
          <button
            onClick={handleJSONImport}
            className="px-4 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 text-white font-medium text-xs hover:bg-slate-700"
          >
            Restore JSON Vault
          </button>
        </div>

        {/* Reset / Clear Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              if (confirm('Reset to initial demo data? This will overwrite local changes.')) {
                resetToDemoData();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Permanently clear all financial records? This action cannot be undone.')) {
                clearAllData();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 font-semibold text-xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Local Data</span>
          </button>
        </div>
      </div>

      {/* Shortcuts Guide */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Keyboard className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Desktop Keyboard Shortcuts</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-slate-600 dark:text-slate-300">Command Palette</span>
            <kbd className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border font-mono font-bold text-[10px]">⌘ + K</kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-slate-600 dark:text-slate-300">Record New Expense</span>
            <kbd className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border font-mono font-bold text-[10px]">Add Expense Button</kbd>
          </div>
        </div>
      </div>

      {/* About Application & Developer Info */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">About Expense Tracker</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
              <User className="w-4 h-4 text-emerald-500" />
              <span>Developer Information</span>
            </div>
            <div className="space-y-1 text-slate-600 dark:text-slate-300">
              <p><span className="font-bold text-slate-800 dark:text-slate-100">Lead Developer:</span> Muhammad Hassan</p>
              <p><span className="font-bold text-slate-800 dark:text-slate-100">Role:</span> Full-Stack Developer & UI Architect</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
              <Code className="w-4 h-4 text-emerald-500" />
              <span>Application Details</span>
            </div>
            <div className="space-y-1 text-slate-600 dark:text-slate-300">
              <p><span className="font-bold text-slate-800 dark:text-slate-100">Application Name:</span> Expense Tracker</p>
              <p><span className="font-bold text-slate-800 dark:text-slate-100">Version:</span> 1.0.0</p>
              <p><span className="font-bold text-slate-800 dark:text-slate-100">Technology:</span> React 18, TypeScript, Tailwind CSS</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            <strong className="text-slate-800 dark:text-slate-100">Expense Tracker v1.0.0</strong> is an offline-first personal finance application designed for precision expense tracking, multi-currency conversions, category budget limits, financial savings goals, and recurring subscription management. All data is kept securely in your local environment.
          </p>
        </div>
      </div>
    </div>
  );
};
