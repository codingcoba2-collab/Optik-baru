import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdCampaign, DiscountCoupon } from '../../types';
import { formatRupiah, formatNumber } from '../../utils/formatters';
import {
  Megaphone,
  Percent,
  Plus,
  TrendingUp,
  Tag,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Eye,
  MousePointer,
  Sparkles,
  ShoppingBag,
  Trash2,
  Play,
  Pause,
  X
} from 'lucide-react';

export const AdsDiscountModule: React.FC = () => {
  const {
    products,
    adsCampaigns,
    addAdCampaign,
    toggleAdCampaign,
    deleteAdCampaign,
    discountCoupons,
    addDiscountCoupon,
    toggleDiscountCoupon,
    deleteDiscountCoupon,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'ads' | 'discounts'>('ads');

  // Ad Modal State
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [cpcBid, setCpcBid] = useState<number>(500);
  const [dailyBudget, setDailyBudget] = useState<number>(50000);
  const [keywordsText, setKeywordsText] = useState('kacamata blueray, lensa minus, frame titanium');

  // Discount Modal State
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponName, setCouponName] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minPurchase, setMinPurchase] = useState<number>(100000);
  const [maxDiscount, setMaxDiscount] = useState<number>(50000);
  const [maxQuota, setMaxQuota] = useState<number>(100);

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) {
      showToast('Pilih produk yang ingin diiklankan', 'warning');
      return;
    }

    const keywords = keywordsText
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    await addAdCampaign({
      storeId: prod.storeId,
      productId: prod.id,
      productName: prod.name,
      keywords,
      cpcBid: Number(cpcBid) || 500,
      dailyBudget: Number(dailyBudget) || 50000,
      status: 'active'
    });

    setIsAdModalOpen(false);
    setSelectedProductId('');
    setKeywordsText('kacamata blueray, lensa photochromic');
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      showToast('Kode voucher kupon wajib diisi', 'error');
      return;
    }

    const validDate = new Date();
    validDate.setMonth(validDate.getMonth() + 1);

    await addDiscountCoupon({
      storeId: 'store-active',
      code: couponCode.trim().toUpperCase(),
      name: couponName.trim() || `Promo ${couponCode.toUpperCase()}`,
      type: discountType,
      value: Number(discountValue) || 0,
      minPurchase: Number(minPurchase) || 0,
      maxDiscount: discountType === 'percentage' ? Number(maxDiscount) || 0 : undefined,
      validUntil: validDate.toISOString().split('T')[0],
      maxQuota: Number(maxQuota) || 100,
      active: true
    });

    setIsDiscountModalOpen(false);
    setCouponCode('');
    setCouponName('');
    setDiscountValue(10);
  };

  const totalAdSpent = adsCampaigns.reduce((sum, a) => sum + (a.spent || 0), 0);
  const totalAdRevenue = adsCampaigns.reduce((sum, a) => sum + (a.revenue || 0), 0);
  const totalClicks = adsCampaigns.reduce((sum, a) => sum + (a.clicks || 0), 0);
  const avgRoas = totalAdSpent > 0 ? (totalAdRevenue / totalAdSpent).toFixed(2) : '0.00';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 mb-1">
            <Megaphone className="w-4 h-4" />
            <span>Pemasaran Toko & Marketplace</span>
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">Iklan & Voucher Diskon Toko</h1>
          <p className="text-xs text-slate-400">
            Tingkatkan konversi penjualan marketplace dengan kampanye iklan prioritas dan voucher diskon (persentase / nominal).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'ads' ? (
            <button
              onClick={() => setIsAdModalOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Buat Iklan Produk</span>
            </button>
          ) : (
            <button
              onClick={() => setIsDiscountModalOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Buat Voucher Diskon</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('ads')}
          className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'ads'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Iklan Marketplace ({adsCampaigns.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('discounts')}
          className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'discounts'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>Voucher Diskon ({discountCoupons.length})</span>
        </button>
      </div>

      {/* TAB 1: IKLAN MARKETPLACE */}
      {activeTab === 'ads' && (
        <div className="space-y-4">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] font-semibold text-slate-400">Total Iklan Aktif</span>
              <div className="text-xl font-bold text-sky-400 mt-0.5">
                {adsCampaigns.filter((a) => a.status === 'active').length} Kampanye
              </div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] font-semibold text-slate-400">Total Klik Konsumen</span>
              <div className="text-xl font-bold text-white mt-0.5">{formatNumber(totalClicks)} Klik</div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] font-semibold text-slate-400">Total Biaya Iklan Terpakai</span>
              <div className="text-xl font-bold text-rose-400 mt-0.5">{formatRupiah(totalAdSpent)}</div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] font-semibold text-slate-400">Omzet Atribusi Iklan (ROAS)</span>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">{avgRoas}x</div>
            </div>
          </div>

          {adsCampaigns.length === 0 ? (
            <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center">
              <Megaphone className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white mb-1">Belum Ada Iklan Aktif</h3>
              <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
                Pasang iklan produk kacamata atau lensa Anda agar tampil di urutan teratas etalase konsumen.
              </p>
              <button
                onClick={() => setIsAdModalOpen(true)}
                className="py-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Mulai Iklan Pertama</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {adsCampaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            camp.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {camp.status === 'active' ? '● Aktif Menayangkan' : '❚❚ Dijeda'}
                        </span>
                        <h3 className="text-sm font-bold text-white mt-1.5 line-clamp-1">{camp.productName}</h3>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleAdCampaign(camp.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title={camp.status === 'active' ? 'Jeda Iklan' : 'Aktifkan Iklan'}
                        >
                          {camp.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Hapus kampanye iklan ini?')) {
                              deleteAdCampaign(camp.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                          title="Hapus Iklan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="py-2 space-y-1.5 border-y border-slate-800 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Biaya Per Klik (CPC):</span>
                        <span className="font-bold text-white">{formatRupiah(camp.cpcBid)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Budget Harian:</span>
                        <span className="font-bold text-white">{formatRupiah(camp.dailyBudget)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Total Klik / Terjual:</span>
                        <span className="font-bold text-sky-400">
                          {camp.clicks} Klik • {camp.salesCount} Terjual
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <span className="text-[10px] text-slate-500 block mb-1">Kata Kunci Terpilih:</span>
                      <div className="flex flex-wrap gap-1">
                        {camp.keywords.map((kw, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: VOUCHER DISKON */}
      {activeTab === 'discounts' && (
        <div className="space-y-4">
          {discountCoupons.length === 0 ? (
            <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center">
              <Percent className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white mb-1">Belum Ada Voucher Diskon</h3>
              <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
                Buat voucher diskon persentase (%) atau potongan nominal (Rp) untuk menarik konsumen berbelanja kacamata.
              </p>
              <button
                onClick={() => setIsDiscountModalOpen(true)}
                className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Voucher Pertama</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {discountCoupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tracking-wider">
                          {coupon.code}
                        </span>
                        <h3 className="text-sm font-bold text-white mt-2">{coupon.name}</h3>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleDiscountCoupon(coupon.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title={coupon.active ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          {coupon.active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus kupon "${coupon.code}"?`)) {
                              deleteDiscountCoupon(coupon.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                          title="Hapus Voucher"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="py-2.5 space-y-1.5 border-y border-slate-800 text-xs mt-3">
                      <div className="flex justify-between text-slate-400">
                        <span>Potongan:</span>
                        <span className="font-black text-emerald-400 text-sm">
                          {coupon.type === 'percentage' ? `${coupon.value}% Diskon` : formatRupiah(coupon.value)}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Min. Belanja:</span>
                        <span className="font-bold text-white">{formatRupiah(coupon.minPurchase)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Terpakai / Kuota:</span>
                        <span className="font-semibold text-slate-200">
                          {coupon.usageCount} / {coupon.maxQuota} kali
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Berlaku s/d: {coupon.validUntil}</span>
                    <span className={coupon.active ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {coupon.active ? '● Aktif' : '○ Nonaktif'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Buat Iklan */}
      {isAdModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">Pasang Iklan Produk Toko</h3>
              </div>
              <button
                onClick={() => setIsAdModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAd} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Pilih Produk dari Stok</label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                >
                  <option value="">-- Pilih Produk yang Diiklankan --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatRupiah(p.sellingPrice)}) - Stok: {p.stockQty}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Biaya Per Klik / Bid CPC (Rp)
                </label>
                <input
                  type="number"
                  value={cpcBid}
                  onChange={(e) => setCpcBid(Number(e.target.value))}
                  placeholder="500"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold"
                />
                <span className="text-[10px] text-slate-400">
                  Semakin tinggi bid CPC, produk akan tampil lebih atas di hasil pencarian konsumen.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Batas Budget Iklan Harian (Rp)
                </label>
                <input
                  type="number"
                  value={dailyBudget}
                  onChange={(e) => setDailyBudget(Number(e.target.value))}
                  placeholder="50000"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Kata Kunci Pencarian (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={keywordsText}
                  onChange={(e) => setKeywordsText(e.target.value)}
                  placeholder="kacamata minus, lensa blueray, frame titanium"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-lg shadow-sky-600/30"
                >
                  Mulai Kampanye Iklan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Buat Voucher Diskon */}
      {isDiscountModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Buat Voucher Diskon Toko</h3>
              </div>
              <button
                onClick={() => setIsDiscountModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Kode Voucher</label>
                <input
                  type="text"
                  required
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: OPTIKSERU20"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono font-bold tracking-wider"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Nama Voucher Promo</label>
                <input
                  type="text"
                  value={couponName}
                  onChange={(e) => setCouponName(e.target.value)}
                  placeholder="Contoh: Diskon Pelajar & Mahasiswa"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              {/* Tipe Diskon: Persentase vs Nominal */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Tipe Diskon (Persentase / Nominal)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDiscountType('percentage')}
                    className={`py-2 px-3 rounded-xl font-bold border text-center cursor-pointer ${
                      discountType === 'percentage'
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    Persentase (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('fixed')}
                    className={`py-2 px-3 rounded-xl font-bold border text-center cursor-pointer ${
                      discountType === 'fixed'
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    Nominal Potongan (Rp)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    {discountType === 'percentage' ? 'Besar Persen (%)' : 'Potongan Nilai (Rp)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Minimal Pembelian (Rp)</label>
                  <input
                    type="number"
                    value={minPurchase}
                    onChange={(e) => setMinPurchase(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Maksimal Kuota Pemakaian</label>
                <input
                  type="number"
                  value={maxQuota}
                  onChange={(e) => setMaxQuota(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDiscountModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30"
                >
                  Terbitkan Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
