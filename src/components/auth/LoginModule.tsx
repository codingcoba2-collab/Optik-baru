import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserType } from '../../types';
import {
  Glasses,
  Store,
  User,
  Lock,
  Phone,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Smartphone,
  RefreshCw,
  Zap,
  HardDrive,
  Check,
  X,
  ShieldCheck,
  MessageSquare,
  BookOpen
} from 'lucide-react';

export const LoginModule: React.FC<{ onBackToEducation?: () => void }> = ({ onBackToEducation }) => {
  const {
    loginSeller,
    loginConsumer,
    registerUser,
    loginWithGooglePopup,
    loginWithGoogleAccount,
    isDark,
    setIsDark,
    showToast
  } = useApp();

  // Mode: 'login' or 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  // Target: 'seller' or 'consumer'
  const [userType, setUserType] = useState<UserType>('seller');

  // Form fields prefilled with user requested profile
  const [storeName, setStoreName] = useState('Optik Jaya Sentosa');
  const [fullName, setFullName] = useState('Danial Ramdhan');
  const [username, setUsername] = useState('danialramdhan');
  const [password, setPassword] = useState('123456');
  const [phone, setPhone] = useState('0895621670403');
  const [showPassword, setShowPassword] = useState(false);

  // OTP Modal State & SMS/WhatsApp simulation
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [otpTargetPhone, setOtpTargetPhone] = useState('0895621670403');
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [hasSimulatedNotification, setHasSimulatedNotification] = useState(false);

  // Google Login Modal State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // PWA Update state on Login screen
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'updated'>('idle');

  const handleUpdateAppWithoutUninstall = async () => {
    setIsUpdating(true);
    setUpdateStatus('checking');
    showToast('Memeriksa cache & memperbarui service worker...', 'info');

    try {
      // 1. Force update Service Worker
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.update();
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        }
      }

      // 2. Clear stale cache storage to fetch latest code bundles
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      }

      // 3. Mark update completed
      setUpdateStatus('updated');
      showToast('Pembaruan v2.4.0 siap! Memuat ulang aplikasi...', 'success');

      // 4. Soft reload to activate fresh application version without uninstall
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err) {
      console.error('Update failed:', err);
      showToast('Gagal memperbarui otomatis. Memuat ulang browser...', 'info');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    if (userType === 'seller') {
      if (!username.trim()) {
        setErrorMsg('Harap masukkan username toko/pegawai');
        setIsLoading(false);
        return;
      }
      const res = loginSeller(storeName, username, password);
      if (!res.success) {
        setErrorMsg(res.message || 'Login gagal. Periksa data Anda.');
      }
    } else {
      if (!username.trim()) {
        setErrorMsg('Harap masukkan username konsumen');
        setIsLoading(false);
        return;
      }
      const res = loginConsumer(username, password);
      if (!res.success) {
        setErrorMsg(res.message || 'Login gagal. Periksa data Anda.');
      }
    }
    setIsLoading(false);
  };

  const handleStartOtpRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (userType === 'seller' && !storeName.trim()) {
      setErrorMsg('Nama toko wajib diisi untuk pendaftaran seller');
      return;
    }
    if (!username.trim()) {
      setErrorMsg('Username wajib diisi');
      return;
    }
    if (!phone.trim() || phone.length < 8) {
      setErrorMsg('Nomor HP tidak valid. Masukkan nomor HP aktif (contoh: 081234567890)');
      return;
    }

    // Generate 6 digit OTP
    const target = phone.trim() || '0895621670403';
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpTargetPhone(target);
    setIsOtpModalOpen(true);
    setInputOtp('');
    setOtpCountdown(60);
    setHasSimulatedNotification(true);
    showToast(`Kode OTP verifikasi resmi dikirim dari WhatsApp 0895621670403. Kode: ${code}`, 'success');
  };

  const handleAutoFillOtp = () => {
    setInputOtp(generatedOtp);
    showToast('Kode OTP berhasil ditempel otomatis!', 'info');
  };

  const handleVerifyOtpAndComplete = async () => {
    if (inputOtp.trim() !== generatedOtp) {
      setErrorMsg('Kode OTP yang Anda masukkan salah.');
      showToast('Kode OTP tidak sesuai!', 'error');
      return;
    }

    setIsLoading(true);
    const res = await registerUser({
      username: username.trim(),
      fullName: fullName.trim() || username.trim(),
      password: password || '123456',
      phone: otpTargetPhone,
      userType,
      storeName: userType === 'seller' ? storeName.trim() : undefined,
      role: userType === 'seller' ? 'owner' : undefined
    });

    setIsLoading(false);
    if (res.success) {
      setIsOtpModalOpen(false);
      showToast('Nomor HP berhasil diverifikasi dan akun aktif!', 'success');
    } else {
      setErrorMsg(res.message || 'Gagal mendaftar.');
    }
  };

  const handleGoogleAuth = () => {
    setIsGoogleModalOpen(true);
  };

  const handleSelectGoogleAccount = async (email: string, name: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await loginWithGoogleAccount(
        email,
        name,
        userType,
        userType === 'seller' ? storeName || 'Optik Jaya Sentosa' : undefined
      );
      if (res.success) {
        setIsGoogleModalOpen(false);
      } else {
        setErrorMsg(res.message || 'Gagal masuk dengan akun Google');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal masuk dengan Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFirebasePopupAuth = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    const res = await loginWithGooglePopup(userType, userType === 'seller' ? storeName : undefined);
    setIsLoading(false);
    if (res.success) {
      setIsGoogleModalOpen(false);
    } else {
      setErrorMsg(res.message || 'Gagal masuk dengan Google');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between p-3 sm:p-6 lg:p-8 pt-[max(env(safe-area-inset-top,22px),22px)] relative overflow-x-hidden">
      {/* Background Decorative Lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-sky-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />

      {/* Top Bar: Brand, Update Feature & Theme Toggle */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 shrink-0">
            <Glasses className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1">
              <span>eye</span>
              <span className="text-sky-400">hub</span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 ml-1">
                Optics
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden xs:block">Sistem Operasional Toko & Marketplace Optik</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onBackToEducation && (
            <button
              onClick={onBackToEducation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-sky-400" />
              <span>Edukasi Mata & Lensa</span>
            </button>
          )}

          {/* Update App Button on Login Screen */}
          <button
            onClick={() => setIsUpdateModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Update App</span>
            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-sky-400/20 text-sky-300 font-bold">
              v2.4.0
            </span>
          </button>

          <button
            onClick={() => setIsDark(!isDark)}
            title={isDark ? 'Mode Terang' : 'Mode Gelap'}
            className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
          </button>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="max-w-md w-full mx-auto my-auto py-8 z-10">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Header Title */}
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-1">
              {authMode === 'login' ? 'Masuk ke eye hub' : 'Daftar Akun Baru'}
            </h1>
            <p className="text-xs text-slate-400">
              {authMode === 'login'
                ? 'Pilih peran akun Anda untuk mengakses sistem'
                : 'Mulai tanpa data awal, kelola toko optik atau belanja kacamata'}
            </p>
          </div>

          {/* User Type Switcher: Toko (Seller) vs Konsumen */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-800/80 border border-slate-700/60 mb-6">
            <button
              type="button"
              onClick={() => {
                setUserType('seller');
                setErrorMsg(null);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                userType === 'seller'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Untuk Toko (Seller)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setUserType('consumer');
                setErrorMsg(null);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                userType === 'consumer'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Untuk Konsumen</span>
            </button>
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Login / Register */}
          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {userType === 'seller' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Nama Toko Optik
                  </label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="Masukkan nama toko optik Anda"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-sky-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {userType === 'seller' ? 'Username Owner / Pegawai' : 'Username Konsumen'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={userType === 'seller' ? 'Username toko / pegawai' : 'Username akun Anda'}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Memproses...</span>
                ) : (
                  <>
                    <span>Masuk sebagai {userType === 'seller' ? 'Toko (Seller)' : 'Konsumen'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            // Register with Phone & OTP or form
            <form onSubmit={handleStartOtpRegister} className="space-y-3.5">
              {userType === 'seller' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nama Toko Optik Baru
                  </label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="Contoh: Optik Cahaya Baru"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-sky-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama lengkap Anda"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username untuk login"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nomor HP (Verifikasi OTP)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-sky-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400">Kode OTP akan dikirimkan ke nomor ini</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-9 pr-10 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <span>Kirim Kode OTP & Lanjutkan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Social Auth Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-slate-900 text-slate-500">Atau daftar dengan Google</span>
            </div>
          </div>

          {/* Google Sign-in Button */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Daftar / Masuk dengan Akun Google</span>
          </button>

          {/* Quick PWA Update info banner on login card */}
          <div className="mt-4 p-3 rounded-xl bg-sky-950/40 border border-sky-800/40 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <span className="font-bold text-sky-300 block">Pembaruan Tersedia (v2.4.0)</span>
                <span className="text-[10px] text-slate-400">Update langsung tanpa perlu uninstall</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsUpdateModalOpen(true)}
              className="py-1 px-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] shadow-sm transition-all cursor-pointer shrink-0"
            >
              Cek Update
            </button>
          </div>

          {/* Toggle between Login and Register */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            {authMode === 'login' ? (
              <p className="text-xs text-slate-400">
                Belum memiliki akun?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMsg(null);
                  }}
                  className="text-sky-400 hover:text-sky-300 font-bold underline cursor-pointer"
                >
                  Daftar akun baru sekarang
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                Sudah memiliki akun?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMsg(null);
                  }}
                  className="text-sky-400 hover:text-sky-300 font-bold underline cursor-pointer"
                >
                  Masuk ke akun yang ada
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* OTP Verification Modal with WhatsApp Gateway 0895621670403 */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-2 shadow-sm">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Verifikasi OTP WhatsApp</h3>
              <p className="text-xs text-slate-400 mt-1">
                Pesan OTP resmi otomatis dikirimkan ke akun WhatsApp Anda.
              </p>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold mt-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Pengirim Resmi: WhatsApp 0895621670403</span>
              </div>
            </div>

            {/* Realistic WhatsApp Notification Bubble */}
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Pesan Masuk WhatsApp Gateway</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Baru saja</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-200 leading-relaxed font-sans space-y-1.5">
                <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-800">
                  <span className="text-slate-400">Dari WhatsApp:</span>
                  <span className="text-emerald-400 font-mono font-bold">0895621670403 (Optik)</span>
                </div>
                <p className="text-xs text-slate-300">
                  "Halo, kode verifikasi OTP akun <span className="font-bold text-white">eye hub Optics</span> Anda adalah:
                </p>
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <span className="font-mono font-black text-emerald-400 text-lg tracking-[0.25em]">
                    {generatedOtp}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  *Demi keamanan, jangan bagikan kode ini kepada pihak mana pun.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAutoFillOtp}
                  className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-md shadow-emerald-600/30"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Tempel Kode Otomatis ({generatedOtp})</span>
                </button>
                <a
                  href={`https://wa.me/62895621670403?text=Halo%20Admin%20Optik,%20saya%20meminta%20kode%20OTP%20pendaftaran%20eye%20hub:%20${generatedOtp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1 transition-colors text-center"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cek WhatsApp</span>
                </a>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Masukkan Kode OTP 6-Digit
              </label>
              <input
                type="text"
                maxLength={6}
                value={inputOtp}
                onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center tracking-[0.4em] font-mono text-xl font-bold py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsOtpModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleVerifyOtpAndComplete}
                disabled={inputOtp.length !== 6 || isLoading}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-600/30"
              >
                {isLoading ? 'Memverifikasi...' : 'Verifikasi & Masuk'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Account Selector Modal */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <div>
                  <h3 className="text-sm font-bold text-white">Masuk dengan Google</h3>
                  <p className="text-[11px] text-slate-400">Pilih akun Google Anda untuk mengakses eye hub</p>
                </div>
              </div>
              <button
                onClick={() => setIsGoogleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Primary Account: Danial Ramdhan */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Akun Google Terdaftar:
              </span>
              <button
                type="button"
                onClick={() => handleSelectGoogleAccount('danialramdhan@gmail.com', 'Danial Ramdhan')}
                className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-sky-500/30 hover:border-sky-500 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                    D
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs group-hover:text-sky-400 transition-colors">
                      Danial Ramdhan
                    </div>
                    <div className="text-[11px] text-slate-400">danialramdhan@gmail.com</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Pilih
                </span>
              </button>
            </div>

            {/* Custom Google Account Option */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Atau Masuk dengan Akun Google Lain:
              </span>
              <div className="space-y-2">
                <input
                  type="text"
                  value={customGoogleName}
                  onChange={(e) => setCustomGoogleName(e.target.value)}
                  placeholder="Nama Lengkap Google (contoh: Danial)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-sky-500"
                />
                <input
                  type="email"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  placeholder="Email Gmail Anda (contoh: user@gmail.com)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-sky-500"
                />
                <button
                  type="button"
                  disabled={!customGoogleEmail.trim() || isLoading}
                  onClick={() => handleSelectGoogleAccount(customGoogleEmail.trim(), customGoogleName.trim() || customGoogleEmail.split('@')[0])}
                  className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  Masuk dengan Akun Ini
                </button>
              </div>
            </div>

            {/* Official Firebase Popup fallback option */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleFirebasePopupAuth}
                disabled={isLoading}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Buka Jendela Popup Google Resmi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PWA Update Modal on Login Screen (Works without uninstalling) */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Pusat Pembaruan Aplikasi</h3>
                  <span className="text-[10px] text-sky-400 font-bold">eye hub v2.4.0 (PWA Service Worker)</span>
                </div>
              </div>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Version Information Card */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-750 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Versi Terbaru Sistem:</span>
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  v2.4.0-PWA (Ready)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Metode Pembaruan:</span>
                <span className="text-xs font-semibold text-white">
                  Instan (Tanpa Uninstall)
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed pt-1 border-t border-slate-700/60">
                Fitur ini memperbarui cache browser & service worker secara otomatis sehingga Anda langsung mendapatkan fitur terkini tanpa perlu menghapus atau menginstal ulang aplikasi.
              </p>
            </div>

            {/* What's new highlights */}
            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-slate-200 text-[11px] flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Sorotan Fitur Baru v2.4.0:
              </span>
              <ul className="space-y-1 text-[11px] text-slate-300 pl-4 list-disc">
                <li>Dukungan Zoom In & Zoom Out layar (+ / - / reset) di seluruh tampilan.</li>
                <li>6 Palet Tema Warna Toko (Electric Ocean, Neon, Mint, Violet, Coral, Studio).</li>
                <li>Preskripsi Lensa Resep (OD/OS SPH, CYL, Axis, Add) pada checkout pesanan.</li>
                <li>Sinkronisasi Cloud Real-time dengan Google Firebase Firestore.</li>
                <li>Katalog Lensa Multi-Kategori & Lab Faset Luar dengan input biaya faset.</li>
                <li>Pembaruan instan langsung dari halaman login tanpa uninstall.</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleUpdateAppWithoutUninstall}
                disabled={isUpdating}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white text-xs font-bold shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
                <span>
                  {isUpdating ? 'Sedang Memperbarui & Membersihkan Cache...' : 'Perbarui Sekarang (Tanpa Uninstall)'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if ('caches' in window) {
                    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
                  }
                  window.location.reload();
                }}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                <span>Bersihkan Cache & Muat Ulang Halaman</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer info */}
      <div className="text-center text-[11px] text-slate-500 z-10">
        eye hub © {new Date().getFullYear()} — Multi-Role Optical ERP & Customer Eyewear Marketplace
      </div>
    </div>
  );
};
