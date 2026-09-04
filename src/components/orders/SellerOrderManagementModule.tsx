import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MarketplaceOrder, HomeVisitStatus } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import {
  ShoppingBag,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Wrench,
  AlertCircle,
  Search,
  Filter,
  Eye,
  User,
  Phone,
  MapPin,
  Calendar,
  XCircle,
  Home,
  Check,
  ChevronRight,
  Send,
  Sparkles
} from 'lucide-react';

export const SellerOrderManagementModule: React.FC = () => {
  const {
    store,
    marketplaceOrders,
    updateMarketplaceOrderStatus,
    homeVisitRequests,
    updateHomeVisitStatus,
    showToast
  } = useApp();

  // Sub-tab: 'orders' (Pesanan Marketplace) or 'home_visits' (Layanan Periksa ke Rumah)
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'home_visits'>('orders');

  // Filter status for marketplace orders
  const [orderFilter, setOrderFilter] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Home visit status filter
  const [homeVisitFilter, setHomeVisitFilter] = useState<string>('semua');

  // Filter orders strictly for this store (Privacy guarantee!)
  const storeOrders = marketplaceOrders.filter((o) => {
    // If order has storeId, match store.id. Otherwise allow if matching storeName
    const isThisStore = o.storeId === store.id || (!o.storeId && o.storeName === store.name);
    if (!isThisStore) return false;

    if (orderFilter !== 'semua' && o.orderStatus !== orderFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNo = o.orderNo.toLowerCase().includes(q);
      const matchCust = (o.customerName || o.buyerName || '').toLowerCase().includes(q);
      const matchItem = o.items.some((i) => i.productName.toLowerCase().includes(q));
      return matchNo || matchCust || matchItem;
    }

    return true;
  });

  // Filter home visit requests for this store
  const storeHomeVisits = homeVisitRequests.filter((r) => {
    const isThisStore = r.storeId === store.id || (!r.storeId && r.storeName === store.name);
    if (!isThisStore) return false;
    if (homeVisitFilter !== 'semua' && r.status !== homeVisitFilter) return false;
    return true;
  });

  // Counts for order tabs
  const countPending = marketplaceOrders.filter((o) => (o.storeId === store.id) && o.orderStatus === 'menunggu_konfirmasi').length;
  const countFaset = marketplaceOrders.filter((o) => (o.storeId === store.id) && o.orderStatus === 'sedang_difaset').length;
  const countDelivery = marketplaceOrders.filter((o) => (o.storeId === store.id) && o.orderStatus === 'sedang_diantar').length;
  const countDone = marketplaceOrders.filter((o) => (o.storeId === store.id) && o.orderStatus === 'selesai').length;

  const countHVAction = homeVisitRequests.filter((r) => (r.storeId === store.id) && ['menunggu_konfirmasi', 'dikonfirmasi', 'sedang_dijalan'].includes(r.status)).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-sky-200 text-xs font-semibold mb-1">
            <ShoppingBag className="w-4 h-4" />
            <span>Manajemen Transaksi & Layanan Pelanggan</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            Pesanan Masuk & Layanan Periksa ke Rumah
          </h2>
          <p className="text-xs text-sky-100 mt-1 max-w-xl">
            Atur status pesanan konsumen: Menunggu Konfirmasi → Faset Lab → Pengantaran Kurir Toko → Selesai.
            <span className="font-bold underline ml-1">Stok produk toko akan otomatis dipotong saat pesanan diset Selesai.</span>
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex bg-white/10 p-1.5 rounded-xl border border-white/20 shrink-0">
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'orders'
                ? 'bg-white text-sky-900 shadow-md'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Pesanan Konsumen</span>
            {countPending > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold">
                {countPending}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('home_visits')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'home_visits'
                ? 'bg-white text-indigo-900 shadow-md'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Periksa ke Rumah</span>
            {countHVAction > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-900 text-[10px] font-mono font-bold">
                {countHVAction}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* SUB-TAB: PESANAN KONSUMEN */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {[
              { id: 'semua', label: 'Semua Pesanan', count: marketplaceOrders.filter(o => o.storeId === store.id).length },
              { id: 'menunggu_konfirmasi', label: 'Menunggu Konfirmasi', count: countPending, color: 'text-amber-500' },
              { id: 'sedang_difaset', label: 'Sedang Difaset Lab', count: countFaset, color: 'text-sky-500' },
              { id: 'sedang_diantar', label: 'Sedang Diantar (Kurir)', count: countDelivery, color: 'text-indigo-500' },
              { id: 'selesai', label: 'Selesai (Stok Dipotong)', count: countDone, color: 'text-emerald-500' },
              { id: 'dibatalkan', label: 'Dibatalkan', count: marketplaceOrders.filter(o => o.storeId === store.id && o.orderStatus === 'dibatalkan').length, color: 'text-rose-500' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setOrderFilter(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer border ${
                  orderFilter === tab.id
                    ? 'bg-sky-600 border-sky-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    orderFilter === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor faktur INV, nama konsumen, atau nama produk..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-sky-500 shadow-xs"
            />
          </div>

          {/* Orders Listing */}
          {storeOrders.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <Package className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Belum ada pesanan pada status ini
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Saat konsumen melakukan checkout di marketplace Eye Hub, pesanan akan muncul di sini untuk dikonfirmasi.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {storeOrders.map((order) => {
                const isPending = order.orderStatus === 'menunggu_konfirmasi';
                const isFaset = order.orderStatus === 'sedang_difaset';
                const isDelivery = order.orderStatus === 'sedang_diantar';
                const isDone = order.orderStatus === 'selesai';
                const isCancelled = order.orderStatus === 'dibatalkan';

                return (
                  <div
                    key={order.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    {/* Top Row: Invoice, Date, & Status Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                          #{order.orderNo}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          • {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Clock className="w-3.5 h-3.5" />
                            Menunggu Konfirmasi Seller
                          </span>
                        )}
                        {isFaset && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                            <Wrench className="w-3.5 h-3.5" />
                            Sedang Difaset di Lab
                          </span>
                        )}
                        {isDelivery && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                            <Truck className="w-3.5 h-3.5" />
                            Sedang Diantar (Kurir Toko)
                          </span>
                        )}
                        {isDone && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Selesai (Stok Dipotong)
                          </span>
                        )}
                        {isCancelled && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            <XCircle className="w-3.5 h-3.5" />
                            Dibatalkan
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle: Customer Details & Order Items */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Customer info */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1.5 text-xs">
                        <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-sky-500" />
                          <span>{order.customerName || order.buyerName || 'Konsumen'}</span>
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{order.customerPhone || '-'}</span>
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{order.shippingAddress || 'Alamat tidak dicantumkan'}</span>
                        </div>
                        <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
                          <div className="text-slate-500">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Pengiriman: </span>
                            <span>Kurir Toko Sekitar ({formatRupiah(order.shippingFee || store.localDeliveryFee || 10000)})</span>
                          </div>
                          <div className="text-slate-500">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Pembayaran: </span>
                            <span>{order.paymentMethod || 'Transfer'}</span>
                          </div>
                          {(order.paymentMethod === 'Virtual Account' || order.vaNumber || order.virtualAccountNumber) && (
                            <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/40 text-[10px] space-y-0.5">
                              <div className="font-bold text-sky-800 dark:text-sky-300">
                                VA {order.bankName || (order.selectedBank ? `Bank ${order.selectedBank}` : 'Virtual Account')}
                              </div>
                              <div className="font-mono text-sky-700 dark:text-sky-400 font-bold">
                                {order.virtualAccountNumber || order.vaNumber || '-'}
                              </div>
                              <div className="flex items-center gap-1 font-semibold">
                                <span>Status Gateway: </span>
                                {order.paymentStatus === 'PAID' ? (
                                  <span className="text-emerald-600 dark:text-emerald-400">LUNAS (Terverifikasi)</span>
                                ) : (
                                  <span className="text-amber-600 dark:text-amber-400">Menunggu Webhook</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Items list */}
                      <div className="md:col-span-2 space-y-2">
                        <div className="space-y-2">
                          {order.items.map((item, idx) => {
                            const q = (item as any).quantity || item.qty || 1;
                            return (
                              <div
                                key={idx}
                                className="flex items-start justify-between gap-3 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs"
                              >
                                <div className="space-y-1">
                                  <div className="font-bold text-slate-900 dark:text-white">
                                    {item.productName}
                                  </div>
                                  <div className="text-[11px] text-slate-500">
                                    Jumlah: <span className="font-semibold text-slate-700 dark:text-slate-300">{q} pcs</span> × {formatRupiah(item.price)}
                                  </div>
                                  {/* Custom prescription if attached */}
                                  {item.prescription && (
                                    <div className="mt-1 p-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-[11px] text-sky-900 dark:text-sky-300">
                                      <span className="font-bold">Resep Lensa: </span>
                                      <span>OD: Sph {item.prescription.od?.sph || '0.00'} Cyl {item.prescription.od?.cyl || '0.00'} Ax {item.prescription.od?.axis || '-'} | </span>
                                      <span>OS: Sph {item.prescription.os?.sph || '0.00'} Cyl {item.prescription.os?.cyl || '0.00'} Ax {item.prescription.os?.axis || '-'} | </span>
                                      <span>PD: {item.prescription.pd || '62mm'}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                  {formatRupiah(item.price * q)}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Subtotal summary */}
                        <div className="flex items-center justify-between text-xs pt-1 px-1">
                          <span className="text-slate-500">Total Pembayaran Konsumen:</span>
                          <span className="font-black text-sm text-sky-600 dark:text-sky-400">
                            {formatRupiah(order.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Pipeline: Seller controls */}
                    {!isCancelled && !isDone && (
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                        <div className="text-xs text-slate-500">
                          {isPending && 'Langkah 1: Konfirmasi pesanan untuk diproses di lab faset optik.'}
                          {isFaset && 'Langkah 2: Setelah lensa selesai difaset, serahkan ke kurir toko untuk diantar.'}
                          {isDelivery && 'Langkah 3: Setelah barang diterima konsumen, klik Selesaikan Pesanan untuk memotong stok toko.'}
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Cancel button */}
                          <button
                            onClick={() => {
                              if (window.confirm(`Batalkan pesanan #${order.orderNo}?`)) {
                                updateMarketplaceOrderStatus(order.id, 'dibatalkan');
                              }
                            }}
                            className="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition-all cursor-pointer"
                          >
                            Batalkan Pesanan
                          </button>

                          {/* Pipeline advance buttons */}
                          {isPending && (
                            <button
                              onClick={() => updateMarketplaceOrderStatus(order.id, 'sedang_difaset')}
                              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                              <span>Konfirmasi & Proses Faset Lab</span>
                            </button>
                          )}

                          {isFaset && (
                            <button
                              onClick={() => updateMarketplaceOrderStatus(order.id, 'sedang_diantar')}
                              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Kirim Pesanan (Kurir Toko)</span>
                            </button>
                          )}

                          {isDelivery && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Selesaikan pesanan #${order.orderNo}? Stok produk toko akan langsung otomatis dipotong.`)) {
                                  updateMarketplaceOrderStatus(order.id, 'selesai');
                                }
                              }}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Selesaikan Pesanan & Potong Stok</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB: PERIKSA KE RUMAH (HOME VISITS) */}
      {activeSubTab === 'home_visits' && (
        <div className="space-y-4">
          {/* Status filter tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {[
              { id: 'semua', label: 'Semua Permintaan', count: storeHomeVisits.length },
              { id: 'menunggu_konfirmasi', label: 'Menunggu Konfirmasi', count: storeHomeVisits.filter(r => r.status === 'menunggu_konfirmasi').length },
              { id: 'dikonfirmasi', label: 'Dikonfirmasi', count: storeHomeVisits.filter(r => r.status === 'dikonfirmasi').length },
              { id: 'sedang_dijalan', label: 'Sedang di Jalan', count: storeHomeVisits.filter(r => r.status === 'sedang_dijalan').length },
              { id: 'sudah_sampai', label: 'Sudah Sampai di Rumah', count: storeHomeVisits.filter(r => r.status === 'sudah_sampai').length },
              { id: 'selesai', label: 'Selesai', count: storeHomeVisits.filter(r => r.status === 'selesai').length }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setHomeVisitFilter(t.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer border ${
                  homeVisitFilter === t.id
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <span>{t.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    homeVisitFilter === t.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {storeHomeVisits.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <Home className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Belum ada permintaan periksa ke rumah
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Konsumen di sekitar optik dapat mengajukan permohonan kunjungan refraksi mata ke rumah melalui aplikasi.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {storeHomeVisits.map((req) => {
                return (
                  <div
                    key={req.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
                  >
                    {/* Header: Request ID, Date & Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                          #{req.requestNo}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          • Diajukan: {new Date(req.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Status indicator */}
                      <div>
                        {req.status === 'menunggu_konfirmasi' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Clock className="w-3.5 h-3.5" />
                            Menunggu Konfirmasi
                          </span>
                        )}
                        {req.status === 'dikonfirmasi' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                            <Check className="w-3.5 h-3.5" />
                            Jadwal Dikonfirmasi
                          </span>
                        )}
                        {req.status === 'sedang_dijalan' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 animate-pulse">
                            <Truck className="w-3.5 h-3.5" />
                            Petugas Sedang di Jalan
                          </span>
                        )}
                        {req.status === 'sudah_sampai' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            <MapPin className="w-3.5 h-3.5" />
                            Sudah Sampai di Lokasi
                          </span>
                        )}
                        {req.status === 'selesai' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Pemeriksaan Selesai
                          </span>
                        )}
                        {req.status === 'dibatalkan' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            <XCircle className="w-3.5 h-3.5" />
                            Dibatalkan
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Body Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span className="font-bold text-slate-900 dark:text-white">{req.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="text-slate-600 dark:text-slate-300">{req.customerPhone}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <span className="text-slate-600 dark:text-slate-300">{req.address}</span>
                        </div>
                      </div>

                      <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Jadwal yang diminta: {req.preferredDate} - {req.preferredTime}</span>
                        </div>
                        {req.complaint && (
                          <div className="text-slate-600 dark:text-slate-400">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Keluhan: </span>
                            <span>{req.complaint}</span>
                          </div>
                        )}
                        {req.staffName && (
                          <div className="text-slate-600 dark:text-slate-400">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Petugas Refraksi: </span>
                            <span>{req.staffName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Pipeline for Seller */}
                    {req.status !== 'selesai' && req.status !== 'dibatalkan' && (
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                        <div className="text-xs text-slate-500">
                          Update status agar konsumen dapat memantau pergerakan petugas optisi secara real-time.
                        </div>

                        <div className="flex items-center gap-2">
                          {req.status === 'menunggu_konfirmasi' && (
                            <button
                              onClick={() => updateHomeVisitStatus(req.id, 'dikonfirmasi', store.name + ' Staff')}
                              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Konfirmasi Jadwal</span>
                            </button>
                          )}

                          {req.status === 'dikonfirmasi' && (
                            <button
                              onClick={() => updateHomeVisitStatus(req.id, 'sedang_dijalan')}
                              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Berangkat (Sedang di Jalan)</span>
                            </button>
                          )}

                          {req.status === 'sedang_dijalan' && (
                            <button
                              onClick={() => updateHomeVisitStatus(req.id, 'sudah_sampai')}
                              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <MapPin className="w-3.5 h-3.5" />
                              <span>Tiba di Lokasi (Sudah Sampai)</span>
                            </button>
                          )}

                          {req.status === 'sudah_sampai' && (
                            <button
                              onClick={() => updateHomeVisitStatus(req.id, 'selesai')}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Selesaikan Pemeriksaan</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (window.confirm('Batalkan permintaan kunjungan ini?')) {
                                updateHomeVisitStatus(req.id, 'dibatalkan');
                              }
                            }}
                            className="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 text-xs font-bold transition-all cursor-pointer"
                          >
                            Tolak / Batal
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
