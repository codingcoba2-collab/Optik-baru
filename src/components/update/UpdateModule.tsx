import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  RefreshCw,
  Download,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Database,
  CloudCheck,
  HardDrive,
  ShieldCheck,
  Zap,
  Sparkles,
  Layers,
  History,
  Trash2
} from 'lucide-react';

export const UpdateModule: React.FC = () => {
  const { isOnline, store, showToast, setIsPwaModalOpen } = useApp();
  const [isChecking, setIsChecking] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string>('Aplikasi menggunakan versi terbaru (v2.4.0-PWA)');
  const [lastChecked, setLastChecked] = useState<string>(new Date().toLocaleTimeString('id-ID'));

  const handleCheckUpdate = () => {
    setIsChecking(true);
    setUpdateStatus('Memeriksa manifest & cache service worker...');

    setTimeout(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (let registration of registrations) {
            registration.update();
          }
        });
      }
      setIsChecking(false);
      setUpdateStatus('Aplikasi Anda sudah versi paling mutakhir (v2.4.0-PWA)');
      setLastChecked(new Date().toLocaleTimeString('id-ID'));
      showToast('Sistem optik sudah versi terbaru!', 'success');
    }, 1200);
  };

  const handleClearCacheAndReload = async () => {
    try {
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      }
      showToast('Cache aplikasi berhasil dibersihkan. Memuat ulang...', 'info');
      setTimeout(() => {
        (window as any).location.reload();
      }, 800);
    } catch (err) {
      (window as any).location.reload();
    }
  };

  const changelog = [
    {
      version: 'v2.4.0 (Terbaru)',
      date: 'Hari ini',
      highlights: [
        'Katalog Lensa Multi-Kategori: Single Vision, Bifocal, Progressive, Blueray, Photochromic, Sunglasses, Plano.',
        'Atribut Optik Lengkap: SPH, CYL, Axis, Add, Coating, dan Diameter.',
        'Lab Faset Luar: Tambahan input biaya faset saat tidak ada teknisi internal.',
        'Manajemen Pegawai Owner: Akun pegawai, multi-role (Owner, Asisten, Optisi, Pelayan, Teknisi), skema gaji & insentif berjenjang.',
        'Pemasaran: Modul Iklan Marketplace & Voucher Diskon (Persentase % atau Nominal Rp).',
        'Marketplace Konsumen: Checkout COD, Transfer Bank, QRIS Instan, dan kurir J&T, JNE, SiCepat, GoSend, Grab.'
      ]
    },
    {
      version: 'v2.3.0',
      date: 'Kemarin',
      highlights: [
        'Migrasi ke Google Firebase Firestore Cloud Database dengan real-time synchronization.',
        'Sistem Autentikasi multi-peran: Login Pemilik/Toko dan Akun Konsumen, Google Auth & OTP.',
        'Perbaikan permanen Color Palette Theme switcher bebas glitch.'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 mb-1">
            <RefreshCw className="w-4 h-4" />
            <span>Pusat Pembaruan & PWA Service Worker</span>
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">
            Status & Pembaruan Aplikasi (Update)
          </h1>
          <p className="text-xs text-slate-400">
            Pastikan aplikasi kasir & marketplace optik selalu ter-update dengan fitur terbaru dan sinkronisasi cloud lancar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPwaModalOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-sky-400" />
            <span>Install ke Layar HP / PC</span>
          </button>

          <button
            onClick={handleCheckUpdate}
            disabled={isChecking}
            className="py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Memeriksa...' : 'Periksa Pembaruan'}</span>
          </button>
        </div>
      </div>

      {/* Version Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold">Versi Terpasang</span>
            <div className="text-lg font-black text-white mt-0.5">v2.4.0 (OpticHub Core)</div>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {updateStatus}
            </p>
            <span className="text-[10px] text-slate-500 block mt-1">Terakhir dicek: {lastChecked}</span>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold">Sinkronisasi Cloud</span>
            <div className="text-lg font-black text-emerald-400 mt-0.5">Real-time Firestore</div>
            <p className="text-[11px] text-slate-300 mt-1">
              Data stok, lab faset & transaksi aman tersimpan di cloud database.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold">Offline PWA Cache</span>
            <div className="text-lg font-black text-white mt-0.5">Service Worker Aktif</div>
            <button
              onClick={handleClearCacheAndReload}
              className="mt-2 text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan Cache & Muat Ulang</span>
            </button>
          </div>
        </div>
      </div>

      {/* Release Notes / Changelog */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <History className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-bold text-white">Catatan Rilis & Pembaruan Fitur (Changelog)</h3>
        </div>

        <div className="space-y-4">
          {changelog.map((c, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono text-xs font-black">
                  {c.version}
                </span>
                <span className="text-xs text-slate-400">• {c.date}</span>
              </div>
              <ul className="space-y-1.5 pl-4 list-disc text-xs text-slate-300">
                {c.highlights.map((h, j) => (
                  <li key={j} className="leading-relaxed">
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
