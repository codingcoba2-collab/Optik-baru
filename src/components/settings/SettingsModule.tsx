import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ThemePalette } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { CommaNumberInput } from '../common/CommaNumberInput';
import {
  Settings,
  Store,
  Palette,
  Download,
  RotateCcw,
  Smartphone,
  Check,
  LogOut,
  User,
  ShieldCheck,
  CreditCard,
  Building2,
} from 'lucide-react';

export const SettingsModule: React.FC = () => {
  const {
    store,
    updateStore,
    allStores,
    switchStore,
    currentUser,
    currentRole,
    logout,
    theme,
    setTheme,
    isDark,
    setIsDark,
    openPwaModal,
    showToast,
    resetDataToDefault,
  } = useApp();

  // Store form state
  const [storeName, setStoreName] = useState(store.name);
  const [tagline, setTagline] = useState(store.tagline);
  const [address, setAddress] = useState(store.address);
  const [phone, setPhone] = useState(store.phone);
  const [monthlyTarget, setMonthlyTarget] = useState(store.monthlyTargetOmzet);
  const [adminFeePercent, setAdminFeePercent] = useState(store.marketplaceAdminFeePercent);
  const [serviceFee, setServiceFee] = useState(store.serviceFeePerOrder);

  // Rekening Bank Seller
  const [bankName, setBankName] = useState(store.bankName || 'BCA');
  const [bankAccountNumber, setBankAccountNumber] = useState(store.bankAccountNumber || '');
  const [bankAccountHolder, setBankAccountHolder] = useState(store.bankAccountHolder || '');

  const palettes: { name: ThemePalette; label: string; colorClass: string }[] = [
    { name: 'Electric Ocean', label: 'Electric Ocean', colorClass: 'bg-sky-500' },
    { name: 'Neon Cyber', label: 'Neon Cyber', colorClass: 'bg-indigo-600' },
    { name: 'Emerald Mint', label: 'Emerald Mint', colorClass: 'bg-emerald-500' },
    { name: 'Sunset Coral', label: 'Sunset Coral', colorClass: 'bg-rose-500' },
    { name: 'Royal Violet', label: 'Royal Violet', colorClass: 'bg-purple-600' },
    { name: 'Minimalist Studio', label: 'Studio Neutral', colorClass: 'bg-slate-600' },
  ];

  const handleSaveStore = (e: React.FormEvent) => {
    e.preventDefault();
    updateStore({
      name: storeName,
      tagline,
      address,
      phone,
      monthlyTargetOmzet: monthlyTarget,
      marketplaceAdminFeePercent: adminFeePercent,
      serviceFeePerOrder: serviceFee,
      bankName,
      bankAccountNumber,
      bankAccountHolder,
    });
    showToast('Pengaturan toko & nomor rekening seller berhasil disimpan', 'success');
  };

  const handleExportJson = () => {
    const backup = {
      store,
      exportedAt: new Date().toISOString(),
      version: '1.0-eyehub-optik',
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eyehub-backup-${store.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data toko berhasil diekspor ke JSON', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
          <Settings className="w-4 h-4" />
          Konfigurasi Sistem, Cabang & Integrasi Marketplace
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          Pengaturan Toko Optik & Preferensi
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Kelola profil cabang optik, skema potongan marketplace, tema visual dan data backup
        </p>
      </div>

      {/* Multi-Branch Switching Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Store className="w-4 h-4 text-sky-500" />
          Multi-Cabang Toko Optik Aktif
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Pilih toko optik atau akun marketplace aktif yang sedang dikelola:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allStores.map((s) => (
            <div
              key={s.id}
              onClick={() => switchStore(s.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                s.id === store.id
                  ? 'bg-sky-50 dark:bg-sky-950/30 border-sky-500 text-sky-900 dark:text-sky-200'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-400 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div>
                <div className="font-bold text-xs">{s.name}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{s.tagline}</div>
                <div className="text-[10px] text-slate-400 mt-1">{s.address}</div>
              </div>
              {s.id === store.id && (
                <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Store Profile & Marketplace Fee Form */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4 text-purple-500" />
          Informasi Cabang & Aturan Marketplace Fee
        </h3>

        <form onSubmit={handleSaveStore} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Toko / Akun Marketplace
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Slogan / Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alamat Fisik / Lokasi Studio Live
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                No Kontak WhatsApp Toko
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Target & MP Fees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Omzet Bulanan (Rp)
              </label>
              <CommaNumberInput value={monthlyTarget} onChange={setMonthlyTarget} />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Admin Marketplace Fee (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={adminFeePercent}
                  onChange={(e) => setAdminFeePercent(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
              </div>
              <span className="text-[10px] text-slate-400">Eye Hub Marketplace fee standard 5.0%</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Biaya Layanan per Transaksi (Rp)
              </label>
              <CommaNumberInput value={serviceFee} onChange={setServiceFee} />
              <span className="text-[10px] text-slate-400">Misal biaya penanganan order Rp 1.000</span>
            </div>
          </div>

          {/* Rekening Bank Penampung Penjualan Seller */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-sky-500" />
                <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  Nomor Rekening Bank Seller (Penampung Dana Hasil Penjualan)
                </h4>
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                Khusus Eye Hub
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Rekening ini digunakan untuk pencairan dana dari transaksi pesanan pelanggan di Eye Hub Marketplace.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Bank
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                >
                  <option value="BCA">Bank BCA</option>
                  <option value="Mandiri">Bank Mandiri</option>
                  <option value="BRI">Bank BRI</option>
                  <option value="BNI">Bank BNI</option>
                  <option value="BSI">Bank Syariah Indonesia (BSI)</option>
                  <option value="CIMB Niaga">Bank CIMB Niaga</option>
                  <option value="Bank Jago">Bank Jago</option>
                  <option value="Permata">Bank Permata</option>
                  <option value="Other">Bank Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor Rekening
                </label>
                <input
                  type="text"
                  required
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  placeholder="Contoh: 8820192831"
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Atas Nama (A.N. Pemilik Rekening)
                </label>
                <input
                  type="text"
                  required
                  value={bankAccountHolder}
                  onChange={(e) => setBankAccountHolder(e.target.value)}
                  placeholder="Contoh: Optik Sejahtera Mandiri"
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                />
              </div>
            </div>

            {bankAccountNumber && (
              <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Preview Transfer Seller:
                  </span>
                  <span className="font-mono font-bold text-sky-700 dark:text-sky-300">
                    {bankName} - {bankAccountNumber}
                  </span>
                  <span className="text-slate-500">
                    (a.n. {bankAccountHolder || '-'})
                  </span>
                </div>
                <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold">Siap Menerima Payout</span>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-md shadow-purple-600/20 cursor-pointer"
            >
              Simpan Perubahan Toko
            </button>
          </div>
        </form>
      </div>

      {/* Visual Customization & PWA App Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Visual Palette */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="w-4 h-4 text-emerald-500" />
            Tema Warna Visual & Mode Gelap
          </h3>

          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-600 dark:text-slate-300">Tampilan Dark Mode</span>
            <button
              onClick={() => setIsDark(!isDark)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                isDark
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
              }`}
            >
              {isDark ? 'Aktif (Dark)' : 'Non-aktif (Light)'}
            </button>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
              Palet Aksen Warna (6 Pilihan):
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {palettes.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setTheme(p.name)}
                  className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                    theme === p.name
                      ? 'border-sky-500 bg-sky-50/50 dark:bg-slate-800'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full ${p.colorClass}`} />
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sesi Pengguna & Keamanan */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-sky-500" />
            Sesi Login & Keamanan Akun
          </h3>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-sm">
                {((currentUser?.name || currentUser?.fullName || currentUser?.username || 'U').charAt(0) || 'U').toUpperCase()}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{currentUser?.name || currentUser?.fullName || currentUser?.username || 'Pengguna'}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase">
                    {currentRole}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  No. HP: {currentUser?.phone || '-'} • Cabang: {store.name}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 font-bold text-xs transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar Sesi</span>
            </button>
          </div>
        </div>

        {/* PWA & Data Management */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-sky-500" />
            Instalasi Aplikasi PWA & Backup Data
          </h3>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Aplikasi Web Progresif (PWA)</div>
              <div className="text-[11px] text-slate-500">Pasang di Layar Utama HP / Tablet / PC</div>
            </div>
            <button
              onClick={openPwaModal}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer"
            >
              Petunjuk Pasang
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Ekspor JSON Backup
            </button>

            <button
              onClick={resetDataToDefault}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-semibold text-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Data Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
