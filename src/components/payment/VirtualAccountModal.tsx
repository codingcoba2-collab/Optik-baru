import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentTransaction, BankOption } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  X,
  Building2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sparkles,
  Info
} from 'lucide-react';

interface VirtualAccountModalProps {
  transaction: PaymentTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: (tx: PaymentTransaction) => void;
}

export const VirtualAccountModal: React.FC<VirtualAccountModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onPaymentSuccess
}) => {
  const { checkPaymentStatus, simulatePaymentWebhook, showToast } = useApp();
  const [currentTx, setCurrentTx] = useState<PaymentTransaction | null>(transaction);
  const [copiedField, setCopiedField] = useState<'va' | 'amount' | 'orderId' | null>(null);
  const [selectedInstructionTab, setSelectedInstructionTab] = useState<'mobile' | 'atm' | 'ibanking'>('mobile');
  const [isChecking, setIsChecking] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    setCurrentTx(transaction);
  }, [transaction]);

  // Real-time countdown timer to expiredAt
  useEffect(() => {
    if (!currentTx || !currentTx.expiredAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(currentTx.expiredAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [currentTx?.expiredAt]);

  // Automatic status polling every 4 seconds while pending
  useEffect(() => {
    if (!isOpen || !currentTx || currentTx.paymentStatus !== 'PENDING') return;

    const pollInterval = setInterval(async () => {
      try {
        const updated = await checkPaymentStatus(currentTx.orderId);
        if (updated) {
          setCurrentTx(updated);
          if (updated.paymentStatus === 'PAID') {
            clearInterval(pollInterval);
            if (onPaymentSuccess) onPaymentSuccess(updated);
          }
        }
      } catch (err) {
        // quiet poll
      }
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [isOpen, currentTx?.orderId, currentTx?.paymentStatus, checkPaymentStatus, onPaymentSuccess]);

  if (!isOpen || !currentTx) return null;

  const handleCopy = (text: string, field: 'va' | 'amount' | 'orderId') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    showToast(`${field === 'va' ? 'Nomor Virtual Account' : field === 'amount' ? 'Nominal pembayaran' : 'ID Transaksi'} berhasil disalin!`, 'info');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleManualCheck = async () => {
    setIsChecking(true);
    try {
      const updated = await checkPaymentStatus(currentTx.orderId);
      if (updated) {
        setCurrentTx(updated);
        if (updated.paymentStatus === 'PAID') {
          showToast('Pembayaran telah TERVERIFIKASI dan pesanan dikonfirmasi!', 'success');
          if (onPaymentSuccess) onPaymentSuccess(updated);
        } else if (updated.paymentStatus === 'EXPIRED') {
          showToast('Batas waktu pembayaran telah kadaluarsa', 'warning');
        } else {
          showToast('Belum menerima callback pembayaran. Pastikan transfer sudah dilakukan.', 'info');
        }
      }
    } finally {
      setIsChecking(false);
    }
  };

  const handleSimulateWebhook = async () => {
    setIsSimulating(true);
    try {
      const res = await simulatePaymentWebhook(currentTx.orderId, 'settlement');
      if (res.success) {
        const updated = await checkPaymentStatus(currentTx.orderId);
        if (updated) {
          setCurrentTx(updated);
          if (onPaymentSuccess) onPaymentSuccess(updated);
        }
      }
    } finally {
      setIsSimulating(false);
    }
  };

  const isPaid = currentTx.paymentStatus === 'PAID';
  const isExpired = currentTx.paymentStatus === 'EXPIRED';

  // Bank display information
  const bankDisplayName = currentTx.bankName || currentTx.bankCode?.toUpperCase() || 'Bank Virtual Account';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-sky-400 border border-white/10">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-sky-300 font-semibold tracking-wide uppercase">Pembayaran Online</div>
              <h2 className="text-lg font-bold text-white leading-tight">Virtual Account {currentTx.bankCode?.toUpperCase()}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Status Progress Bar */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className={`flex items-center gap-1.5 font-medium ${isPaid ? 'text-emerald-600 dark:text-emerald-400' : isExpired ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
            {isPaid ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-bold">Pembayaran Berhasil</span>
              </>
            ) : isExpired ? (
              <>
                <AlertCircle className="w-4 h-4" />
                <span className="font-bold">Virtual Account Kadaluarsa</span>
              </>
            ) : (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <span className="font-bold">Menunggu Pembayaran</span>
              </>
            )}
          </div>

          <div className="text-slate-500 dark:text-slate-400 text-right">
            Status Pesanan:{' '}
            <span className={`font-semibold ${isPaid ? 'text-sky-600 dark:text-sky-400' : 'text-slate-700 dark:text-slate-300'}`}>
              {currentTx.orderStatus}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* PAID Notification Banner */}
          {isPaid && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 space-y-2 text-center animate-in fade-in duration-300">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h3 className="text-base font-bold">Pembayaran Terverifikasi Resmi!</h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Payment gateway telah mengonfirmasi transfer Anda. Pesanan telah berstatus <strong>DIKONFIRMASI</strong> dan masuk antrean proses optik.
              </p>
              {currentTx.paidAt && (
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                  Waktu bayar: {new Date(currentTx.paidAt).toLocaleString('id-ID')}
                </div>
              )}
            </div>
          )}

          {/* EXPIRED Banner */}
          {isExpired && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 space-y-1 text-center">
              <AlertCircle className="w-8 h-8 mx-auto text-rose-500" />
              <h3 className="text-sm font-bold">Waktu Pembayaran Telah Habis</h3>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                Nomor Virtual Account ini sudah tidak berlaku. Silakan lakukan pemesanan ulang melalui katalog.
              </p>
            </div>
          )}

          {/* VA & Amount Cards (when Pending or Paid) */}
          <div className="space-y-3">
            {/* Virtual Account Box */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Nomor Virtual Account ({currentTx.bankCode?.toUpperCase()})</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{bankDisplayName}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-slate-900 dark:text-white select-all">
                  {currentTx.virtualAccountNumber}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(currentTx.virtualAccountNumber, 'va')}
                  className="px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 font-medium text-xs flex items-center gap-1.5 transition-colors"
                >
                  {copiedField === 'va' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Total Amount Box */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Total Tagihan Pembayaran</span>
                <span className="text-amber-600 dark:text-amber-400 font-medium">Transfer tepat hingga digit terakhir</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="text-xl sm:text-2xl font-extrabold text-sky-600 dark:text-sky-400">
                  {formatRupiah(currentTx.amount)}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(String(currentTx.amount), 'amount')}
                  className="px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 font-medium text-xs flex items-center gap-1.5 transition-colors"
                >
                  {copiedField === 'amount' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Meta details: Order ID & Expiration */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                <div className="text-slate-500 dark:text-slate-400 mb-0.5">ID Transaksi / Order:</div>
                <div className="font-mono font-semibold text-slate-800 dark:text-slate-200 truncate" title={currentTx.orderId}>
                  {currentTx.orderNo || currentTx.orderId}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                <div className="text-slate-500 dark:text-slate-400 mb-0.5">Sisa Waktu Bayar:</div>
                <div className="font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {timeLeft ? (
                    `${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`
                  ) : (
                    '24:00:00'
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Instructions Accordion */}
          {!isPaid && !isExpired && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span>Petunjuk Cara Pembayaran</span>
                <span className="text-[11px] font-normal text-slate-500">Pilih channel transfer</span>
              </div>

              {/* Tabs */}
              <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedInstructionTab('mobile')}
                  className={`flex-1 py-1.5 rounded-md font-semibold transition-all ${selectedInstructionTab === 'mobile' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                >
                  m-Banking
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInstructionTab('atm')}
                  className={`flex-1 py-1.5 rounded-md font-semibold transition-all ${selectedInstructionTab === 'atm' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                >
                  ATM {currentTx.bankCode?.toUpperCase()}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInstructionTab('ibanking')}
                  className={`flex-1 py-1.5 rounded-md font-semibold transition-all ${selectedInstructionTab === 'ibanking' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                >
                  Internet Banking
                </button>
              </div>

              {/* Instruction Steps */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                {selectedInstructionTab === 'mobile' && (
                  <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
                    <li>Buka aplikasi Mobile Banking {currentTx.bankCode?.toUpperCase()} di smartphone Anda.</li>
                    <li>Pilih menu <strong>Transfer</strong> atau <strong>Bayar Tagihan</strong> &gt; <strong>Virtual Account</strong>.</li>
                    <li>Masukkan nomor Virtual Account: <strong className="font-mono text-sky-600 dark:text-sky-400">{currentTx.virtualAccountNumber}</strong></li>
                    <li>Pastikan nama tagihan dan nominal <strong>{formatRupiah(currentTx.amount)}</strong> sesuai.</li>
                    <li>Masukkan PIN transaksi Anda untuk menyelesaikan pembayaran.</li>
                    <li>Simpan bukti transaksi. Sistem akan memverifikasi secara otomatis dalam beberapa detik.</li>
                  </ol>
                )}

                {selectedInstructionTab === 'atm' && (
                  <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
                    <li>Masukkan kartu ATM {currentTx.bankCode?.toUpperCase()} dan PIN Anda.</li>
                    <li>Pilih menu <strong>Transaksi Lainnya</strong> &gt; <strong>Pembayaran</strong> &gt; <strong>Virtual Account</strong>.</li>
                    <li>Ketik nomor Virtual Account: <strong className="font-mono text-sky-600 dark:text-sky-400">{currentTx.virtualAccountNumber}</strong></li>
                    <li>Periksa rincian pembayaran di layar monitor ATM. Tekan <strong>Ya / Benar</strong>.</li>
                    <li>Ambil struk ATM bukti pembayaran yang dicetak mesin.</li>
                  </ol>
                )}

                {selectedInstructionTab === 'ibanking' && (
                  <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
                    <li>Login ke website Internet Banking resmi bank Anda.</li>
                    <li>Pilih menu <strong>Pembayaran Tagihan</strong> &gt; <strong>Virtual Account</strong>.</li>
                    <li>Masukkan nomor VA: <strong className="font-mono text-sky-600 dark:text-sky-400">{currentTx.virtualAccountNumber}</strong></li>
                    <li>Otorisasi transaksi menggunakan Token / OTP bank Anda.</li>
                  </ol>
                )}
              </div>
            </div>
          )}

          {/* Security & Official Webhook Notice */}
          <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-[11px] text-sky-800 dark:text-sky-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Verifikasi Otomatis Webhook:</strong> Sistem tidak mengonfirmasi pesanan semata-mata dari upload bukti atau membuka halaman. Sistem menunggu callback resmi bertanda tangan digital dari Payment Gateway.
            </div>
          </div>

          {/* Testing / Sandbox Simulation Tool */}
          {!isPaid && !isExpired && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-dashed border-amber-300 dark:border-amber-700/60 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Simulasi Verifikasi Webhook Gateway (Mode Uji Coba)</span>
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-normal">
                Gunakan tombol di bawah ini untuk menguji webhook payment gateway saat berada di lingkungan pengujian tanpa harus transfer uang asli:
              </p>
              <button
                type="button"
                onClick={handleSimulateWebhook}
                disabled={isSimulating}
                className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Memproses Callback Webhook...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Kirim Webhook Settlement (Simulasi Lunas)</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {isPaid ? 'Tutup & Lihat Pesanan' : 'Bayar Nanti'}
          </button>

          {!isPaid && !isExpired && (
            <button
              type="button"
              onClick={handleManualCheck}
              disabled={isChecking}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Mengecek...' : 'Cek Status Pembayaran'}</span>
            </button>
          )}

          {isPaid && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Selesai & Lacak Pesanan</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
