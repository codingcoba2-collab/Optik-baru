import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Role, Employee } from '../../types';
import {
  Glasses,
  ShieldCheck,
  Radio,
  ClipboardList,
  Wrench,
  Lock,
  User,
  Store,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Sun,
  Moon,
  KeyRound,
  CheckCircle2,
  Building2,
  Phone,
  Zap,
} from 'lucide-react';

export const LoginModule: React.FC = () => {
  const {
    employees,
    allStores,
    store,
    switchStore,
    login,
    loginWithCredentials,
    isDark,
    setIsDark,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'quick' | 'form'>('quick');
  const [selectedBranchId, setSelectedBranchId] = useState<string>(store.id);

  // Form State
  const [identifier, setIdentifier] = useState('budi@eyehub.id');
  const [passwordOrPin, setPasswordOrPin] = useState('1234');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'owner':
        return <ShieldCheck className="w-4 h-4 text-amber-500" />;
      case 'host':
        return <Radio className="w-4 h-4 text-rose-500" />;
      case 'admin':
        return <ClipboardList className="w-4 h-4 text-sky-500" />;
      case 'faset':
        return <Wrench className="w-4 h-4 text-emerald-500" />;
    }
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'owner':
        return {
          label: 'Owner Optik',
          bg: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
        };
      case 'host':
        return {
          label: 'Host Live Stream',
          bg: 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400',
        };
      case 'admin':
        return {
          label: 'Admin Toko & MP',
          bg: 'bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400',
        };
      case 'faset':
        return {
          label: 'Teknisi Lab Faset',
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
        };
    }
  };

  const getRoleDescription = (emp: Employee) => {
    if (emp.roles.includes('owner')) {
      return 'Akses penuh laporan omzet, laba bersih, payroll, kas fisik & pengaturan cabang optik.';
    }
    if (emp.roles.includes('host') && emp.roles.includes('admin')) {
      return 'Rangkap jabatan: Penjualan live TikTok/Shopee, order marketplace & komisi target.';
    }
    if (emp.roles.includes('faset')) {
      return 'Manajemen antrean lensa preskripsi OD/OS, potong faset, QC lensometer & insentif lab.';
    }
    if (emp.roles.includes('admin')) {
      return 'Pengelolaan stok frame & lensa, pesanan marketplace, invoice & presensi shift.';
    }
    return 'Penjualan sesi live streaming, katalog kacamata promo & pelacak komisi frame.';
  };

  const handleQuickLogin = (emp: Employee, roleChoice?: Role) => {
    setIsLoading(true);
    setErrorMessage(null);
    if (selectedBranchId !== store.id) {
      switchStore(selectedBranchId);
    }
    setTimeout(() => {
      login(emp.id, roleChoice || emp.roles[0]);
      setIsLoading(false);
    }, 300);
  };

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      const res = loginWithCredentials(identifier, passwordOrPin, selectedBranchId);
      if (!res.success) {
        setErrorMessage(res.message || 'Gagal login. Cek kembali kredensial Anda.');
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    }, 400);
  };

  const fillQuickFormCredentials = (email: string, pin: string) => {
    setIdentifier(email);
    setPasswordOrPin(pin);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between z-10 py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <Glasses className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              eye hub <span className="text-sky-400 font-semibold text-xs tracking-normal px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20">Optik & Live OS</span>
            </span>
          </div>
        </div>

        {/* Theme & Branch Indicator */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-sky-400" />
            <span className="truncate max-w-[200px]">{store.name}</span>
          </div>

          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Ganti Mode Tampilan"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
          </button>
        </div>
      </header>

      {/* Main Login Card Area */}
      <main className="max-w-5xl w-full mx-auto my-auto py-6 sm:py-10 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Brand Pitch & Highlights */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-slate-800/50 border border-slate-700/80 backdrop-blur-xl">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Portal Masuk Karyawan & Owner
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                Sistem Operasional Toko Optik Modern
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Kelola penjualan live stream, antrean lab faset lensa preskripsi OD/OS, inventaris frame kacamata, komisi payroll dan kas escrow marketplace dalam satu platform terpadu.
              </p>

              {/* Feature Points */}
              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-white block">Laboratorium Faset Optik Presisi</strong>
                    Detail resep SPH, CYL, AXIS, ADD, PD, dan verifikasi QC lensometer.
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Radio className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-white block">Kasir Live Streaming Multi-Channel</strong>
                    Dukungan sesi TikTok Live, Shopee Live, Tokopedia & Walk-in Store.
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-white block">Komisi Berjenjang & Insentif Lab</strong>
                    Bonus per-pasang lensa faset & komisi paket bundling resep kacamata.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
              <span>Cabang: {store.name}</span>
              <span className="text-emerald-400 font-mono">Offline-First • v2.4</span>
            </div>
          </div>

          {/* Right Column: Interactive Login Container */}
          <div className="lg:col-span-7 flex flex-col p-6 sm:p-8 rounded-3xl bg-slate-850/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl">
            {/* Header Tabs */}
            <div className="flex items-center justify-between border-b border-slate-700/70 pb-4 mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">Silakan Masuk ke Akun</h2>
                <p className="text-xs text-slate-400">Pilih mode login cepat demo atau masukkan kredensial</p>
              </div>

              {/* Mode Toggle Pills */}
              <div className="flex p-1 rounded-xl bg-slate-800 border border-slate-700">
                <button
                  type="button"
                  onClick={() => setActiveTab('quick')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'quick'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pilih Akun Demo
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'form'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Kredensial / PIN
                </button>
              </div>
            </div>

            {/* Branch Selector Dropdown */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-sky-400" />
                Pilih Cabang Toko Optik:
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => {
                  setSelectedBranchId(e.target.value);
                  switchStore(e.target.value);
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-semibold focus:outline-none focus:border-sky-500 transition-colors"
              >
                {allStores.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} — {st.address}
                  </option>
                ))}
              </select>
            </div>

            {/* Error banner if any */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <Lock className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* TAB 1: Quick Role Selection Cards */}
            {activeTab === 'quick' && (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                <div className="text-[11px] text-slate-400 mb-1">
                  Pilih salah satu peran pengguna di bawah untuk login instan:
                </div>

                {employees.map((emp) => {
                  const primaryRole = emp.roles[0];
                  const badge = getRoleBadge(primaryRole);

                  return (
                    <div
                      key={emp.id}
                      onClick={() => handleQuickLogin(emp)}
                      className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 hover:border-sky-500/60 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-700/80 group-hover:bg-sky-500/20 text-slate-300 group-hover:text-sky-400 flex items-center justify-center shrink-0 transition-colors mt-0.5">
                          {getRoleIcon(primaryRole)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-white group-hover:text-sky-300 transition-colors">
                              {emp.name}
                            </span>
                            {emp.roles.map((r) => {
                              const rBadge = getRoleBadge(r);
                              return (
                                <span
                                  key={r}
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${rBadge.bg}`}
                                >
                                  {rBadge.label}
                                </span>
                              );
                            })}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                            {getRoleDescription(emp)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-700">
                        <span className="text-[11px] font-semibold text-sky-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                          Masuk <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 2: Standard Credentials & PIN Form */}
            {activeTab === 'form' && (
              <form onSubmit={handleFormLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Email / No. WhatsApp / Username:
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="misal: budi@eyehub.id atau 0811-9988-112"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                    Password / PIN Keamanan:
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordOrPin}
                      onChange={(e) => setPasswordOrPin(e.target.value)}
                      placeholder="Masukkan PIN 4-6 digit"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-sky-500 focus:ring-0 cursor-pointer"
                    />
                    <span>Ingat sesi di perangkat ini</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => fillQuickFormCredentials('budi@eyehub.id', '1234')}
                    className="text-[11px] text-sky-400 hover:underline cursor-pointer"
                  >
                    Pakai Akun Demo Default
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Memverifikasi Akses...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Sistem eye hub</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Demo Credentials Quick Chips */}
                <div className="pt-2">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                    Contoh Kredensial Demo Cepat:
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => fillQuickFormCredentials('budi@eyehub.id', '1234')}
                      className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-left text-slate-300 hover:text-sky-400 hover:border-slate-600 transition-colors"
                    >
                      👑 Owner: <span className="font-mono text-slate-400">budi@eyehub.id</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fillQuickFormCredentials('citra@eyehub.id', '1234')}
                      className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-left text-slate-300 hover:text-sky-400 hover:border-slate-600 transition-colors"
                    >
                      🎙️ Host: <span className="font-mono text-slate-400">citra@eyehub.id</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fillQuickFormCredentials('dimas@eyehub.id', '1234')}
                      className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-left text-slate-300 hover:text-sky-400 hover:border-slate-600 transition-colors"
                    >
                      🔬 Faset: <span className="font-mono text-slate-400">dimas@eyehub.id</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fillQuickFormCredentials('kevin@eyehub.id', '1234')}
                      className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-left text-slate-300 hover:text-sky-400 hover:border-slate-600 transition-colors"
                    >
                      📦 Admin: <span className="font-mono text-slate-400">kevin@eyehub.id</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto py-3 text-center text-xs text-slate-500 z-10 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-800/80">
        <div>
          © 2026 eye hub Optical Studio & Live Commerce OS. Seluruh hak cipta dilindungi.
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span>Standar Refraksi Optisi (RO)</span>
          <span>•</span>
          <span>Enkripsi Sesi Lokal</span>
          <span>•</span>
          <span>PWA Ready</span>
        </div>
      </footer>
    </div>
  );
};
