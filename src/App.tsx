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
import { EducationModule } from './components/education/EducationModule';
import { ConsumerPortal } from './components/consumer/ConsumerPortal';
import { SellerOrderManagementModule } from './components/orders/SellerOrderManagementModule';
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
  ShoppingCart,
  BookOpen,
  LogIn,
  Sun,
  Moon,
  Compass
} from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    currentRole,
    store,
    isPwaModalOpen,
    setIsPwaModalOpen,
    isAuthenticated,
    userProfile,
    isDark,
    setIsDark
  } = useApp();
  const isConsumer = userProfile?.role === 'consumer' || userProfile?.userType === 'consumer';
  const [activeTab, setActiveTab] = useState<string>(
    isConsumer ? 'marketplace' : 'dashboard'
  );
  // State for toggling login view on initial unauthenticated screen (default true for immediate login/register)
  const [showLoginModal, setShowLoginModal] = useState<boolean>(true);

  // Synchronize default tab on role or userProfile change
  useEffect(() => {
    if (isConsumer && activeTab === 'dashboard') {
      setActiveTab('marketplace');
    }
  }, [isConsumer]);

  // If user is not logged in: Initial screen is Eye Health & Lens Education with Top Login Menu
  if (!isAuthenticated) {
    if (showLoginModal) {
      return (
        <ErrorBoundary fallbackTitle="Kendala Memuat Halaman Login">
          <LoginModule onBackToEducation={() => setShowLoginModal(false)} />
          <ToastContainer />
          <PwaInstallModal isOpen={isPwaModalOpen} onClose={() => setIsPwaModalOpen(false)} />
        </ErrorBoundary>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
        {/* Top Navbar on Initial Landing / Education Screen with Prominent Login Menu */}
        <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 sm:px-10 lg:px-12 py-5 pt-8 sm:pt-9 transition-colors">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Logo & Brand Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/25 shrink-0">
                <Glasses className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5">
                  <span className="text-slate-900 dark:text-white">eye</span>
                  <span className="text-sky-500">hub</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                    Optik & Edukasi
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                  Pusat Informasi Kesehatan Mata, Panduan Lensa & Marketplace
                </p>
              </div>
            </div>

            {/* Top Navigation & Login Action */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick Jump Buttons (Desktop) */}
              <button
                onClick={() => {
                  const el = document.getElementById('lens-catalog-guide');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-sky-500" />
                <span>Katalog Lensa</span>
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('lens-quiz-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Kuis Lensa</span>
              </button>

              {/* Theme Dark / Light Toggle */}
              <button
                onClick={() => setIsDark(!isDark)}
                title={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-500" />}
              </button>

              {/* Top Login Menu Button (Owner, Optisi, Kasir & Konsumen) */}
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/30 flex items-center gap-2 cursor-pointer transition-all hover:shadow-lg"
              >
                <LogIn className="w-4 h-4" />
                <span>Menu Login</span>
              </button>
            </div>
          </div>
        </header>

        {/* Initial Screen Content: Education Module */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-16">
          <EducationModule onOpenLogin={() => setShowLoginModal(true)} />
        </main>

        <ToastContainer />
        <PwaInstallModal isOpen={isPwaModalOpen} onClose={() => setIsPwaModalOpen(false)} />
      </div>
    );
  }

  // If user is Consumer: Render ConsumerPortal directly with strict separation from seller controls
  if (isConsumer) {
    return (
      <ErrorBoundary fallbackTitle="Kendala Memuat Halaman Konsumen">
        <ConsumerPortal />
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

  // Navigation Items for Seller / Store Operator
  const sellerNavItems: NavigationTabItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Pesanan Masuk', icon: ShoppingBag, badge: 'Order' },
    { id: 'inventory', label: 'Stok Lensa & Frame', icon: Glasses },
    { id: 'faset', label: 'Lab Faset', icon: Wrench, badge: 'Optik' },
    { id: 'employee', label: 'Pegawai & Gaji', icon: Users, badge: 'Owner' },
    { id: 'ads', label: 'Iklan & Diskon', icon: Megaphone },
    { id: 'sales', label: 'Kasir & Live', icon: ShoppingCart },
    { id: 'accounting', label: 'Keuangan & Kas', icon: Wallet },
    { id: 'payroll', label: 'Payroll & Insentif', icon: DollarSign },
    { id: 'attendance', label: 'Presensi', icon: Clock },
    { id: 'ai', label: 'AI Evaluasi', icon: Sparkles },
    { id: 'education', label: 'Kamus Lensa', icon: BookOpen },
    { id: 'update', label: 'Update PWA', icon: RefreshCw, badge: 'New' },
    { id: 'settings', label: 'Pengaturan & Tema', icon: Settings },
  ];

  const consumerNavItems: NavigationTabItem[] = [
    { id: 'education', label: 'Edukasi Lensa & Mata', icon: BookOpen, badge: 'Panduan' },
    { id: 'marketplace', label: 'Katalog Belanja', icon: ShoppingBag, badge: 'Eye Hub' },
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
      <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top,14px))] sm:top-16 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-2.5 pr-6 sm:pr-2 no-scrollbar scroll-smooth">
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
              Sistem operasional toko optik lengkap: Kelola Pesanan Masuk, Pengantaran Kurir Toko, Lab Faset, Stok Multi-Lensa & Keuangan
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
          {activeTab === 'orders' && <SellerOrderManagementModule />}
          {activeTab === 'education' && <EducationModule onOpenLogin={() => {}} />}
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
