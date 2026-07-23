import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { CommandPalette } from './components/common/CommandPalette';
import { ToastContainer } from './components/common/ToastContainer';
import { PinLockModal } from './components/common/PinLockModal';
import { ExpenseModal } from './components/expenses/ExpenseModal';

import { DashboardView } from './components/dashboard/DashboardView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { BudgetsView } from './components/budgets/BudgetsView';
import { GoalsView } from './components/goals/GoalsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { CalendarView } from './components/calendar/CalendarView';
import { SubscriptionsView } from './components/subscriptions/SubscriptionsView';
import { CurrenciesView } from './components/currencies/CurrenciesView';
import { SettingsView } from './components/settings/SettingsView';

const MainLayout: React.FC = () => {
  const { activeView } = useApp();

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'expenses':
        return <ExpensesView />;
      case 'budgets':
        return <BudgetsView />;
      case 'goals':
        return <GoalsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'calendar':
        return <CalendarView />;
      case 'subscriptions':
        return <SubscriptionsView />;
      case 'currencies':
        return <CurrenciesView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      <Header />

      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar />

        <main className="flex-1 overflow-y-auto bg-slate-100/60 dark:bg-slate-950/60">
          {renderView()}
        </main>
      </div>

      <CommandPalette />
      <ToastContainer />
      <PinLockModal />
      <ExpenseModal />
      <MobileBottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
