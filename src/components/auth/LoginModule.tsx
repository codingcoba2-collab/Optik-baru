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
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Smartphone
} from 'lucide-react';

export const LoginModule: React.FC = () => {
  const {
    loginSeller,
    loginConsumer,
    registerUser,
    loginWithGooglePopup,
    isDark,
    setIsDark,
    showToast
  } = useApp();

  // Mode: 'login' or 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  // Target: 'seller' or 'consumer'
  const [userType, setUserType] = useState<UserType>('seller');

  // Form fields
  const [storeName, setStoreName] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP Modal State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [otpTargetPhone, setOtpTargetPhone] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(60);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpTargetPhone(phone);
    setIsOtpModalOpen(true);
    setInputOtp('');
    setOtpCountdown(60);
    showToast(`Kode OTP verifikasi nomor HP Anda: ${code}`, 'info');
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

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    const res = await loginWithGooglePopup(userType, userType === 'seller' ? storeName : undefined);
    setIsLoading(false);
    if (!res.success) {
      setErrorMsg(res.message || 'Gagal masuk dengan Google');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Decorative Lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-sky-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />

      {/* Top Bar: Brand & Theme Toggle */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <Glasses className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="text-lg font-black tracking-tight flex items-center gap-1">
              <span>eye</span>
              <span className="text-sky-400">hub</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 ml-1">
                Optics
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Sistem Operasional Toko & Marketplace Optik</p>
          </div>
        </div>

        <button
          onClick={() => setIsDark(!isDark)}
          title={isDark ? 'Mode Terang' : 'Mode Gelap'}
          className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
        </button>
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

      {/* OTP Verification Modal */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-3">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Verifikasi OTP Nomor HP</h3>
              <p className="text-xs text-slate-400 mt-1">
                Kode 6-digit dikirimkan ke <span className="font-mono text-emerald-400">{otpTargetPhone}</span>
              </p>
              <div className="mt-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                KODE OTP: {generatedOtp}
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
                className="w-full text-center tracking-[0.4em] font-mono text-lg font-bold py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsOtpModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleVerifyOtpAndComplete}
                disabled={inputOtp.length !== 6 || isLoading}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold disabled:opacity-50"
              >
                {isLoading ? 'Memverifikasi...' : 'Verifikasi & Aktifkan'}
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
