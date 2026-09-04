import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CashflowEntry, AdSpendEntry, ExpenseCategory } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { CommaNumberInput } from '../common/CommaNumberInput';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Filter,
  DollarSign,
  TrendingUp,
  Receipt,
  Layers,
  Banknote,
  Megaphone,
  CreditCard,
  CheckCircle2,
  Trash2,
  X
} from 'lucide-react';

export const AccountingModule: React.FC = () => {
  const { cashflow, addCashflow, deleteCashflow, adSpend, addAdSpend, store, updateStore } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'cashflow' | 'escrow' | 'ads'>('cashflow');
  const [isCashflowModalOpen, setIsCashflowModalOpen] = useState(false);
  const [isAdsModalOpen, setIsAdsModalOpen] = useState(false);
  const [isDisburseModalOpen, setIsDisburseModalOpen] = useState(false);

  // Cashflow Form State
  const [type, setType] = useState<'in' | 'out'>('out');
  const [category, setCategory] = useState<ExpenseCategory>('Biaya Lab Faset & Konsumabel');
  const [amount, setAmount] = useState(150000);
  const [description, setDescription] = useState('');
  const [recipient, setRecipient] = useState('');

  // Ads Form State
  const [adDate, setAdDate] = useState(new Date().toISOString().split('T')[0]);
  const [platform, setPlatform] = useState<'TikTok Ads' | 'Shopee Ads' | 'Meta Ads' | 'Google Ads'>('TikTok Ads');
  const [adBudget, setAdBudget] = useState(250000);
  const [liveCoinSaweran, setLiveCoinSaweran] = useState(50000);
  const [adRevenue, setAdRevenue] = useState(1200000);

  // Escrow Disbursement State
  const [disburseAmount, setDisburseAmount] = useState(store.escrowBalance);

  const expenseCategories: ExpenseCategory[] = [
    'Biaya Lab Faset & Konsumabel',
    'Sewa Ruko / Booth Optik',
    'Ads TikTok & Shopee',
    'Coin Saweran / Voucher Live',
    'Gaji & Komisi Karyawan',
    'Packaging & Pengiriman',
    'Pembelian Grosir Frame/Lensa',
    'Operasional & Listrik Toko',
  ];

  const totalIn = cashflow.filter((c) => c.type === 'in').reduce((sum, c) => sum + c.amount, 0);
  const totalOut = cashflow.filter((c) => c.type === 'out').reduce((sum, c) => sum + c.amount, 0);

  const totalAdsBudget = adSpend.reduce((sum, a) => sum + a.adBudget, 0);
  const totalCoinSaweran = adSpend.reduce((sum, a) => sum + a.liveCoinSaweran, 0);
  const totalAdsRevenue = adSpend.reduce((sum, a) => sum + a.revenueGenerated, 0);
  const totalAdCost = totalAdsBudget + totalCoinSaweran;
  const overallRoas = totalAdCost > 0 ? (totalAdsRevenue / totalAdCost).toFixed(2) : '0';

  const handleCreateCashflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !description.trim()) return;

    const newEntry: CashflowEntry = {
      id: 'cf-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      storeId: store.id,
      type,
      category,
      amount,
      description,
      recipient: recipient || undefined,
    };

    addCashflow(newEntry);
    setIsCashflowModalOpen(false);
    setDescription('');
    setRecipient('');
  };

  const handleCreateAdSpend = (e: React.FormEvent) => {
    e.preventDefault();

    const roas = adBudget + liveCoinSaweran > 0 ? adRevenue / (adBudget + liveCoinSaweran) : 0;

    const newAd: AdSpendEntry = {
      id: 'ad-' + Date.now(),
      date: adDate,
      storeId: store.id,
      platform,
      adBudget,
      liveCoinSaweran,
      revenueGenerated: adRevenue,
      roas,
    };

    addAdSpend(newAd);
    setIsAdsModalOpen(false);
  };

  const handleConfirmDisburseEscrow = () => {
    if (disburseAmount <= 0) return;
    const actualDisburse = Math.min(disburseAmount, store.escrowBalance);

    // Add cashflow record
    addCashflow({
      id: 'cf-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      storeId: store.id,
      type: 'in',
      category: 'Operasional & Listrik Toko',
      amount: actualDisburse,
      description: `Pencairan Saldo Escrow Marketplace ke Rekening/Kas Utama Toko`,
    });

    // Update store balance
    updateStore({
      ...store,
      cashOnHand: store.cashOnHand + actualDisburse,
      escrowBalance: store.escrowBalance - actualDisburse,
    });

    setIsDisburseModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500 mb-1">
            <Wallet className="w-4 h-4" />
            Keuangan, Arus Kas & Saldo Escrow Marketplace
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Akuntansi & Manajemen Kas Toko Optik
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitoring dana cair fisik, escrow tertahan TikTok/Shopee, dan efisiensi iklan ROAS
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCashflowModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Kas Masuk/Keluar</span>
          </button>
        </div>
      </div>

      {/* Financial Balance Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Kas Fisik Toko */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Kas Fisik & Rekening Toko</span>
            <Banknote className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            {formatRupiah(store.cashOnHand)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Saldo likuid siap pakai</div>
        </div>

        {/* Saldo Escrow MP */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Saldo Escrow Marketplace</span>
            <CreditCard className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-lg sm:text-xl font-black text-amber-500">
            {formatRupiah(store.escrowBalance)}
          </div>
          <button
            onClick={() => {
              setDisburseAmount(store.escrowBalance);
              setIsDisburseModalOpen(true);
            }}
            className="text-[11px] font-bold text-sky-500 hover:underline mt-1 block"
          >
            Cairkan ke Kas Toko →
          </button>
        </div>

        {/* Total Pengeluaran Kas */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Kas Keluar</span>
            <ArrowUpRight className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-lg sm:text-xl font-black text-rose-500">
            {formatRupiah(totalOut)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{cashflow.filter((c) => c.type === 'out').length} Pengeluaran</div>
        </div>

        {/* Efektivitas Iklan ROAS */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">ROAS Iklan Rata-rata</span>
            <Megaphone className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-lg sm:text-xl font-black text-purple-500">
            {overallRoas}x
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Total Biaya Ads: {formatRupiah(totalAdCost)}</div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('cashflow')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'cashflow'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Buku Kas (Arus Masuk/Keluar)
        </button>
        <button
          onClick={() => setActiveSubTab('ads')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'ads'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Iklan Ads & Saweran Live ({adSpend.length})
        </button>
      </div>

      {/* Cashflow SubTab Content */}
      {activeSubTab === 'cashflow' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-750">
                  <tr>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-3">Tipe</th>
                    <th className="py-3 px-3">Kategori</th>
                    <th className="py-3 px-3">Keterangan</th>
                    <th className="py-3 px-3">Penerima / Sumber</th>
                    <th className="py-3 px-4 text-right">Nominal</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                  {cashflow.map((cf) => (
                    <tr key={cf.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-500">{cf.date}</td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            cf.type === 'in'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {cf.type === 'in' ? 'Masuk' : 'Keluar'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                        {cf.category}
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400">{cf.description}</td>
                      <td className="py-3.5 px-3 text-slate-500">{cf.recipient || '-'}</td>
                      <td
                        className={`py-3.5 px-4 text-right font-black ${
                          cf.type === 'in' ? 'text-emerald-500' : 'text-rose-500'
                        }`}
                      >
                        {cf.type === 'in' ? '+' : '-'}
                        {formatRupiah(cf.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => deleteCashflow(cf.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {cashflow.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Belum ada catatan arus kas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Ads & Live Saweran SubTab Content */}
      {activeSubTab === 'ads' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsAdsModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md shadow-purple-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              Catat Iklan / Koin Saweran
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-750">
                  <tr>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-3">Platform</th>
                    <th className="py-3 px-3 text-right">Budget Iklan</th>
                    <th className="py-3 px-3 text-right">Koin/Saweran Live</th>
                    <th className="py-3 px-3 text-right">Total Biaya</th>
                    <th className="py-3 px-3 text-right">Omzet Dihasilkan</th>
                    <th className="py-3 px-4 text-center">ROAS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                  {adSpend.map((ad) => {
                    const totalCost = ad.adBudget + ad.liveCoinSaweran;
                    return (
                      <tr key={ad.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-mono text-slate-500">{ad.date}</td>
                        <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">
                          {ad.platform}
                        </td>
                        <td className="py-3.5 px-3 text-right">{formatRupiah(ad.adBudget)}</td>
                        <td className="py-3.5 px-3 text-right text-amber-500">{formatRupiah(ad.liveCoinSaweran)}</td>
                        <td className="py-3.5 px-3 text-right font-bold text-rose-500">{formatRupiah(totalCost)}</td>
                        <td className="py-3.5 px-3 text-right font-black text-emerald-500">
                          {formatRupiah(ad.revenueGenerated)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                            {ad.roas.toFixed(2)}x
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Catat Arus Kas */}
      {isCashflowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <button
              onClick={() => setIsCashflowModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              Catat Arus Kas Toko Optik
            </h3>

            <form onSubmit={handleCreateCashflow} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('out')}
                  className={`py-2 rounded-lg font-bold transition-all ${
                    type === 'out'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  Kas Keluar (Pengeluaran)
                </button>
                <button
                  type="button"
                  onClick={() => setType('in')}
                  className={`py-2 rounded-lg font-bold transition-all ${
                    type === 'in'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  Kas Masuk (Pendapatan)
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kategori Pengeluaran
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {expenseCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nominal (Rp)
                </label>
                <CommaNumberInput value={amount} onChange={setAmount} />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Keterangan
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Beli 2 unit diamond wheel faset lensa"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Penerima / Vendor
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Supplier Alat Optik / PLN / Kas Toko"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCashflowModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  Simpan Arus Kas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Catat Iklan */}
      {isAdsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-purple-500" />
              Catat Pengeluaran Iklan & Live Saweran
            </h3>

            <form onSubmit={handleCreateAdSpend} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Platform Iklan
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="TikTok Ads">TikTok Ads</option>
                    <option value="Shopee Ads">Shopee Ads</option>
                    <option value="Meta Ads">Meta Ads (IG/FB)</option>
                    <option value="Google Ads">Google Ads</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={adDate}
                    onChange={(e) => setAdDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Budget Iklan / Ads Spend (Rp)
                </label>
                <CommaNumberInput value={adBudget} onChange={setAdBudget} />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Koin Saweran / Voucher Diskon Live (Rp)
                </label>
                <CommaNumberInput value={liveCoinSaweran} onChange={setLiveCoinSaweran} />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Omzet Penjualan yang Dihasilkan (Rp)
                </label>
                <CommaNumberInput value={adRevenue} onChange={setAdRevenue} />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAdsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold"
                >
                  Simpan Data Iklan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cairkan Escrow MP */}
      {isDisburseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h4 className="text-sm font-bold text-amber-500 flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5" />
              Pencairan Dana Escrow Marketplace
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Pindahkan dana yang sudah dilepaskan oleh TikTok Shop / Shopee ke Rekening Utama / Kas Fisik Toko:
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nominal Pencairan (Rp)
              </label>
              <CommaNumberInput value={disburseAmount} onChange={setDisburseAmount} />
              <div className="text-[10px] text-slate-400 mt-1">
                Maksimal saldo escrow saat ini: {formatRupiah(store.escrowBalance)}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsDisburseModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDisburseEscrow}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white"
              >
                Konfirmasi Pencairan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
