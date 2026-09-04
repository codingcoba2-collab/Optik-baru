import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Role, ThemePalette } from '../../types';
import {
  Glasses,
  Store,
  Sun,
  Moon,
  Palette,
  Smartphone,
  ChevronDown,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Radio,
  ClipboardList,
  Wrench,
  LogOut
} from 'lucide-react';
import { PwaInstallModal } from './PwaInstallModal';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const {
    store,
    allStores,
    switchStore,
    currentUser,
    currentRole,
    setCurrentRole,
    employees,
    switchUser,
    logout,
    theme,
    setTheme,
    isDark,
    setIsDark,
    resetDataToDefault,
  } = useApp();

  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  const displayName = currentUser?.name || currentUser?.fullName || currentUser?.username || 'Pengguna';
  const displayInitial = (displayName.charAt(0) || 'P').toUpperCase();
  const userRoles = Array.isArray(currentUser?.roles) && currentUser.roles.length > 0
    ? currentUser.roles
    : (currentUser?.role ? [currentUser.role] : [currentRole]);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const themeList: { name: ThemePalette; color: string; label: string }[] = [
    { name: 'Electric Ocean', color: 'bg-sky-500', label: 'Electric Ocean (Cyan/Sky)' },
    { name: 'Neon Cyber', color: 'bg-emerald-500', label: 'Neon Cyber (Cyber Lime)' },
    { name: 'Emerald Mint', color: 'bg-teal-500', label: 'Emerald Mint (Deep Teal)' },
    { name: 'Royal Violet', color: 'bg-purple-500', label: 'Royal Violet (Luxury Purple)' },
    { name: 'Sunset Coral', color: 'bg-rose-500', label: 'Sunset Coral (Warm Rose)' },
    { name: 'Minimalist Studio', color: 'bg-slate-500', label: 'Minimalist Studio (Monochrome)' },
  ];

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'owner':
        return <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />;
      case 'host':
        return <Radio className="w-3.5 h-3.5 text-rose-400" />;
      case 'admin':
        return <ClipboardList className="w-3.5 h-3.5 text-sky-400" />;
      case 'faset':
        return <Wrench className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case 'owner':
        return 'Owner Optik';
      case 'host':
        return 'Host Live Streaming';
      case 'admin':
        return 'Admin Toko & MP';
      case 'faset':
        return 'Teknisi Faset & RO';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3 shrink-0">
              <div
                onClick={() => setActiveTab('dashboard')}
                className="cursor-pointer flex items-center gap-2.5 group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
                  <Glasses className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                      eye <span className="text-sky-500">hub</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                      Optics
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block truncate max-w-[200px]">
                    {store.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Center Controls: Store Switcher & Role Badge */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Store Switcher Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsStoreOpen(!isStoreOpen)}
                  className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <Store className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  <span className="hidden md:inline max-w-[140px] truncate">{store.name}</span>
                  <span className="md:hidden">Toko</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isStoreOpen && (
                  <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50">
                    <div className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Daftar Toko Optik
                    </div>
                    {allStores.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          switchStore(s.id);
                          setIsStoreOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                          s.id === store.id
                            ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span className="truncate">{s.name}</span>
                        {s.id === store.id && <span className="text-[10px] text-sky-500 font-bold">Aktif</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User & Role Switcher */}
              <div className="relative">
                <button
                  onClick={() => setIsUserOpen(!isUserOpen)}
                  className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 text-white flex items-center justify-center text-[10px] font-black">
                    {displayInitial}
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="text-xs font-bold leading-none">{displayName}</div>
                    <div className="text-[10px] text-slate-400 leading-tight flex items-center gap-1 mt-0.5">
                      {getRoleIcon(currentRole)}
                      {getRoleLabel(currentRole)}
                    </div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isUserOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2.5 z-50">
                    <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Ganti Akun Karyawan
                    </div>
                    <div className="space-y-1 mb-3">
                      {employees.map((emp) => (
                        <button
                          key={emp.id}
                          onClick={() => {
                            if (switchUser) switchUser(emp.id);
                            setIsUserOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            emp.id === currentUser?.id
                              ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          <div>
                            <div className="font-semibold">{emp.name}</div>
                            <div className="text-[10px] text-slate-400">
                              Roles: {emp.roles.map((r) => getRoleLabel(r)).join(' • ')}
                            </div>
                          </div>
                          {emp.id === currentUser?.id && (
                            <span className="text-[10px] font-bold text-sky-500">Masuk</span>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Role Switcher for Current User if Multi-Role */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                      <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Mode Peran Aktif ({userRoles.length > 1 ? 'Rangkap Jabatan' : 'Single Role'})
                      </div>
                      <div className="grid grid-cols-2 gap-1 mt-1">
                        {userRoles.map((r) => (
                          <button
                            key={r}
                            onClick={() => {
                              setCurrentRole(r);
                              setIsUserOpen(false);
                            }}
                            className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
                              currentRole === r
                                ? 'bg-sky-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            {getRoleIcon(r)}
                            <span className="truncate">{getRoleLabel(r)}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Logout Button */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                      <button
                        onClick={() => {
                          logout();
                          setIsUserOpen(false);
                        }}
                        className="w-full px-3 py-2 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Keluar Sesi (Logout)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Tools: Palette, DarkMode, PWA, Reset, Logout */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Palette Theme Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsThemeOpen(!isThemeOpen)}
                  title="Pilih Palet Tema Toko"
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Palette className="w-4 h-4 text-sky-500" />
                </button>

                {isThemeOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50">
                    <div className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      6 Palet Warna Toko
                    </div>
                    {themeList.map((t) => (
                      <button
                        key={t.name}
                        onClick={() => {
                          setTheme(t.name);
                          setIsThemeOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2.5 transition-colors ${
                          theme === t.name
                            ? 'bg-slate-100 dark:bg-slate-700 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full ${t.color}`} />
                        <span className="truncate">{t.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dark / Light Toggle */}
              <button
                onClick={() => setIsDark(!isDark)}
                title={isDark ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-700" />
                )}
              </button>

              {/* PWA Install Button */}
              <button
                onClick={() => setIsPwaModalOpen(true)}
                title="Panduan Instal PWA"
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/20 transition-all"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>PWA</span>
              </button>

              {/* Reset Data Confirmation Button */}
              <button
                onClick={() => setIsResetConfirmOpen(true)}
                title="Reset Data Toko ke Default"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Keluar dari Sesi Sistem"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
              Reset Data Toko Optik?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
              Tindakan ini akan mengembalikan data katalog frame & lensa, antrean lab faset, penjualan, dan absensi ke sampel awal yang realistis.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-3 py-2 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  resetDataToDefault();
                  setIsResetConfirmOpen(false);
                }}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20"
              >
                Ya, Reset Sampel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PWA Install Modal */}
      <PwaInstallModal
        isOpen={isPwaModalOpen}
        onClose={() => setIsPwaModalOpen(false)}
      />
    </>
  );
};
