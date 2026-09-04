import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { PwaInstallModal } from './components/common/PwaInstallModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
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
import { EmployeeModule } from './components/employee/EmployeeModule';
import { AdsDiscountModule } from './components/ads/AdsDiscountModule';
import { MarketplaceModule } from './components/marketplace/MarketplaceModule';
import { UpdateModule } from './components/update/UpdateModule';
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
  Users,
  Megaphone,
  RefreshCw,
  Store,
  ShoppingCart
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentRole, store, isPwaModalOpen, setIsPwaModalOpen, isAuthenticated, userProfile } = useApp();
  const isConsumer = userProfile?.role === 'consumer' || userProfile?.userType === 'consumer';
  const [activeTab, setActiveTab] = useState<string>(
    isConsumer ? 'marketplace' : 'dashboard'
  );

  // Synchronize default tab on role or userProfile change
  useEffect(() => {
    if (isConsumer && activeTab === 'dashboard') {
      setActiveTab('marketplace');
    }
  }, [isConsumer]);

  if (!isAuthenticated) {
    return (
      <ErrorBoundary fallbackTitle="Kendala Memuat Halaman Login">
        <LoginModule />
        <ToastContainer />
        <PwaInstallModal isOpen={isPwaModalOpen} onClose={() => setIsPwaModalOpen(false)} />
      </ErrorBoundary>
    );
  }

  interface NavigationTabItem {
    id: string;
    label: string;
    icon: any;
    badge?: string;
  }

  // Navigation Items
  const sellerNavItems: NavigationTabItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, badge: 'Shopee/Tokopedia' },
    { id: 'inventory', label: 'Stok Lensa & Frame', icon: Glasses },
    { id: 'faset', label: 'Lab Faset', icon: Wrench, badge: 'Optik' },
    { id: 'employee', label: 'Pegawai & Gaji', icon: Users, badge: 'Owner' },
    { id: 'ads', label: 'Iklan & Diskon', icon: Megaphone },
    { id: 'sales', label: 'Kasir & Live', icon: ShoppingCart },
    { id: 'accounting', label: 'Keuangan & Kas', icon: Wallet },
    { id: 'payroll', label: 'Payroll & Insentif', icon: DollarSign },
    { id: 'attendance', label: 'Presensi', icon: Clock },
    { id: 'ai', label: 'AI Evaluasi', icon: Sparkles },
    { id: 'update', label: 'Update PWA', icon: RefreshCw, badge: 'New' },
    { id: 'settings', label: 'Pengaturan & Tema', icon: Settings },
  ];

  const consumerNavItems: NavigationTabItem[] = [
    { id: 'marketplace', label: 'Katalog Belanja', icon: ShoppingBag },
    { id: 'inventory', label: 'Katalog Lensa & Frame', icon: Glasses },
    { id: 'update', label: 'Update Aplikasi', icon: RefreshCw },
    { id: 'settings', label: 'Pengaturan & Tema', icon: Settings },
  ];

  const navItems = isConsumer ? consumerNavItems : sellerNavItems;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Main Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Primary Navigation Bar (Responsive Sub-Header) */}
      <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top,14px))] sm:top-16 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-2 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto py-2 pr-6 sm:pr-2 no-scrollbar scroll-smooth">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-sky-500/10 text-sky-500 border border-sky-500/20'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Role / Context Notification Ribbon */}
      <div className="bg-sky-500/10 border-b border-sky-500/20 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <span className="font-bold text-sky-600 dark:text-sky-400">
              {isConsumer ? '👤 Akun Konsumen' : `🏪 Toko Optik: ${store?.name || 'Optik'}`}
            </span>
            <span>•</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
              {isConsumer
                ? 'Pesan kacamata langsung dengan sistem COD, Transfer, QRIS dan pengiriman J&T, JNE, SiCepat, GoSend, Grab'
                : 'Sistem operasional toko optik lengkap: Manajemen Pegawai, Stok Multi-Lensa, Lab Faset, Iklan & Diskon'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('update')}
              className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold hover:bg-emerald-500/20 transition-colors cursor-pointer"
            >
              ● v2.4.0 PWA Ready
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Modules */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-8">
        <ErrorBoundary fallbackTitle="Terjadi Kendala Memuat Modul" onReset={() => setActiveTab(isConsumer ? 'marketplace' : 'dashboard')}>
          {activeTab === 'dashboard' && <DashboardModule onNavigate={setActiveTab} />}
          {activeTab === 'marketplace' && <MarketplaceModule />}
          {activeTab === 'inventory' && <InventoryModule />}
          {activeTab === 'faset' && <FasetLabModule />}
          {activeTab === 'employee' && <EmployeeModule />}
          {activeTab === 'ads' && <AdsDiscountModule />}
          {activeTab === 'sales' && <SalesModule />}
          {activeTab === 'accounting' && <AccountingModule />}
          {activeTab === 'attendance' && <AttendanceModule />}
          {activeTab === 'payroll' && <PayrollModule />}
          {activeTab === 'ai' && <AiEvaluationModule />}
          {activeTab === 'update' && <UpdateModule />}
          {activeTab === 'settings' && <SettingsModule />}
        </ErrorBoundary>
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
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative cursor-pointer ${
                isActive
                  ? 'text-sky-600 dark:text-sky-400 font-bold'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-tight truncate max-w-[65px]">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 absolute -bottom-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Global Modals & Toast Notifications */}
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
