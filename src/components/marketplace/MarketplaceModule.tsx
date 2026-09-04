import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  OpticalProduct,
  MarketplaceOrder,
  CourierType,
  PaymentMethodType,
  ShippingRateType,
  PrescriptionData
} from '../../types';
import { formatRupiah, formatNumber } from '../../utils/formatters';
import {
  ShoppingBag,
  Search,
  Filter,
  Star,
  Truck,
  ShieldCheck,
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle2,
  Clock,
  Sparkles,
  Tag,
  Glasses,
  ChevronRight,
  Package,
  MapPin,
  X,
  Plus,
  Minus,
  Check,
  Receipt,
  ArrowRight
} from 'lucide-react';

export const MarketplaceModule: React.FC = () => {
  const {
    products,
    marketplaceOrders,
    createMarketplaceOrder,
    discountCoupons,
    adsCampaigns,
    userProfile,
    store,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'shop' | 'orders'>('shop');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLensFilter, setSelectedLensFilter] = useState<string>('Semua');
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<OpticalProduct | null>(null);

  // Cart / Checkout State
  const [cartProduct, setCartProduct] = useState<OpticalProduct | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Checkout Form
  const [recipientName, setRecipientName] = useState(userProfile?.fullName || 'Budi Santoso');
  const [recipientPhone, setRecipientPhone] = useState(userProfile?.phone || '081234567890');
  const [recipientAddress, setRecipientAddress] = useState(
    userProfile?.address || 'Jl. Sudirman No. 45, Jakarta Selatan'
  );

  // Shipping & Payment Form
  const [deliveryMethod, setDeliveryMethod] = useState<'kurir_toko' | 'pickup'>('kurir_toko');
  const [deliveryFee, setDeliveryFee] = useState<number>(store.localDeliveryFee || 10000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('QRIS');
  const [appliedCouponCode, setAppliedCouponCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Optical Custom Prescription (for lenses/frame combo)
  const [includePrescription, setIncludePrescription] = useState(false);
  const [rSph, setRSph] = useState('-2.00');
  const [rCyl, setRCyl] = useState('0.00');
  const [rAxis, setRAxis] = useState('0');
  const [rAdd, setRAdd] = useState('');
  const [lSph, setLSph] = useState('-2.00');
  const [lCyl, setLCyl] = useState('0.00');
  const [lAxis, setLAxis] = useState('0');
  const [lAdd, setLAdd] = useState('');
  const [pd, setPd] = useState('64 mm');

  const calculatedShippingCost = deliveryMethod === 'kurir_toko' ? deliveryFee : 0;

  const subtotal = cartProduct ? cartProduct.sellingPrice * quantity : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + calculatedShippingCost);

  const handleApplyCoupon = () => {
    if (!appliedCouponCode.trim()) return;
    const coupon = discountCoupons.find(
      (c) => c.code.toUpperCase() === appliedCouponCode.trim().toUpperCase() && c.active
    );

    if (!coupon) {
      showToast('Kode voucher kupon tidak valid atau sudah kadaluarsa', 'error');
      setDiscountAmount(0);
      return;
    }

    if (subtotal < coupon.minPurchase) {
      showToast(`Minimal belanja untuk voucher ini adalah ${formatRupiah(coupon.minPurchase)}`, 'warning');
      return;
    }

    let cut = 0;
    if (coupon.type === 'percentage') {
      cut = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount && cut > coupon.maxDiscount) {
        cut = coupon.maxDiscount;
      }
    } else {
      cut = coupon.value;
    }

    setDiscountAmount(cut);
    showToast(`Voucher berhasil dipakai! Potongan ${formatRupiah(cut)}`, 'success');
  };

  const handleOpenCheckout = (product: OpticalProduct) => {
    setCartProduct(product);
    setQuantity(1);
    setDiscountAmount(0);
    setAppliedCouponCode('');
    setIsCheckoutOpen(true);
  };

  const handleProcessOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cartProduct) return;

    if (!recipientName.trim() || !recipientAddress.trim() || !recipientPhone.trim()) {
      showToast('Mohon lengkapi nama, nomor telepon, dan alamat pengiriman', 'warning');
      return;
    }

    const prescriptionData: PrescriptionData | undefined = includePrescription
      ? {
          rightEye: { sph: rSph, cyl: rCyl, axis: rAxis, add: rAdd || undefined },
          leftEye: { sph: lSph, cyl: lCyl, axis: lAxis, add: lAdd || undefined },
          pd,
          lensTypeRequested: cartProduct.name
        }
      : undefined;

    await createMarketplaceOrder({
      storeId: cartProduct.storeId,
      storeName: cartProduct.storeName || store.name,
      buyerId: userProfile?.uid || 'buyer-consumer',
      buyerName: recipientName,
      buyerPhone: recipientPhone,
      shippingAddress: recipientAddress,
      items: [
        {
          productId: cartProduct.id,
          productName: cartProduct.name,
          sku: cartProduct.sku,
          price: cartProduct.sellingPrice,
          quantity,
          subtotal,
          lensCategories: cartProduct.lensCategories,
          prescription: prescriptionData
        }
      ],
      subtotal,
      shippingCost: calculatedShippingCost,
      discountAmount,
      totalAmount: grandTotal,
      courier: deliveryMethod === 'kurir_toko' ? 'Kurir Toko' : 'Ambil di Toko',
      shippingRateType: 'manual',
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'unpaid' : 'paid',
      orderStatus: 'waiting_confirmation'
    });

    setIsCheckoutOpen(false);
    setActiveTab('orders');
    showToast('Pesanan berhasil dibuat! Segera diproses toko optik.', 'success');
  };

  // Sort sponsored/ad products to top
  const activeAdProductIds = new Set(
    adsCampaigns.filter((a) => a.status === 'active').map((a) => a.productId)
  );

  const filteredProducts = products.filter((p) => {
    const matchesFilter =
      selectedLensFilter === 'Semua' ||
      (p.lensCategories && p.lensCategories.includes(selectedLensFilter as any));
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.coating && p.coating.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  // Put ads on top
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aIsAd = activeAdProductIds.has(a.id);
    const bIsAd = activeAdProductIds.has(b.id);
    if (aIsAd && !bIsAd) return -1;
    if (!aIsAd && bIsAd) return 1;
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Marketplace Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 p-6 border border-sky-800/50 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-500/30 mb-2">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>OpticHub Marketplace Konsumen & Seller</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Katalog Kacamata, Lensa & Frame Optik Terpercaya
            </h1>
            <p className="text-xs text-sky-200/80 max-w-xl mt-1">
              Pesan kacamata langsung dengan preskripsi akurat. Pilihan pengiriman J&T, JNE, SiCepat, GoSend, GrabExpress dengan pembayaran COD, Transfer, atau QRIS.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-700 self-start md:self-auto shrink-0">
            <button
              onClick={() => setActiveTab('shop')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'shop'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Belanja Kacamata
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Pesanan Saya ({marketplaceOrders.length})</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'shop' ? (
        <div className="space-y-4">
          {/* Search & Lens Filter Bar (Tokopedia/Shopee style) */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari frame titanium, lensa blueray, photochromic, progressive..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-sky-500"
              />
            </div>

            {/* Quick Lens Category Tags */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 font-semibold shrink-0 text-[11px] flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-sky-400" /> Kategori Lensa:
              </span>
              {[
                'Semua',
                'Single vision',
                'Blueray',
                'Photochromic',
                'Progressive',
                'Bifocal',
                'Sunglasses',
                'Plano'
              ].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedLensFilter(cat)}
                  className={`px-3 py-1 rounded-lg font-semibold shrink-0 transition-all cursor-pointer ${
                    selectedLensFilter === cat
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid (Shopee / Tokopedia Card Style) */}
          {sortedProducts.length === 0 ? (
            <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center">
              <Glasses className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white mb-1">Katalog Masih Kosong</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {products.length === 0
                  ? 'Data dimulai dari awal (kosong). Tambahkan produk di menu Stok Lensa / Frame untuk melihatnya di etalase marketplace.'
                  : 'Tidak ada produk yang sesuai dengan filter pencarian.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {sortedProducts.map((p) => {
                const isSponsored = activeAdProductIds.has(p.id);
                return (
                  <div
                    key={p.id}
                    className="bg-slate-900/80 border border-slate-800 hover:border-sky-500/50 rounded-2xl overflow-hidden flex flex-col justify-between transition-all group shadow-md hover:shadow-sky-500/10"
                  >
                    {/* Visual Card Top */}
                    <div className="relative aspect-4/3 bg-linear-to-br from-slate-800 to-slate-850 p-4 flex items-center justify-center">
                      <Glasses className="w-12 h-12 text-sky-400/80 group-hover:scale-110 transition-transform duration-300" />

                      {isSponsored && (
                        <div className="absolute top-2 left-2 bg-amber-500/90 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider">
                          Iklan
                        </div>
                      )}

                      <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs text-sky-400 font-bold text-[10px] px-2 py-0.5 rounded-full border border-sky-500/20">
                        {p.unit}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3.5 flex flex-col flex-1 justify-between space-y-2 text-xs">
                      <div>
                        {/* Lens Tags */}
                        <div className="flex flex-wrap gap-1 mb-1.5">
                          {(p.lensCategories || []).slice(0, 2).map((lc) => (
                            <span
                              key={lc}
                              className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20"
                            >
                              {lc}
                            </span>
                          ))}
                        </div>

                        <h3 className="font-bold text-white text-xs line-clamp-2 leading-snug group-hover:text-sky-300 transition-colors">
                          {p.name}
                        </h3>

                        {p.sph && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Sph: {p.sph} • Cyl: {p.cyl}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-800">
                        <div className="text-emerald-400 font-black text-sm">
                          {formatRupiah(p.sellingPrice)}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                          <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {p.rating || 4.9}
                          </span>
                          <span>Terjual {p.soldCount || 12}</span>
                        </div>

                        <button
                          onClick={() => handleOpenCheckout(p)}
                          className="w-full mt-2.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] shadow-sm shadow-sky-600/30 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Beli Sekarang</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* TAB 2: PESANAN SAYA / ORDER TRACKING */
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-white mb-1">Daftar Transaksi & Pengiriman Marketplace</h3>
            <p className="text-xs text-slate-400">
              Pantau status pemrosesan lab faset, verifikasi pembayaran, serta resi ekspedisi kurir.
            </p>
          </div>

          {marketplaceOrders.length === 0 ? (
            <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center">
              <Package className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white mb-1">Belum Ada Transaksi</h3>
              <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
                Silakan pilih kacamata atau lensa di katalog etalase dan lakukan checkout dengan opsi kurir pilihan Anda.
              </p>
              <button
                onClick={() => setActiveTab('shop')}
                className="py-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Mulai Belanja</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {marketplaceOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-400">{ord.orderNumber || ord.orderNo}</span>
                      <span className="text-[10px] text-slate-400">• {new Date(ord.createdAt).toLocaleDateString('id-ID')}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          ord.paymentStatus === 'paid' || ord.paymentStatus === 'terverifikasi'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {ord.paymentStatus === 'paid' || ord.paymentStatus === 'terverifikasi' ? 'Lunas' : 'Belum Bayar (COD)'}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-white">
                      {(ord.items || []).map((it) => `${it.productName} (${it.quantity || it.qty || 1}x)`).join(', ')}
                    </div>

                    <div className="text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-sky-400" />
                        Kurir: <strong className="text-slate-200">{ord.courier || 'J&T'}</strong> (
                        {ord.shippingRateType === 'auto' ? 'Tarif Otomatis' : 'Tarif Manual'})
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                        Metode: <strong className="text-slate-200">{ord.paymentMethod}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        Tujuan: {ord.buyerName || ord.customerName} ({ord.shippingAddress})
                      </span>
                    </div>
                  </div>

                  <div className="text-right border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
                    <div className="text-[10px] text-slate-400">Total Pembayaran</div>
                    <div className="text-base font-black text-emerald-400">
                      {formatRupiah(ord.totalAmount)}
                    </div>
                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      {ord.orderStatus === 'waiting_confirmation' || ord.orderStatus === 'menunggu_pembayaran'
                        ? 'Menunggu Konfirmasi'
                        : ord.orderStatus === 'in_lab' || ord.orderStatus === 'faset'
                        ? 'Proses Lab Faset'
                        : ord.orderStatus === 'shipped' || ord.orderStatus === 'dikirim'
                        ? 'Sedang Dikirim'
                        : 'Selesai'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CHECKOUT MODAL (Sistem COD, Transfer, QRIS & Pilihan Jasa Kirim J&T, JNE, SiCepat, GoSend, Grab) */}
      {isCheckoutOpen && cartProduct && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl my-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">Checkout Pembelian Kacamata</h3>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProcessOrder} className="space-y-4 text-xs">
              {/* Product Summary */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-750 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                    <Glasses className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">{cartProduct.name}</h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formatRupiah(cartProduct.sellingPrice)} / {cartProduct.unit}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-bold text-white px-1.5">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Optical Prescription Option */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-750 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Preskripsi Resep Kacamata Pasien</span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={includePrescription}
                      onChange={(e) => setIncludePrescription(e.target.checked)}
                      className="rounded text-sky-600"
                    />
                    <span className="font-semibold">Kirim Ukuran Minus/Silinder</span>
                  </label>
                </div>

                {includePrescription && (
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-700">
                    <div className="col-span-4 text-[10px] text-sky-400 font-bold uppercase">
                      R / Kanan (OD)
                    </div>
                    <input
                      type="text"
                      value={rSph}
                      onChange={(e) => setRSph(e.target.value)}
                      placeholder="SPH"
                      className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white text-center font-mono"
                    />
                    <input
                      type="text"
                      value={rCyl}
                      onChange={(e) => setRCyl(e.target.value)}
                      placeholder="CYL"
                      className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white text-center font-mono"
                    />
                    <input
                      type="text"
                      value={rAxis}
                      onChange={(e) => setRAxis(e.target.value)}
                      placeholder="AXIS"
                      className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white text-center font-mono"
                    />
                    <input
                      type="text"
                      value={rAdd}
                      onChange={(e) => setRAdd(e.target.value)}
                      placeholder="ADD"
                      className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white text-center font-mono"
                    />

                    <div className="col-span-4 text-[10px] text-sky-400 font-bold uppercase pt-1">
                      L / Kiri (OS) & Jarak Pupil (PD)
                    </div>
                    <input
                      type="text"
                      value={lSph}
                      onChange={(e) => setLSph(e.target.value)}
                      placeholder="SPH"
                      className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white text-center font-mono"
                    />
                    <input
                      type="text"
                      value={lCyl}
                      onChange={(e) => setLCyl(e.target.value)}
                      placeholder="CYL"
                      className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white text-center font-mono"
                    />
                    <input
                      type="text"
                      value={lAxis}
                      onChange={(e) => setLAxis(e.target.value)}
                      placeholder="AXIS"
                      className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white text-center font-mono"
                    />
                    <input
                      type="text"
                      value={pd}
                      onChange={(e) => setPd(e.target.value)}
                      placeholder="PD (mm)"
                      className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white text-center font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Recipient Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Nama Penerima</label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Nomor WhatsApp / HP</label>
                  <input
                    type="text"
                    required
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-300 mb-1">Alamat Pengiriman Lengkap</label>
                  <textarea
                    rows={2}
                    required
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              {/* PENGIRIMAN: KURIR TOKO (WILAYAH SEKITAR) & AMBIL DI TOKO */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-750 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
                    <Truck className="w-4 h-4 text-sky-400" />
                    Metode Pengiriman (Wilayah Sekitar)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('kurir_toko')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      deliveryMethod === 'kurir_toko'
                        ? 'bg-sky-600/20 border-sky-500 text-white shadow-xs'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="font-bold text-xs text-white">Kurir Toko (Wilayah Sekitar)</div>
                    <div className="text-[11px] text-sky-400 mt-1 font-semibold">
                      Biaya: {formatRupiah(deliveryFee)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Pengantaran langsung oleh staf kurir toko
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('pickup')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      deliveryMethod === 'pickup'
                        ? 'bg-sky-600/20 border-sky-500 text-white shadow-xs'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="font-bold text-xs text-white">Ambil Sendiri di Toko</div>
                    <div className="text-[11px] text-emerald-400 mt-1 font-semibold">Gratis (Rp 0)</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Ambil pesanan langsung di gerai optik
                    </div>
                  </button>
                </div>

                <div className="flex justify-between items-center text-xs text-sky-400 font-semibold pt-1 border-t border-slate-700/60">
                  <span>Ongkos Kirim:</span>
                  <span className="font-bold">{formatRupiah(calculatedShippingCost)}</span>
                </div>
              </div>

              {/* SISTEM PEMBAYARAN (COD, Transfer, QRIS) */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-750 space-y-2">
                <span className="font-bold text-slate-200 block">Metode Pembayaran</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      paymentMethod === 'COD'
                        ? 'bg-amber-600/20 border-amber-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-amber-400" />
                    <span className="font-bold text-xs">COD</span>
                    <span className="text-[10px] text-slate-400">Bayar di Tempat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Transfer')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      paymentMethod === 'Transfer'
                        ? 'bg-sky-600/20 border-sky-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-sky-400" />
                    <span className="font-bold text-xs">Transfer Bank</span>
                    <span className="text-[10px] text-slate-400">BCA / Mandiri / BRI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('QRIS')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      paymentMethod === 'QRIS'
                        ? 'bg-emerald-600/20 border-emerald-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-xs">QRIS Instan</span>
                    <span className="text-[10px] text-slate-400">Gopay/OVO/ShopeePay</span>
                  </button>
                </div>

                {paymentMethod === 'Transfer' && (
                  <div className="p-2.5 rounded-lg bg-sky-950/40 border border-sky-800/40 text-[11px] text-sky-200">
                    Rekening Toko: <strong>BCA 872-019-2311</strong> a/n OpticHub Store. Konfirmasi otomatis.
                  </div>
                )}

                {paymentMethod === 'QRIS' && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-200 flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded p-1 flex items-center justify-center shrink-0">
                      <QrCode className="w-10 h-10 text-slate-900" />
                    </div>
                    <div>
                      <div className="font-bold">QRIS Dinamis Siap Scan</div>
                      <div className="text-[10px] text-emerald-300">
                        Scan via BCA, Mandiri, Livin, GoPay, Dana, OVO setelah konfirmasi.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* VOUCHER DISKON INPUT */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={appliedCouponCode}
                  onChange={(e) => setAppliedCouponCode(e.target.value.toUpperCase())}
                  placeholder="Masukkan Kode Voucher (cth: OPTIKHEBAT)"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  Pakai Kupon
                </button>
              </div>

              {/* Rincian Total */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal ({quantity} barang):</span>
                  <span>{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Ongkos Kirim ({deliveryMethod === 'kurir_toko' ? 'Kurir Toko' : 'Ambil di Toko'}):</span>
                  <span>{formatRupiah(calculatedShippingCost)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Diskon Voucher:</span>
                    <span>- {formatRupiah(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-black text-sm pt-2 border-t border-slate-800">
                  <span>Total Pembayaran:</span>
                  <span className="text-emerald-400">{formatRupiah(grandTotal)}</span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Buat Pesanan Sekarang</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
