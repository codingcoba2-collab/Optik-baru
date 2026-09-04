import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, CheckCircle, Smartphone, X } from 'lucide-react';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>('android');

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Instal eye hub App
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Akses cepat offline & operasional live streaming tanpa lemot
            </p>
          </div>
        </div>

        {isInstalled ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 shrink-0" />
            <span className="text-sm font-medium">Aplikasi eye hub sudah terinstal di perangkat Anda!</span>
          </div>
        ) : (
          <div>
            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="w-full mb-4 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-sky-600/25 transition-all"
              >
                <Download className="w-4 h-4" />
                Instal Sekarang ke Beranda
              </button>
            )}

            {/* Platform Selector Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4">
              <button
                onClick={() => setActiveTab('android')}
                className={`flex-1 py-2 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'android'
                    ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Android (Chrome)
              </button>
              <button
                onClick={() => setActiveTab('ios')}
                className={`flex-1 py-2 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === 'ios'
                    ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                iPhone / iPad (Safari)
              </button>
            </div>

            {activeTab === 'android' ? (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-sky-500 shrink-0">1</span>
                  <p>Buka menu browser Chrome dengan menekan tombol titik tiga (⋮) di pojok kanan atas.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-sky-500 shrink-0">2</span>
                  <p>Pilih menu <strong>"Instal aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-sky-500 shrink-0">3</span>
                  <p>Konfirmasi instalasi. Ikon <strong>eye hub</strong> siap digunakan langsung seperti aplikasi native!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-sky-500 shrink-0">1</span>
                  <p className="flex items-center gap-1.5">
                    Buka di Safari dan ketuk tombol <strong>Bagikan / Share</strong>
                    <Share className="w-3.5 h-3.5 text-sky-500 inline" />
                    di bilah bawah layar.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-sky-500 shrink-0">2</span>
                  <p className="flex items-center gap-1.5">
                    Gulir ke bawah lalu pilih opsi <strong>"Tambah ke Layar Utama"</strong>
                    <PlusSquare className="w-3.5 h-3.5 text-sky-500 inline" />.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-sky-500 shrink-0">3</span>
                  <p>Ketuk tombol <strong>"Tambah"</strong> di pojok kanan atas untuk menyimpan ke home screen.</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
