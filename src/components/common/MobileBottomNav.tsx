import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  BarChart3,
  Menu,
  Plus,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const {
    activeView,
    setActiveView,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    openExpenseModal,
    expenses,
  } = useApp();

  interface NavItem {
    id: 'dashboard' | 'expenses' | 'budgets' | 'analytics';
    label: string;
    icon: React.ForwardRefExoticComponent<any>;
    badge?: number;
  }

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt, badge: expenses.length },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-1.5 flex justify-around items-center select-none shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id && !isMobileMenuOpen;

        return (
          <button
            key={item.id}
            onClick={() => {
              setIsMobileMenuOpen(false);
              setActiveView(item.id);
            }}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
              isActive
                ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1 -right-2 bg-emerald-500 text-white text-[9px] font-bold font-mono px-1.5 py-0.2 rounded-full min-w-[14px] text-center">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
          </button>
        );
      })}

      {/* Center Quick Add Button */}
      <button
        onClick={() => openExpenseModal()}
        className="flex flex-col items-center justify-center p-2 rounded-2xl bg-emerald-600 active:scale-95 text-white shadow-md shadow-emerald-500/20 -mt-3 border-2 border-white dark:border-slate-900"
        title="Add Expense"
      >
        <Plus className="w-5 h-5" />
      </button>

      {/* Menu / More Drawer Trigger */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
          isMobileMenuOpen
            ? 'text-emerald-600 dark:text-emerald-400 font-bold'
            : 'text-slate-500 dark:text-slate-400 font-medium'
        }`}
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 tracking-tight">Menu</span>
      </button>
    </div>
  );
};
