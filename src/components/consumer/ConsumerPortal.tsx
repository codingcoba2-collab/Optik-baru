import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, MarketplaceOrder, HomeVisitRequest } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import {
  ShoppingBag,
  ShoppingCart,
  Search,
  Filter,
  Star,
  Store,
  Home,
  BookOpen,
  User,
  LogOut,
  MapPin,
  Clock,
  CheckCircle2,
  Truck,
  Wrench,
  XCircle,
  Plus,
  Minus,
  Trash2,
  Calendar,
  Phone,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Eye,
  AlertCircle,
  CreditCard,
  Building2,
  QrCode,
  ArrowRight,
  Send,
  SlidersHorizontal,
  X
} from 'lucide-react';

export const ConsumerPortal: React.FC = () => {
  const {
    currentUser,
    logout,
    products,
    allStores,
    store,
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    checkoutOrder,
    marketplaceOrders,
    cancelMarketplaceOrder,
    homeVisitRequests,
    addHomeVisitRequest,
    cancelHomeVisitRequest,
    showToast
  } = useApp();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'shop' | 'home_visit' | 'my_orders' | 'education'>('shop');

  // Product Catalog Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price_low' | 'price_high'>('popular');

  // Selected Product for Quick Buy / Detail Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedLensTypes, setSelectedLensTypes] = useState<string[]>([]);
  const [hasPrescription, setHasPrescription] = useState(false);
  const [prescriptionOD, setPrescriptionOD] = useState({ sph: '-1.50', cyl: '-0.50', axis: '180' });
  const [prescriptionOS, setPrescriptionOS] = useState({ sph: '-1.75', cyl: '-0.25', axis: '175' });
  const [prescriptionPD, setPrescriptionPD] = useState('62mm');

  // Cart Modal & Checkout State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('Jl. Kenanga No. 12, Kelurahan Sukajadi, RT 02 / RW 05');
  const [receiverPhone, setReceiverPhone] = useState(currentUser?.phone || '081298765432');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank_transfer' | 'qris'>('bank_transfer');
  const [selectedBank, setSelectedBank] = useState<'BCA' | 'Mandiri' | 'BRI'>('BCA');

  // Home Visit Form State
  const [hvStoreId, setHvStoreId] = useState<string>(allStores[0]?.id || store.id);
  const [hvName, setHvName] = useState(currentUser?.fullName || currentUser?.username || 'Danial Ramdhan');
  const [hvPhone, setHvPhone] = useState(currentUser?.phone || '0895621670403');
  const [hvAddress, setHvAddress] = useState('Jl. Merpati No. 45, Kompleks Griya Asri RT 03/RW 08');
  const [hvDate, setHvDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [hvTime, setHvTime] = useState('14:00');
  const [hvComplaint, setHvComplaint] = useState('Mata cepat lelah saat menatap layar komputer, pandangan agak buram untuk melihat jauh');

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'Semua' && p.category !== selectedCategory) return false;
    if (selectedStoreId !== 'all' && p.storeId && p.storeId !== selectedStoreId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchBrand = (p.brand || '').toLowerCase().includes(q);
      const matchCat = (p.category || '').toLowerCase().includes(q);
      return matchName || matchBrand || matchCat;
    }
    return true;
  }).sort((a, b) => {
    const priceA = a.sellingPrice || a.sellPrice || 0;
    const priceB = b.sellingPrice || b.sellPrice || 0;
    if (sortBy === 'price_low') return priceA - priceB;
    if (sortBy === 'price_high') return priceB - priceA;
    return (b.soldCount || 0) - (a.soldCount || 0);
  });

  // Calculate cart subtotal
  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const totalCartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  // Get active seller shipping fee
  const activeSellerObj = allStores.find((s) => s.id === (cart[0]?.storeId || store.id)) || store;
  const deliveryFee = activeSellerObj.localDeliveryFee ?? 10000;
  const checkoutTotal = cartSubtotal + deliveryFee;

  // Filter orders for this consumer
  const myOrders = marketplaceOrders.filter(
    (o) => o.customerId === currentUser?.id || o.customerName === currentUser?.fullName || o.customerName === currentUser?.username
  );

  // Filter home visit requests for this consumer
  const myHomeVisits = homeVisitRequests.filter(
    (r) => r.customerId === currentUser?.id || r.customerName === currentUser?.fullName || r.customerName === currentUser?.username
  );

  // Quick add to cart
  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    addToCart({
      productId: product.id,
      productName: product.name,
      price: product.sellingPrice || product.sellPrice || 0,
      qty: 1,
      image: product.imageUrl || product.image,
      storeId: product.storeId || store.id,
      storeName: product.storeName || store.name
    });
  };

  // Add customized product to cart from modal
  const handleAddCustomizedToCart = () => {
    if (!selectedProduct) return;
    let extraLensCost = 0;
    if (selectedLensTypes.includes('Bluechromic (Anti Radiasi + Photochromic)')) extraLensCost += 150000;
    else if (selectedLensTypes.includes('Anti-Radiasi Blue Ray')) extraLensCost += 100000;
    else if (selectedLensTypes.includes('Photochromic')) extraLensCost += 120000;
    else if (selectedLensTypes.includes('Progresif')) extraLensCost += 250000;

    const basePrice = selectedProduct.sellingPrice || selectedProduct.sellPrice || 0;
    addToCart({
      productId: selectedProduct.id,
      productName: selectedProduct.name + (selectedLensTypes.length > 0 ? ` (+ ${selectedLensTypes.join(', ')})` : ''),
      price: basePrice + extraLensCost,
      qty: 1,
      image: selectedProduct.imageUrl || selectedProduct.image,
      storeId: selectedProduct.storeId || store.id,
      storeName: selectedProduct.storeName || store.name,
      lensCategories: selectedLensTypes,
      prescription: hasPrescription ? {
        od: prescriptionOD,
        os: prescriptionOS,
        pd: prescriptionPD
      } : undefined
    });

    setSelectedProduct(null);
    setIsCartOpen(true);
  };

  // Handle Checkout submission
  const handleProcessCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const firstStoreId = cart[0]?.storeId || store.id;
    const targetStore = allStores.find((s) => s.id === firstStoreId) || store;

    const orderPayload = {
      storeId: targetStore.id,
      storeName: targetStore.name,
      customerId: currentUser?.id || 'cust-direct',
      customerName: currentUser?.fullName || currentUser?.username || 'Konsumen Eye Hub',
      customerPhone: receiverPhone,
      shippingAddress: shippingAddress,
      items: cart.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        qty: i.qty,
        quantity: i.qty,
        price: i.price,
        image: i.image || i.imageUrl,
        storeId: i.storeId,
        storeName: i.storeName,
        selectedCategories: i.lensCategories,
        prescription: i.prescription
      })),
      subtotal: cartSubtotal,
      discountAmount: 0,
      shippingFee: deliveryFee,
      totalAmount: checkoutTotal,
      paymentMethod: paymentMethod,
      selectedBank: paymentMethod === 'bank_transfer' ? selectedBank : undefined,
      courier: 'Kurir Toko',
      shippingRateType: 'Kurir Toko Sekitar'
    };

    const res = await checkoutOrder(orderPayload);
    if (res.success) {
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
      setActiveTab('my_orders');
    }
  };

  // Handle Home Visit submission
  const handleHomeVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const chosenStore = allStores.find((s) => s.id === hvStoreId) || store;

    await addHomeVisitRequest({
      customerId: currentUser?.id || 'cust-user',
      customerName: hvName,
      customerPhone: hvPhone,
      address: hvAddress,
      preferredDate: hvDate,
      preferredTime: hvTime,
      complaint: hvComplaint,
      storeId: chosenStore.id,
      storeName: chosenStore.name
    });

    setHvComplaint('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Header Navigation (Shopee / TikTok Marketplace Bar) */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs pt-6 sm:pt-8 pb-3.5">
        <div className="max-w-7xl w-full mx-auto px-6 sm:px-8 lg:px-12">
          {/* Top Bar with Branding & Role Indicator */}
          <div className="flex items-center justify-between min-h-16 gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-sky-600/30">
                E
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                    eye hub
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                    Marketplace Konsumen
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Belanja Kacamata & Layanan Refraksi Mata
                </p>
              </div>
            </div>

            {/* Middle Search bar */}
            <div className="hidden md:flex flex-1 max-w-xl mx-4">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari frame kacamata, lensa bluechromic, kacamata hitam..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Right actions: Cart & User profile */}
            <div className="flex items-center gap-3">
              {/* Cart button with floating badge */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                title="Keranjang Belanja"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold font-mono">
                    {totalCartCount}
                  </span>
                )}
              </button>

              {/* User menu & logout */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="hidden sm:block text-right text-xs">
                  <div className="font-bold text-slate-900 dark:text-white leading-tight">
                    {currentUser?.fullName || currentUser?.username}
                  </div>
                  <div className="text-[10px] text-slate-400">Konsumen</div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                  title="Keluar Akun"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs (Shopee / TikTok Style Navigation) */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 border-t border-slate-100 dark:border-slate-800/80 no-scrollbar">
            <button
              onClick={() => setActiveTab('shop')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'shop'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Katalog Kacamata</span>
            </button>

            <button
              onClick={() => setActiveTab('home_visit')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'home_visit'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Periksa Mata ke Rumah</span>
              {myHomeVisits.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-900 text-[10px] font-mono">
                  {myHomeVisits.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('my_orders')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'my_orders'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Pesanan Saya</span>
              {myOrders.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono">
                  {myOrders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('education')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'education'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Edukasi Mata & Lensa</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* TAB 1: SHOP / MARKETPLACE (Shopee / TikTok Shop Style) */}
        {activeTab === 'shop' && (
          <div className="space-y-6">
            {/* Promo / Hero Banner */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-700 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-2 text-center sm:text-left">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-xs">
                  Eye Hub Marketplace
                </span>
                <h2 className="text-xl sm:text-2xl font-black">
                  Kacamata Berkualitas & Lensa Presisi dari Optik Terpercaya
                </h2>
                <p className="text-xs text-sky-100 max-w-lg">
                  Beli frame impian, sesuaikan resep lensa, atau panggil optisi kami untuk periksa refraksi mata langsung di rumah Anda.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('home_visit')}
                className="px-4 py-2.5 rounded-xl bg-white text-sky-900 hover:bg-sky-50 font-bold text-xs shadow-md shrink-0 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4 text-indigo-600" />
                <span>Panggil Petugas ke Rumah</span>
              </button>
            </div>

            {/* Filter Bar: Categories, Store Filter, Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                {['Semua', 'Frame', 'Lensa', 'Sunglasses', 'Aksesoris'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Store & Sort Dropdowns */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Store Filter */}
                <div className="relative">
                  <select
                    value={selectedStoreId}
                    onChange={(e) => setSelectedStoreId(e.target.value)}
                    className="text-xs font-semibold py-1.5 pl-3 pr-8 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="all">Semua Toko Optik</option>
                    {allStores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Filter */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-xs font-semibold py-1.5 pl-3 pr-8 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="popular">Terpopuler</option>
                    <option value="price_low">Harga: Termurah</option>
                    <option value="price_high">Harga: Tertinggi</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Shopee / TikTok Shop Style Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Tidak ada produk ditemukan
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Coba ubah kata kunci pencarian atau kategori filter Anda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {filteredProducts.map((product) => {
                  const productStoreName = product.storeName || store.name;
                  const currentPrice = product.sellingPrice || product.sellPrice || 0;
                  const origPrice = product.originalPrice || Math.round(currentPrice * 1.25);
                  const discountPct = origPrice > currentPrice
                    ? Math.round(((origPrice - currentPrice) / origPrice) * 100)
                    : null;

                  return (
                    <div
                      key={product.id}
                      onClick={() => {
                        setSelectedProduct(product);
                        setSelectedLensTypes([]);
                        setHasPrescription(false);
                      }}
                      className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-lg hover:border-sky-300 dark:hover:border-sky-800 transition-all cursor-pointer flex flex-col justify-between"
                    >
                      {/* Product Image Box */}
                      <div className="relative aspect-square w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <img
                          src={product.imageUrl || product.image || 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=600&auto=format&fit=crop&q=80'}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=600&auto=format&fit=crop&q=80';
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Discount Badge */}
                        {discountPct && (
                          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-[10px] font-black bg-rose-500 text-white shadow-xs">
                            -{discountPct}%
                          </span>
                        )}

                        {/* Store Badge */}
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-900/80 text-white backdrop-blur-xs flex items-center gap-1">
                          <Store className="w-2.5 h-2.5" />
                          <span className="truncate max-w-[90px]">{productStoreName}</span>
                        </span>
                      </div>

                      {/* Product Info */}
                      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                        <div>
                          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                            {product.brand || product.category}
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-sky-600 transition-colors">
                            {product.name}
                          </h4>
                        </div>

                        {/* Pricing & Sold Count */}
                        <div className="pt-1">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-black text-sky-600 dark:text-sky-400">
                              {formatRupiah(currentPrice)}
                            </span>
                            {origPrice > currentPrice && (
                              <span className="text-[10px] text-slate-400 line-through">
                                {formatRupiah(origPrice)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-1.5 text-[10px] text-slate-500">
                            <div className="flex items-center gap-1 text-amber-500 font-bold">
                              <Star className="w-3 h-3 fill-amber-400" />
                              <span>{product.rating || '4.9'}</span>
                            </div>
                            <span>Terjual {product.soldCount || 12}+</span>
                          </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          className="w-full mt-2 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-600 hover:text-white text-sky-700 dark:text-sky-300 font-bold text-[11px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Keranjang</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PERIKSA MATA KE RUMAH (Home Visit Request) */}
        {activeTab === 'home_visit' && (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Intro banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Layanan Spesial Eye Hub</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                Pemeriksaan Refraksi Mata Langsung ke Rumah Anda
              </h2>
              <p className="text-xs text-indigo-100 max-w-xl leading-relaxed">
                Tidak sempat ke optik? Petugas optisi berlisensi kami akan datang membawa alat refraksi lengkap, trial lens set, dan pilihan frame untuk Anda coba langsung di rumah dengan nyaman.
              </p>
            </div>

            {/* Two Column Layout: Form vs Active Requests */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form Request */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span>Formulir Permintaan Kunjungan</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Isi jadwal dan alamat rumah Anda di bawah ini
                  </p>
                </div>

                <form onSubmit={handleHomeVisitSubmit} className="space-y-3 text-xs">
                  {/* Store select */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Pilih Optik Terdekat
                    </label>
                    <select
                      value={hvStoreId}
                      onChange={(e) => setHvStoreId(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white font-semibold cursor-pointer"
                    >
                      {allStores.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.phone || 'Tersedia'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Customer Name */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Lengkap Pemohon
                    </label>
                    <input
                      type="text"
                      required
                      value={hvName}
                      onChange={(e) => setHvName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nomor HP / WhatsApp
                    </label>
                    <input
                      type="tel"
                      required
                      value={hvPhone}
                      onChange={(e) => setHvPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Alamat Lengkap Rumah
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={hvAddress}
                      onChange={(e) => setHvAddress(e.target.value)}
                      placeholder="Nama jalan, nomor rumah, RT/RW, patokan lokasi..."
                      className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Pilihan Tanggal
                      </label>
                      <input
                        type="date"
                        required
                        value={hvDate}
                        onChange={(e) => setHvDate(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Jam Kunjungan
                      </label>
                      <input
                        type="time"
                        required
                        value={hvTime}
                        onChange={(e) => setHvTime(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Complaint */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Keluhan Penglihatan (Opsional)
                    </label>
                    <input
                      type="text"
                      value={hvComplaint}
                      onChange={(e) => setHvComplaint(e.target.value)}
                      placeholder="Contoh: Buram melihat jauh, sering pusing, ingin ganti lensa..."
                      className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Kirim Permintaan Kunjungan</span>
                  </button>
                </form>
              </div>

              {/* Active Home Visit Tracking List */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                    <Truck className="w-4 h-4 text-sky-500" />
                    <span>Status Kunjungan Saya</span>
                  </h3>

                  {myHomeVisits.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                      <Home className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                      <p>Belum ada jadwal periksa ke rumah yang diajukan.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myHomeVisits.map((req) => (
                        <div
                          key={req.id}
                          className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2.5 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                              #{req.requestNo}
                            </span>
                            {/* Status badge */}
                            <div>
                              {req.status === 'menunggu_konfirmasi' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600">
                                  Menunggu Konfirmasi
                                </span>
                              )}
                              {req.status === 'dikonfirmasi' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-600">
                                  Jadwal Dikonfirmasi
                                </span>
                              )}
                              {req.status === 'sedang_dijalan' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-600 animate-pulse">
                                  Petugas Sedang di Jalan
                                </span>
                              )}
                              {req.status === 'sudah_sampai' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 font-bold">
                                  Sudah Sampai di Rumah
                                </span>
                              )}
                              {req.status === 'selesai' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                                  Selesai
                                </span>
                              )}
                              {req.status === 'dibatalkan' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600">
                                  Dibatalkan
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1 text-slate-600 dark:text-slate-300">
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-white">Toko: </span>
                              <span>{req.storeName}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-white">Jadwal: </span>
                              <span>{req.preferredDate} ({req.preferredTime})</span>
                            </div>
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-white">Lokasi: </span>
                              <span className="line-clamp-1">{req.address}</span>
                            </div>
                            {req.staffName && (
                              <div className="text-sky-600 font-semibold">
                                Petugas: {req.staffName}
                              </div>
                            )}
                          </div>

                          {/* Cancel option if not completed */}
                          {req.status !== 'selesai' && req.status !== 'dibatalkan' && (
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                              <button
                                onClick={() => {
                                  if (window.confirm('Apakah Anda yakin ingin membatalkan jadwal kunjungan ini?')) {
                                    cancelHomeVisitRequest(req.id, 'Dibatalkan oleh konsumen');
                                  }
                                }}
                                className="text-[11px] font-bold text-rose-500 hover:text-rose-600 cursor-pointer"
                              >
                                Batalkan Kunjungan
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PESANAN SAYA (Order Tracking & Cancellation) */}
        {activeTab === 'my_orders' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Daftar Pesanan Saya
                </h2>
                <p className="text-xs text-slate-500">
                  Pantau proses pembuatan kacamata dan pengantaran oleh kurir toko optik
                </p>
              </div>
            </div>

            {myOrders.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Belum ada pesanan aktif
                </h3>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Temukan frame favorit dan lensa pilihan Anda di katalog marketplace kami.
                </p>
                <button
                  onClick={() => setActiveTab('shop')}
                  className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Mulai Belanja Kacamata
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myOrders.map((order) => {
                  const isPending = order.orderStatus === 'menunggu_konfirmasi';
                  const isFaset = order.orderStatus === 'sedang_difaset';
                  const isDelivery = order.orderStatus === 'sedang_diantar';
                  const isDone = order.orderStatus === 'selesai';
                  const isCancelled = order.orderStatus === 'dibatalkan';

                  return (
                    <div
                      key={order.id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
                    >
                      {/* Top status bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-sky-500" />
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {order.storeName}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            #{order.orderNo}
                          </span>
                        </div>

                        {/* Status badge */}
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
                              Sedang Difaset di Lab Optik
                            </span>
                          )}
                          {isDelivery && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 animate-pulse">
                              <Truck className="w-3.5 h-3.5" />
                              Sedang Diantar (Kurir Toko)
                            </span>
                          )}
                          {isDone && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Pesanan Selesai
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

                      {/* Items */}
                      <div className="space-y-2">
                        {order.items.map((it, idx) => {
                          const q = (it as any).quantity || it.qty || 1;
                          return (
                            <div
                              key={idx}
                              className="flex items-start justify-between text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40"
                            >
                              <div className="space-y-0.5">
                                <div className="font-bold text-slate-900 dark:text-white">
                                  {it.productName}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  {q} barang × {formatRupiah(it.price)}
                                </div>
                              </div>
                              <div className="font-bold text-slate-900 dark:text-white">
                                {formatRupiah(it.price * q)}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Summary & Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="text-xs text-slate-500">
                          Total Bayar: <span className="font-black text-sm text-sky-600 dark:text-sky-400">{formatRupiah(order.totalAmount)}</span>
                          <span className="ml-2 text-[11px] text-slate-400">({order.paymentMethod.toUpperCase()})</span>
                        </div>

                        {/* Consumer cancellation action: Allowed if not completed & not cancelled */}
                        {!isDone && !isCancelled && (
                          <button
                            onClick={() => {
                              if (window.confirm('Batalkan pesanan ini?')) {
                                cancelMarketplaceOrder(order.id, 'Dibatalkan oleh konsumen');
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition-colors cursor-pointer"
                          >
                            Batalkan Pesanan
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: EDUKASI MATA & LENSA */}
        {activeTab === 'education' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg space-y-2">
              <h2 className="text-xl sm:text-2xl font-black">
                Panduan Lengkap Memilih Lensa Kacamata
              </h2>
              <p className="text-xs text-purple-100 max-w-2xl leading-relaxed">
                Kesehatan mata Anda adalah aset paling berharga. Pelajari perbedaan jenis lensa agar kacamata Anda memberikan kenyamanan optimal saat bekerja, berkendara, maupun beraktivitas di luar ruangan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: 'Lensa Bluechromic (All-in-One)',
                  tag: 'Paling Populer',
                  color: 'from-sky-500/10 to-indigo-500/10 border-sky-200 dark:border-sky-800',
                  desc: 'Kombinasi teknologi Anti-Radiasi Blue Ray (menahan sinar biru gadget) dan Photochromic (otomatis menjadi gelap saat terkena sinar matahari). Sangat ideal untuk Anda yang sering di depan laptop sekaligus beraktivitas outdoor.'
                },
                {
                  title: 'Lensa Photochromic',
                  tag: 'Outdoor Friendly',
                  color: 'from-amber-500/10 to-orange-500/10 border-amber-200 dark:border-amber-800',
                  desc: 'Lensa bening di dalam ruangan dan otomatis berubah gelap menjadi sunglasses ketika terpapar sinar UV matahari di luar. Melindungi mata dari silau dan radiasi ultraviolet berbahaya.'
                },
                {
                  title: 'Lensa Anti-Radiasi (Blue Ray Filter)',
                  tag: 'Digital Worker',
                  color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200 dark:border-emerald-800',
                  desc: 'Diformulasikan dengan lapisan khusus pemblokir gelombang sinar biru berbahaya dari layar HP, monitor komputer, dan televisi. Mencegah mata cepat lelah, kering, dan gangguan tidur.'
                },
                {
                  title: 'Lensa Progresif (Multifokal)',
                  tag: 'Usia 40+ / Presbiopia',
                  color: 'from-purple-500/10 to-pink-500/10 border-purple-200 dark:border-purple-800',
                  desc: 'Lensa tanpa batas garis (seamless) yang memiliki 3 zona penglihatan: jauh (jalan/berkendara), menengah (komputer), dan dekat (baca buku). Memberikan transisi penglihatan alami tanpa repot copot pasang kacamata.'
                }
              ].map((item, i) => (
                <div
                  key={i}
                  className={`p-5 rounded-2xl bg-gradient-to-br ${item.color} border bg-white dark:bg-slate-900 shadow-xs space-y-2`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-600 text-white">
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* QUICK VIEW / LENS SELECTION MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 my-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-sky-600 uppercase">
                  {selectedProduct.brand || 'Koleksi Frame Optik'}
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {selectedProduct.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product image & base price */}
            <div className="flex gap-4">
              <img
                src={selectedProduct.imageUrl || selectedProduct.image || 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=600&auto=format&fit=crop&q=80'}
                alt={selectedProduct.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=600&auto=format&fit=crop&q=80';
                }}
                className="w-24 h-24 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
              />
              <div className="text-xs space-y-1">
                <div className="text-slate-400">Harga Frame:</div>
                <div className="text-base font-black text-sky-600">
                  {formatRupiah(selectedProduct.sellingPrice || selectedProduct.sellPrice || 0)}
                </div>
                <div className="text-[11px] text-slate-500">
                  Toko: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedProduct.storeName || store.name}</span>
                </div>
              </div>
            </div>

            {/* Lens upgrade options */}
            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-800 dark:text-slate-200">
                Pilih Upgrade Lensa (Opsional):
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { name: 'Lensa Netral Bawaan (Standard)', price: 0 },
                  { name: 'Anti-Radiasi Blue Ray', price: 100000 },
                  { name: 'Photochromic', price: 120000 },
                  { name: 'Bluechromic (Anti Radiasi + Photochromic)', price: 150000 },
                  { name: 'Progresif', price: 250000 }
                ].map((lens) => {
                  const isChecked = lens.price === 0 ? selectedLensTypes.length === 0 : selectedLensTypes.includes(lens.name);
                  return (
                    <label
                      key={lens.name}
                      onClick={() => {
                        if (lens.price === 0) setSelectedLensTypes([]);
                        else setSelectedLensTypes([lens.name]);
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 font-bold'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input type="radio" checked={isChecked} readOnly />
                        <span>{lens.name}</span>
                      </div>
                      <span className="font-mono text-slate-500">
                        {lens.price > 0 ? `+ ${formatRupiah(lens.price)}` : 'Termasuk'}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Prescription input toggle */}
            <div className="space-y-2 text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={hasPrescription}
                  onChange={(e) => setHasPrescription(e.target.checked)}
                />
                <span>Pasang Resep Minus / Silinder Saya</span>
              </label>

              {hasPrescription && (
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">OD (Kanan) Sph</label>
                      <input
                        type="text"
                        value={prescriptionOD.sph}
                        onChange={(e) => setPrescriptionOD({ ...prescriptionOD, sph: e.target.value })}
                        className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-900 border text-xs text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">Cyl</label>
                      <input
                        type="text"
                        value={prescriptionOD.cyl}
                        onChange={(e) => setPrescriptionOD({ ...prescriptionOD, cyl: e.target.value })}
                        className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-900 border text-xs text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">Axis</label>
                      <input
                        type="text"
                        value={prescriptionOD.axis}
                        onChange={(e) => setPrescriptionOD({ ...prescriptionOD, axis: e.target.value })}
                        className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-900 border text-xs text-center"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">OS (Kiri) Sph</label>
                      <input
                        type="text"
                        value={prescriptionOS.sph}
                        onChange={(e) => setPrescriptionOS({ ...prescriptionOS, sph: e.target.value })}
                        className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-900 border text-xs text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">Cyl</label>
                      <input
                        type="text"
                        value={prescriptionOS.cyl}
                        onChange={(e) => setPrescriptionOS({ ...prescriptionOS, cyl: e.target.value })}
                        className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-900 border text-xs text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">Axis</label>
                      <input
                        type="text"
                        value={prescriptionOS.axis}
                        onChange={(e) => setPrescriptionOS({ ...prescriptionOS, axis: e.target.value })}
                        className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-900 border text-xs text-center"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <button
                onClick={() => setSelectedProduct(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleAddCustomizedToCart}
                className="flex-2 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Tambahkan ke Keranjang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHOPPING CART MODAL */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-end">
          <div className="w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-sky-600" />
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    Keranjang Belanja ({totalCartCount})
                  </h3>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-400 space-y-2">
                  <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p>Keranjang Anda masih kosong</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                            {item.productName}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Toko: {item.storeName || store.name}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="font-black text-sky-600">
                          {formatRupiah(item.price * item.qty)}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">
                          Qty: {item.qty}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Subtotal Belanja:</span>
                  <span className="font-black text-sm text-slate-900 dark:text-white">
                    {formatRupiah(cartSubtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Ongkir Kurir Toko:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {formatRupiah(deliveryFee)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Lanjut ke Pembayaran ({formatRupiah(checkoutTotal)})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span>Konfirmasi Checkout Pesanan</span>
              </h3>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessCheckout} className="space-y-4 text-xs">
              {/* Shipping address */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Alamat Pengiriman
                </label>
                <textarea
                  required
                  rows={2}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
                />
              </div>

              {/* Receiver phone */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor HP Penerima
                </label>
                <input
                  type="tel"
                  required
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
                />
              </div>

              {/* Delivery method: Local store courier */}
              <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800">
                <div className="font-bold text-sky-900 dark:text-sky-300 flex items-center justify-between">
                  <span>Metode Pengiriman: Kurir Toko Sekitar</span>
                  <span>{formatRupiah(deliveryFee)}</span>
                </div>
                <p className="text-[11px] text-sky-700 dark:text-sky-400 mt-1">
                  Pesanan diantar langsung oleh staf kurir toko resmi {activeSellerObj.name}.
                </p>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Metode Pembayaran
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'bank_transfer', label: 'Transfer VA Bank' },
                    { id: 'qris', label: 'QRIS Scan' },
                    { id: 'cod', label: 'COD (Bayar di Tempat)' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                        paymentMethod === m.id
                          ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'bank_transfer' && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    Pilih Bank Rekening Toko
                  </label>
                  <div className="flex gap-2">
                    {['BCA', 'Mandiri', 'BRI'].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setSelectedBank(b as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                          selectedBank === b
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                  {activeSellerObj.bankAccountNumber && (
                    <div className="text-[11px] text-slate-500 pt-1">
                      No Rekening {activeSellerObj.bankName || selectedBank}: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{activeSellerObj.bankAccountNumber}</span> a/n {activeSellerObj.bankAccountHolder || activeSellerObj.name}
                    </div>
                  )}
                </div>
              )}

              {/* Total summary */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600 dark:text-slate-400">Total Pembayaran:</span>
                <span className="text-base font-black text-sky-600 dark:text-sky-400">
                  {formatRupiah(checkoutTotal)}
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Konfirmasi & Buat Pesanan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
