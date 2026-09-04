import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { PwaInstallModal } from './components/common/PwaInstallModal';
import { DashboardModule } from './components/dashboard/DashboardModule';
import { InventoryModule } from './components/inventory/InventoryModule';
import { FasetLabModule } from './components/faset/FasetLabModule';
import { SalesModule } from './components/sales/SalesModule';
import { AccountingModule } from './components/accounting/AccountingModule';
import { AttendanceModule } from './components/attendance/AttendanceModule';
import { PayrollModule } from './components/payroll/PayrollModule';
import { AiEvaluationModule } from './components/ai/AiEvaluationModule';
import { SettingsModule } from './components/settings/SettingsModule';
import { LoginModule } from './components/auth/LoginModule';
import {
  LayoutDashboard,
  Glasses,
  Wrench,
  ShoppingBag,
  Wallet,
  Clock,
  DollarSign,
  Sparkles,
  Settings,
  HelpCircle,
  Eye
} from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const { currentRole, store, isPwaModalOpen, setIsPwaModalOpen, isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return (
      <>
        <LoginModule />
        <ToastContainer />
        <PwaInstallModal isOpen={isPwaModalOpen} onClose={() => setIsPwaModalOpen(false)} />
      </>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'faset', label: 'Lab Faset', icon: Wrench, badge: 'Optik' },
    { id: 'inventory', label: 'Stok & HPP', icon: Glasses },
    { id: 'sales', label: 'Penjualan Live', icon: ShoppingBag },
    { id: 'accounting', label: 'Kas & Escrow', icon: Wallet },
    { id: 'attendance', label: 'Presensi', icon: Clock },
    { id: 'payroll', label: 'Payroll & Komisi', icon: DollarSign },
    { id: 'ai', label: 'AI Evaluasi', icon: Sparkles },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Role Banner / Context Notification */}
      <div className="bg-sky-500/10 border-b border-sky-500/20 px-4 py-2 text-xs flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <span className="font-bold text-sky-600 dark:text-sky-400 capitalize">
              Role Aktif: {currentRole === 'faset' ? 'Teknisi Lab Faset' : currentRole.toUpperCase()}
            </span>
            <span>•</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
              {currentRole === 'owner' && 'Akses penuh ke seluruh modul laporan omzet, laba bersih & evaluasi'}
              {currentRole === 'host' && 'Fokus pada pencatatan penjualan sesi live dan kalkulasi komisi kacamata'}
              {currentRole === 'admin' && 'Fokus pada pemrosesan invoice order marketplace dan presensi shift'}
              {currentRole === 'faset' && 'Fokus pada pengerjaan resep lensa kacamata, fitting & QC lensometer'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Offline-First Ready
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-8">
        {activeTab === 'dashboard' && <DashboardModule onNavigate={setActiveTab} />}
        {activeTab === 'faset' && <FasetLabModule />}
        {activeTab === 'inventory' && <InventoryModule />}
        {activeTab === 'sales' && <SalesModule />}
        {activeTab === 'accounting' && <AccountingModule />}
        {activeTab === 'attendance' && <AttendanceModule />}
        {activeTab === 'payroll' && <PayrollModule />}
        {activeTab === 'ai' && <AiEvaluationModule />}
        {activeTab === 'settings' && <SettingsModule />}
      </main>

      {/* Bottom Navigation for Mobile Devices */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative ${
                isActive
                  ? 'text-sky-600 dark:text-sky-400 font-bold'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-tight">{item.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-sky-500 absolute -bottom-0.5" />
              )}
            </button>
          );
        })}
        {/* More Tab Trigger */}
        <button
          onClick={() => setActiveTab(activeTab === 'settings' ? 'ai' : 'settings')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'settings' || activeTab === 'payroll' || activeTab === 'ai' || activeTab === 'attendance'
              ? 'text-sky-600 dark:text-sky-400 font-bold'
              : 'text-slate-400'
          }`}
        >
          <Settings className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">Lainnya</span>
        </button>
      </div>

      {/* Global Modals & Toast notifications */}
      <ToastContainer />
      <PwaInstallModal isOpen={isPwaModalOpen} onClose={() => setIsPwaModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
