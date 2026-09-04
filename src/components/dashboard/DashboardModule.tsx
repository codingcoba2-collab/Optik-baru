import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatNumber } from '../../utils/formatters';
import {
  TrendingUp,
  DollarSign,
  Glasses,
  ShoppingBag,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Wrench,
  Users,
  Wallet,
  Calendar,
  Layers,
  Radio,
  Clock,
  ShieldCheck,
  Zap,
  RefreshCw
} from 'lucide-react';

interface DashboardModuleProps {
  onNavigate: (tab: string) => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({ onNavigate }) => {
  const {
    store,
    salesOrders,
    products,
    fasetOrders,
    cashflow,
    adSpend,
    employees,
    attendance,
  } = useApp();

  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'month'>('all');
  const [aiInsight, setAiInsight] = useState<any>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Financial calculations
  const totalGrossRevenue = (salesOrders || []).reduce((sum, o) => sum + (o?.grossAmount || 0), 0);
  const totalMarketplaceFees = (salesOrders || []).reduce((sum, o) => sum + (o?.marketplaceAdminFee || 0) + (o?.serviceFee || 0), 0);
  const totalHppSold = (salesOrders || []).reduce((sum, o) => sum + (o?.totalHpp || 0), 0);
  const totalAdCost = (adSpend || []).reduce((sum, a) => sum + (a?.adBudget || 0) + (a?.liveCoinSaweran || 0), 0);
  const totalExpenses = (cashflow || []).filter((c) => c && c.type === 'out').reduce((sum, c) => sum + (c?.amount || 0), 0);

  // Net profit = Gross Revenue - Total Hpp - Marketplace Fees - Ad Cost - Lab/Operating Expenses
  const estimatedNetProfit = totalGrossRevenue - totalHppSold - totalMarketplaceFees - totalAdCost;
  const netMarginPercent = totalGrossRevenue > 0 ? (estimatedNetProfit / totalGrossRevenue) * 100 : 0;

  // Today metrics
  const todayStr = '2026-09-03';
  const todaySales = (salesOrders || []).filter((o) => o && o.date === todayStr);
  const todayRevenue = todaySales.reduce((sum, o) => sum + (o?.grossAmount || 0), 0);
  const todayUnits = todaySales.reduce((sum, o) => sum + (Array.isArray(o?.items) ? o.items.reduce((iSum, item) => iSum + (item?.qty || 0), 0) : 0), 0);

  // Lab Faset Status
  const fasetPending = (fasetOrders || []).filter((f) => f && f.status === 'Antrean Lab').length;
  const fasetInProcess = (fasetOrders || []).filter((f) => f && (f.status === 'Proses Faset' || f.status === 'Fitting Frame' || f.status === 'QC Akurasi')).length;
  const fasetCompleted = (fasetOrders || []).filter((f) => f && f.status === 'Selesai & Siap').length;
  const fasetRejected = (fasetOrders || []).filter((f) => f && f.status === 'Reject Lab').length;

  // Low Stock Alerts
  const lowStockProducts = (products || []).filter((p) => p && p.stockQty <= (p.minStockAlert ?? 5));

  // Fetch AI Store Insight
  const handleFetchAiInsight = async () => {
    setIsLoadingAi(true);
    try {
      const response = await fetch('/api/ai/store-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: store?.name || 'Optik',
          revenueSummary: {
            totalGrossRevenue,
            estimatedNetProfit,
            netMarginPercent: netMarginPercent.toFixed(1) + '%',
            monthlyTarget: store.monthlyTargetOmzet
          },
          topProducts: products.slice(0, 4).map((p) => ({ name: p.name, category: p.category, stock: p.stockQty })),
          channelPerformance: {
            tiktokLive: salesOrders.filter((o) => o.channel.includes('TikTok')).length,
            shopeeLive: salesOrders.filter((o) => o.channel.includes('Shopee')).length,
            offlineOptik: salesOrders.filter((o) => o.channel.includes('Offline')).length,
          },
          labMetrics: {
            pending: fasetPending,
            completed: fasetCompleted,
            rejected: fasetRejected
          }
        })
      });
      const data = await response.json();
      setAiInsight(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-sky-900/40 via-indigo-900/30 to-slate-900/50 p-5 sm:p-6 rounded-2xl border border-sky-500/20 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Dashboard Operasional Toko Optik Real-time
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {store.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {store.tagline} • Target Bulanan: {formatRupiah(store.monthlyTargetOmzet)}
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setDateFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              dateFilter === 'all'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Semua Periode
          </button>
          <button
            onClick={() => setDateFilter('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              dateFilter === 'month'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Bulan Ini
          </button>
          <button
            onClick={() => setDateFilter('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              dateFilter === 'today'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Hari Ini
          </button>
        </div>
      </div>

      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Omzet */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Omzet</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            {formatRupiah(totalGrossRevenue)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-500 font-semibold mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{salesOrders.length} transaksi penjualan</span>
          </div>
        </div>

        {/* Laba Bersih Estimasi */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Laba Bersih</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
            {formatRupiah(estimatedNetProfit)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">
            Margin Bersih: <span className="text-emerald-500">{netMarginPercent.toFixed(1)}%</span>
          </div>
        </div>

        {/* Penjualan Hari Ini */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Hari Ini</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            {formatRupiah(todayRevenue)}
          </div>
          <div className="text-[11px] text-indigo-500 font-semibold mt-1">
            {todayUnits} pcs frame & paket kacamata
          </div>
        </div>

        {/* Saldo Kas Toko vs Escrow MP */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Kas & Escrow MP</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            Kas: <span className="text-sky-500">{formatRupiah(store.cashOnHand)}</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 truncate">
            Escrow: <span className="text-amber-500 font-bold">{formatRupiah(store.escrowBalance)}</span>
          </div>
        </div>

        {/* Lab Faset Output */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Lab Faset Lensa</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-purple-600 dark:text-purple-400">
            {fasetCompleted} Pasang Selesai
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            {fasetInProcess} proses • {fasetPending} antrean
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Pintasan Cepat Operasional Optik
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => onNavigate('sales')}
            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 hover:bg-sky-50/30 dark:hover:bg-sky-950/20 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Catat Penjualan</div>
            <div className="text-[10px] text-slate-400">Live & Offline Walk-in</div>
          </button>

          <button
            onClick={() => onNavigate('faset')}
            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 hover:bg-purple-50/30 dark:hover:bg-purple-950/20 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Wrench className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Lab Faset Lensa</div>
            <div className="text-[10px] text-slate-400">Antrean & QC Resep</div>
          </button>

          <button
            onClick={() => onNavigate('inventory')}
            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Glasses className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Stok & HPP</div>
            <div className="text-[10px] text-slate-400">Kalkulasi HPP Riil</div>
          </button>

          <button
            onClick={() => onNavigate('attendance')}
            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Presensi Shift</div>
            <div className="text-[10px] text-slate-400">Jam Masuk / Pulang</div>
          </button>

          <button
            onClick={() => onNavigate('payroll')}
            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:bg-amber-50/30 dark:hover:bg-amber-950/20 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Gaji & Komisi</div>
            <div className="text-[10px] text-slate-400">Tier Rule & Slip Gaji</div>
          </button>

          <button
            onClick={() => onNavigate('ai')}
            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-pink-500/50 hover:bg-pink-50/30 dark:hover:bg-pink-950/20 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">AI Evaluasi</div>
            <div className="text-[10px] text-slate-400">Analisis Kinerja Gemini</div>
          </button>
        </div>
      </div>

      {/* AI Business Insights Widget */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-indigo-950/30 via-slate-900/50 to-sky-950/20 border border-indigo-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-500 text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                AI Optical Business Advisor
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Gemini Flash 3.8
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rekomendasi taktis untuk menaikkan omzet live, margin lensa, dan efisiensi lab optik
              </p>
            </div>
          </div>
          <button
            onClick={handleFetchAiInsight}
            disabled={isLoadingAi}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all shrink-0"
          >
            {isLoadingAi ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Menganalisis...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>{aiInsight ? 'Refresh Insight AI' : 'Generate Insight Toko'}</span>
              </>
            )}
          </button>
        </div>

        {aiInsight ? (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-white/50 dark:bg-slate-800/60 border border-indigo-500/20 text-xs font-semibold text-indigo-600 dark:text-indigo-300">
              💡 {aiInsight.headline}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {aiInsight.recommendations?.map((rec: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-500">
                      {rec.category}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {rec.impact}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                    {rec.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {rec.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 dark:text-slate-500 italic py-2">
            Klik tombol "Generate Insight Toko" untuk mendapatkan rekomendasi AI terkini berbasis data lab faset, penjualan live stream, dan margin HPP toko optik Anda.
          </div>
        )}
      </div>

      {/* Two Column Grid: Lab Faset Status & Live Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Antrean Lab Faset Aktif */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-purple-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Status Antrean Lab Faset Kacamata
              </h3>
            </div>
            <button
              onClick={() => onNavigate('faset')}
              className="text-xs font-semibold text-sky-500 hover:underline"
            >
              Lihat Semua Lab →
            </button>
          </div>

          <div className="space-y-2.5">
            {fasetOrders.slice(0, 4).map((f) => (
              <div
                key={f.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">
                    {f.customerName} • <span className="text-slate-400 font-normal">{f.orderNumber}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {f.frameName} ({f.lensType})
                  </div>
                  <div className="text-[10px] text-sky-600 dark:text-sky-400 font-mono mt-0.5">
                    {f.prescription?.rightEye ? `R: ${f.prescription.rightEye.sph || '0'} C${f.prescription.rightEye.cyl || '0'} A${f.prescription.rightEye.axis || '0'}` : 'R: -'} | {f.prescription?.leftEye ? `L: ${f.prescription.leftEye.sph || '0'} C${f.prescription.leftEye.cyl || '0'}` : 'L: -'}
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      f.status === 'Selesai & Siap'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : f.status === 'QC Akurasi'
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        : f.status === 'Proses Faset'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}
                  >
                    {f.status}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Insentif: {formatRupiah(f.technicianIncentive)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transaksi Penjualan Terkini & Kanal Live */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Aktivitas Penjualan & Live Streaming
              </h3>
            </div>
            <button
              onClick={() => onNavigate('sales')}
              className="text-xs font-semibold text-sky-500 hover:underline"
            >
              Kelola Penjualan →
            </button>
          </div>

          <div className="space-y-2.5">
            {salesOrders.slice(0, 4).map((sale) => (
              <div
                key={sale.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {sale.customerName}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-500 border border-sky-500/20">
                      {sale.channel}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[220px]">
                    {(sale.items || []).map((i) => `${i?.productName || 'Produk'} (x${i?.qty || 1})`).join(', ')}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-black text-slate-900 dark:text-white">
                    {formatRupiah(sale.grossAmount)}
                  </div>
                  <div className="text-[10px] text-emerald-500 font-semibold">
                    Net: {formatRupiah(sale.netRevenue)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Warning Alert if Low Stock */}
      {lowStockProducts.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-600 dark:text-amber-400">
                Peringatan Stok Kritis ({lowStockProducts.length} Produk)
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Beberapa frame dan lensa optik telah menyentuh batas minimum stok. Segera hubungi distributor lensa/frame.
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('inventory')}
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors shrink-0"
          >
            Restock Sekarang
          </button>
        </div>
      )}
    </div>
  );
};
