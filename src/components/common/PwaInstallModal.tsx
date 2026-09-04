import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, CheckCircle, Smartphone, X, RefreshCw, Database, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({ isOpen, onClose }) => {
  const { appVersion, hasAppUpdate, checkAndApplyUpdate, isOnline } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'update'>('android');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Listen for Chrome/Android install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  const handleTriggerUpdate = async () => {
    setIsUpdating(true);
    try {
      await checkAndApplyUpdate();
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              Instalasi & Pembaruan Aplikasi
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Akses cepat layar penuh & tersinkronisasi Firebase
            </p>
          </div>
        </div>

        {/* System & Firebase Status Banner */}
        <div className="mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-sky-500" />
              Status Firebase Firestore:
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {isOnline ? 'Terhubung & Realtime' : 'Tersimpan Lokal (Offline)'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              Versi Terpasang:
            </span>
            <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
              v{appVersion} {hasAppUpdate && '• Ada Update'}
            </span>
          </div>
        </div>

        {isInstalled && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-2.5 text-xs">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span className="font-medium">Aplikasi eye hub sudah terpasang di perangkat ini.</span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 border-b-2 transition-colors ${
              activeTab === 'android'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Android
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 border-b-2 transition-colors ${
              activeTab === 'ios'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            iPhone / Safari
          </button>
          <button
            onClick={() => setActiveTab('update')}
            className={`flex-1 py-2 border-b-2 transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'update'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <RefreshCw className="w-3 h-3" />
            Update App
          </button>
        </div>

        {activeTab === 'android' && (
          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center justify-center gap-2 shadow-md shadow-sky-600/25 transition-all"
              >
                <Download className="w-4 h-4" />
                Instal Langsung ke Beranda
              </button>
            )}
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-sky-500 shrink-0">1</span>
              <p>Buka browser Chrome, tekan menu titik tiga (⋮) di pojok kanan atas.</p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-sky-500 shrink-0">2</span>
              <p>Pilih <strong>"Instal aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.</p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-sky-500 shrink-0">3</span>
              <p>Aplikasi siap dibuka dari layar HP tanpa terhalang address bar browser.</p>
            </div>
          </div>
        )}

        {activeTab === 'ios' && (
          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-sky-500 shrink-0">1</span>
              <p className="flex items-center gap-1">
                Buka di Safari lalu ketuk tombol <strong>Bagikan / Share</strong>
                <Share className="w-3.5 h-3.5 text-sky-500 inline" />.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-sky-500 shrink-0">2</span>
              <p className="flex items-center gap-1">
                Pilih opsi <strong>"Tambah ke Layar Utama"</strong>
                <PlusSquare className="w-3.5 h-3.5 text-sky-500 inline" />.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-sky-500 shrink-0">3</span>
              <p>Ketuk <strong>"Tambah"</strong> di pojok kanan atas layar.</p>
            </div>
          </div>
        )}

        {activeTab === 'update' && (
          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <p className="leading-relaxed">
              Jika developer baru saja merilis pembaruan, tombol di bawah akan membersihkan cache browser lama dan memuat ulang file terbaru agar aplikasi <strong>tidak blank dan tidak error</strong>.
            </p>
            <button
              onClick={handleTriggerUpdate}
              disabled={isUpdating}
              className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-sky-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
              <span>{isUpdating ? 'Memeriksa & Memperbarui...' : 'Perbarui Aplikasi Sekarang'}</span>
            </button>
            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400">
              💡 Data Anda di Firebase Firestore tetap aman dan tidak akan hilang saat aplikasi diperbarui.
            </div>
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
