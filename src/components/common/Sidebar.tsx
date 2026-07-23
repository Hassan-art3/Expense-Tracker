import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ViewType } from '../../types';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Target,
  BarChart3,
  Calendar,
  Repeat,
  Coins,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
  Sparkles,
} from 'lucide-react';

interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
}

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    expenses,
    goals,
    subscriptions,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt, badge: expenses.length },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'goals', label: 'Financial Goals', icon: Target, badge: goals.length },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'calendar', label: 'Calendar View', icon: Calendar },
    { id: 'subscriptions', label: 'Subscriptions', icon: Repeat, badge: subscriptions.filter(s => s.active).length },
    { id: 'currencies', label: 'Currencies', icon: Coins },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Menu Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 bg-white dark:bg-slate-900 z-50 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-4 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Expense Tracker</h3>
                <p className="text-[10px] text-slate-400">Mobile Navigation</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-auto px-2 py-0.5 text-[10px] rounded-full font-mono bg-slate-200 dark:bg-slate-800 text-slate-500">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Offline Local Vault</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20">v1.0.0</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Developer: <strong className="text-slate-700 dark:text-slate-200">Muhammad Hassan</strong>
          </p>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex relative border-r border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md flex-col justify-between transition-all duration-300 ease-in-out select-none z-20 ${
          collapsed ? 'w-16' : 'w-56'
        }`}
      >
        {/* Top Navigation Group */}
        <div className="p-3 space-y-1">
          <div className="px-2 py-1.5 flex items-center justify-between text-slate-400 dark:text-slate-500 text-[10px] font-semibold tracking-wider uppercase">
            {!collapsed && <span>Main Navigation</span>}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors ml-auto"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          <nav className="space-y-1 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group relative ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800/60'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />

                  {!collapsed && <span className="truncate">{item.label}</span>}

                  {!collapsed && item.badge !== undefined && (
                    <span
                      className={`ml-auto px-2 py-0.5 text-[10px] rounded-full font-mono font-medium ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                          : 'bg-slate-200/70 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Footer Info */}
        {!collapsed && (
          <div className="p-3 m-3 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-teal-500/10 border border-emerald-500/20 text-xs space-y-2">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Expense Tracker</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                v1.0.0
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <p>
                Developed by <strong className="text-slate-700 dark:text-slate-200">Muhammad Hassan</strong>
              </p>
              <p className="text-[10px] text-slate-400">100% Offline & Private Local Vault</p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
