import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OpticalProduct, OpticalCategory, UnitType, LensCategoryType } from '../../types';
import { formatRupiah, formatNumber } from '../../utils/formatters';
import {
  Glasses,
  Search,
  Plus,
  Filter,
  Layers,
  AlertTriangle,
  Edit2,
  Trash2,
  TrendingUp,
  Calculator,
  CheckCircle,
  X,
  Sparkles,
  Tag,
  Check,
  Image as ImageIcon,
  Video as VideoIcon,
  UploadCloud,
  Play,
  Film
} from 'lucide-react';

const LENS_CATEGORIES: { key: LensCategoryType; label: string; desc: string; color: string }[] = [
  { key: 'Single vision', label: 'Single Vision', desc: 'Fokus tunggal (jauh atau dekat)', color: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
  { key: 'Bifocal', label: 'Bifocal', desc: 'Dua fokus dengan garis batas pembagi', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
  { key: 'Progressive', label: 'Progressive', desc: 'Multifokus bertahap tanpa garis', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  { key: 'Blueray', label: 'Blueray (Blue Cut)', desc: 'Blokir radiasi sinar biru gadget', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  { key: 'Photochromic', label: 'Photochromic', desc: 'Berubah gelap otomatis saat kena sinar UV', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  { key: 'Sunglasses', label: 'Sunglasses Tint', desc: 'Lensa gelap anti silau / UV400', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  { key: 'Plano', label: 'Plano (Netral)', desc: 'Ukuran normal tanpa minus/plus', color: 'bg-slate-500/10 text-slate-300 border-slate-500/30' }
];

export const InventoryModule: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, adjustStock, store } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedLensFilter, setSelectedLensFilter] = useState<string>('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<OpticalProduct | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Quick Stock Adjustment Modal State
  const [quickStockProduct, setQuickStockProduct] = useState<OpticalProduct | null>(null);
  const [quickStockQty, setQuickStockQty] = useState<number>(0);

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<OpticalCategory>('Lensa Kacamata');
  const [subcategory, setSubcategory] = useState('Standard CR-39');
  const [unit, setUnit] = useState<UnitType>('Pasang (Pair)');
  const [stockQty, setStockQty] = useState(20);
  const [minStockAlert, setMinStockAlert] = useState(5);
  const [basePurchasePrice, setBasePurchasePrice] = useState(60000);
  const [edgingCostPerUnit, setEdgingCostPerUnit] = useState(store.defaultExternalFasetCost || 20000);
  const [sellingPrice, setSellingPrice] = useState(180000);
  const [description, setDescription] = useState('');

  // Kategori Lensa Multi-Select
  const [selectedLensCategories, setSelectedLensCategories] = useState<LensCategoryType[]>([
    'Single vision',
    'Blueray'
  ]);

  // Atribut Lensa
  const [sph, setSph] = useState('-2.00');
  const [cyl, setCyl] = useState('0.00');
  const [axis, setAxis] = useState('0');
  const [add, setAdd] = useState('0.00');
  const [coating, setCoating] = useState('Super Hydrophobic Anti-Reflective');
  const [diameter, setDiameter] = useState('70mm');

  // Media (Gambar & Video) State
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'both'>('image');
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);

  const categories: OpticalCategory[] = [
    'Frame Kacamata',
    'Lensa Kacamata',
    'Softlens',
    'Sunglasses',
    'Aksesoris Optik',
  ];

  const units: UnitType[] = ['Pcs', 'Pasang (Pair)', 'Box', 'Lusin', 'Gross'];

  const calculatedRealHpp = basePurchasePrice + edgingCostPerUnit;
  const estimatedMargin = sellingPrice - calculatedRealHpp;
  const marginPercent = sellingPrice > 0 ? (estimatedMargin / sellingPrice) * 100 : 0;

  const toggleLensCategory = (cat: LensCategoryType) => {
    if (selectedLensCategories.includes(cat)) {
      setSelectedLensCategories(selectedLensCategories.filter((c) => c !== cat));
    } else {
      setSelectedLensCategories([...selectedLensCategories, cat]);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormError(null);
    setName('Lensa Single Vision Blueray');
    setSku(`OPT-${Date.now().toString().slice(-4)}`);
    setCategory('Lensa Kacamata');
    setSubcategory('Super Hydrophobic');
    setUnit('Pasang (Pair)');
    setStockQty(20);
    setMinStockAlert(5);
    setBasePurchasePrice(60000);
    setEdgingCostPerUnit(store?.defaultExternalFasetCost || 20000);
    setSellingPrice(180000);
    setDescription('');
    setSelectedLensCategories(['Single vision', 'Blueray']);
    setSph('-2.00');
    setCyl('0.00');
    setAxis('0');
    setAdd('0.00');
    setCoating('Super Hydrophobic Blue Cut');
    setDiameter('70mm');
    setImageUrl('');
    setVideoUrl('');
    setMediaType('image');
    setIsModalOpen(true);
  };

  const applyPreset = (presetType: 'blueray' | 'photochromic' | 'progressive' | 'frame') => {
    setFormError(null);
    if (presetType === 'blueray') {
      setName('Lensa Single Vision Blueray 1.56');
      setCategory('Lensa Kacamata');
      setSubcategory('Anti Radiasi Gadget');
      setSelectedLensCategories(['Single vision', 'Blueray']);
      setSph('-2.00');
      setCyl('0.00');
      setBasePurchasePrice(60000);
      setEdgingCostPerUnit(20000);
      setSellingPrice(180000);
      setCoating('Super Hydrophobic Blue Cut');
    } else if (presetType === 'photochromic') {
      setName('Lensa Photochromic Grey 1.56');
      setCategory('Lensa Kacamata');
      setSubcategory('Transisi UV');
      setSelectedLensCategories(['Single vision', 'Photochromic']);
      setSph('0.00');
      setCyl('0.00');
      setBasePurchasePrice(90000);
      setEdgingCostPerUnit(20000);
      setSellingPrice(250000);
      setCoating('Fast Shift UV400');
    } else if (presetType === 'progressive') {
      setName('Lensa Progressive Wide Vision');
      setCategory('Lensa Kacamata');
      setSubcategory('Multifokus Digital');
      setSelectedLensCategories(['Progressive', 'Blueray']);
      setSph('0.00');
      setAdd('+1.50');
      setBasePurchasePrice(150000);
      setEdgingCostPerUnit(25000);
      setSellingPrice(450000);
      setCoating('Anti Scratch AR');
    } else if (presetType === 'frame') {
      setName('Frame Titanium Premium Round');
      setCategory('Frame Kacamata');
      setSubcategory('Titanium Ultra Light');
      setSelectedLensCategories([]);
      setUnit('Pcs');
      setBasePurchasePrice(120000);
      setEdgingCostPerUnit(0);
      setSellingPrice(320000);
      setCoating('-');
      setSph('-');
      setCyl('-');
    }
  };

  const openEditModal = (p: OpticalProduct) => {
    setEditingProduct(p);
    setFormError(null);
    setName(p.name);
    setSku(p.sku);
    setCategory(p.category);
    setSubcategory(p.subcategory);
    setUnit(p.unit);
    setStockQty(p.stockQty);
    setMinStockAlert(p.minStockAlert);
    setBasePurchasePrice(p.basePurchasePrice);
    setEdgingCostPerUnit(p.edgingCostPerUnit);
    setSellingPrice(p.sellingPrice);
    setDescription(p.description || '');

    setSelectedLensCategories(p.lensCategories || ['Single vision']);
    setSph(p.sph || '0.00');
    setCyl(p.cyl || '0.00');
    setAxis(p.axis || '0');
    setAdd(p.add || '0.00');
    setCoating(p.coating || 'Standard HC');
    setDiameter(p.diameter || '70mm');

    setImageUrl(p.imageUrl || '');
    setVideoUrl(p.videoUrl || '');
    setMediaType(p.mediaType || (p.videoUrl && p.imageUrl ? 'both' : (p.videoUrl ? 'video' : 'image')));

    setIsModalOpen(true);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError(null);

    const cleanName = name.trim();
    if (!cleanName) {
      setFormError('Nama produk / lensa wajib diisi.');
      return;
    }

    setIsSaving(true);
    try {
      const realHpp = (Number(basePurchasePrice) || 0) + (Number(edgingCostPerUnit) || 0);

      const payload: Omit<OpticalProduct, 'id'> = {
        storeId: store?.id || 'store-optik-01',
        storeName: store?.name || 'Optik Jaya Sentosa',
        sku: sku.trim() || `OPT-${Date.now().toString().slice(-4)}`,
        name: cleanName,
        category: category || 'Lensa Kacamata',
        subcategory: subcategory.trim() || 'Standard',
        unit: unit || 'Pasang (Pair)',
        stockQty: Math.max(0, Number(stockQty) || 0),
        minStockAlert: Math.max(0, Number(minStockAlert) || 0),
        basePurchasePrice: Math.max(0, Number(basePurchasePrice) || 0),
        edgingCostPerUnit: Math.max(0, Number(edgingCostPerUnit) || 0),
        realHpp,
        sellingPrice: Math.max(0, Number(sellingPrice) || 0),
        description: description.trim() || '',
        lensCategories: selectedLensCategories && selectedLensCategories.length > 0 ? selectedLensCategories : ['Single vision'],
        sph: sph || '0.00',
        cyl: cyl || '0.00',
        axis: axis || '0',
        add: add || '0.00',
        coating: coating || 'Standard HC',
        diameter: diameter || '70mm',
        imageUrl: imageUrl.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined,
        mediaType: (imageUrl && videoUrl ? 'both' : (videoUrl ? 'video' : 'image')),
        isMarketplaceListed: true,
        soldCount: editingProduct?.soldCount || 0,
        rating: editingProduct?.rating || 4.9,
        cpcBid: editingProduct?.cpcBid || 500,
        isAdActive: editingProduct?.isAdActive || false
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await addProduct(payload);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Save product error:', err);
      setFormError('Gagal menyimpan produk: ' + (err?.message || 'Terjadi kesalahan sistem'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyQuickStock = async () => {
    if (!quickStockProduct) return;
    const safeQty = Math.max(0, Number(quickStockQty) || 0);
    const delta = safeQty - quickStockProduct.stockQty;
    await adjustStock(quickStockProduct.id, delta);
    setQuickStockProduct(null);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchesLens =
      selectedLensFilter === 'Semua' ||
      (p.lensCategories && p.lensCategories.includes(selectedLensFilter as LensCategoryType));
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.coating && p.coating.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesLens && matchesSearch;
  });

  const totalInventoryAsset = products.reduce((sum, p) => sum + p.realHpp * p.stockQty, 0);
  const totalStockUnits = products.reduce((sum, p) => sum + p.stockQty, 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 mb-1">
            <Glasses className="w-4 h-4" />
            <span>Katalog Lensa & Frame Kacamata Optik</span>
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">
            Stok & Kalkulator HPP Riil Lensa
          </h1>
          <p className="text-xs text-slate-400">
            Mendukung kategori kombinasi (Single Vision, Blueray, Photochromic, Progressive) dan atribut optik lengkap (Sph, Cyl, Axis, Add, Coating, Diameter).
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 flex items-center gap-2 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Stok Lensa / Frame</span>
        </button>
      </div>

      {/* Asset Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] font-semibold text-slate-400">Total Varian Barang</span>
          <div className="text-xl font-bold text-white mt-0.5">{products.length} SKU</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] font-semibold text-slate-400">Total Kuantitas Fisik</span>
          <div className="text-xl font-bold text-sky-400 mt-0.5">{formatNumber(totalStockUnits)} Unit</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] font-semibold text-slate-400">Nilai Aset Modal (HPP Riil)</span>
          <div className="text-xl font-bold text-emerald-400 mt-0.5">{formatRupiah(totalInventoryAsset)}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] font-semibold text-slate-400">Peringatan Stok Menipis</span>
          <div className="text-xl font-bold text-amber-400 mt-0.5">
            {products.filter((p) => p.stockQty <= p.minStockAlert).length} Item
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama produk, SKU, coating, atau kategori lensa..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-sky-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200"
            >
              <option value="Semua">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Filter: Jenis Lensa */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Tag className="w-3 h-3 text-sky-400" /> Filter Lensa:
          </span>
          <button
            onClick={() => setSelectedLensFilter('Semua')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              selectedLensFilter === 'Semua'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Semua
          </button>
          {LENS_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedLensFilter(cat.key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                selectedLensFilter === cat.key
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product List Table / Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center">
          <Glasses className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-white mb-1">Tidak Ada Produk Stok</h3>
          <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
            {products.length === 0
              ? 'Data dimulai dari awal (kosong). Silakan tambahkan stok lensa atau frame optik pertama Anda.'
              : 'Tidak ada produk yang cocok dengan kata kunci pencarian atau filter.'}
          </p>
          <button
            onClick={openAddModal}
            className="py-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Produk Baru</span>
          </button>
        </div>
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">SKU & Nama Produk</th>
                  <th className="p-3.5">Kategori & Fitur Lensa</th>
                  <th className="p-3.5">Atribut Preskripsi</th>
                  <th className="p-3.5 text-right">HPP Riil (Modal+Faset)</th>
                  <th className="p-3.5 text-right">Harga Jual</th>
                  <th className="p-3.5 text-center">Stok</th>
                  <th className="p-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts.map((p) => {
                  const isLow = p.stockQty <= p.minStockAlert;
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-11 h-11 rounded-xl object-cover border border-slate-700 bg-slate-800 shrink-0"
                            />
                          ) : p.videoUrl ? (
                            <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                              <Film className="w-5 h-5" />
                            </div>
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                              <Glasses className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-white text-sm flex items-center gap-1.5">
                              <span>{p.name}</span>
                              {p.videoUrl && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold inline-flex items-center gap-0.5">
                                  <Play className="w-2.5 h-2.5 fill-current" /> Video
                                </span>
                              )}
                            </div>
                            <div className="font-mono text-[11px] text-slate-400">
                              {p.sku} • {p.category}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {(p.lensCategories || []).length > 0 ? (
                            p.lensCategories.map((lc) => (
                              <span
                                key={lc}
                                className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20"
                              >
                                {lc}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400">{p.subcategory}</span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5 font-mono text-[11px]">
                        {p.sph || p.cyl || p.coating ? (
                          <div className="space-y-0.5">
                            <div className="text-slate-200">
                              Sph: {p.sph || '0.00'} | Cyl: {p.cyl || '0.00'}
                              {p.axis && p.axis !== '0' ? ` Ax:${p.axis}°` : ''}
                            </div>
                            <div className="text-slate-400 text-[10px]">
                              {p.coating && <span>{p.coating} • </span>}
                              {p.diameter && <span>Dia: {p.diameter}</span>}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="font-bold text-slate-200">{formatRupiah(p.realHpp)}</div>
                        <div className="text-[10px] text-slate-400">
                          Beli: {formatRupiah(p.basePurchasePrice)} + Faset: {formatRupiah(p.edgingCostPerUnit)}
                        </div>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="font-bold text-emerald-400">{formatRupiah(p.sellingPrice)}</div>
                        <div className="text-[10px] text-slate-400">
                          Margin: {formatRupiah(p.sellingPrice - p.realHpp)} (
                          {p.sellingPrice > 0 ? Math.round(((p.sellingPrice - p.realHpp) / p.sellingPrice) * 100) : 0}%)
                        </div>
                      </td>

                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => adjustStock(p.id, -1)}
                            title="Kurangi 1 Stok"
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold flex items-center justify-center cursor-pointer border border-slate-700/60 transition-transform"
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setQuickStockProduct(p);
                              setQuickStockQty(p.stockQty);
                            }}
                            title="Klik untuk ubah stok langsung"
                            className={`font-bold px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer border hover:border-sky-400 ${
                              isLow ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-slate-800 text-white border-slate-700'
                            }`}
                          >
                            {p.stockQty} {p.unit}
                          </button>
                          <button
                            type="button"
                            onClick={() => adjustStock(p.id, 1)}
                            title="Tambah 1 Stok"
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold flex items-center justify-center cursor-pointer border border-slate-700/60 transition-transform"
                          >
                            +
                          </button>
                        </div>
                        {isLow && (
                          <span className="text-[9px] text-rose-400 font-semibold block mt-0.5">
                            Stok Menipis!
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                            title="Edit Produk"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus produk "${p.name}" dari stok?`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Product with Sticky Header & Sticky Footer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="max-w-2xl w-full max-h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/95 shrink-0">
              <div className="flex items-center gap-2">
                <Glasses className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    {editingProduct ? 'Edit Stok Lensa / Frame' : 'Input Stok Produk Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Tambahkan stok ke katalog toko & marketplace</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <form id="inventory-form" onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs overscroll-contain">
              {/* Quick Preset Buttons (Only when adding new product) */}
              {!editingProduct && (
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-750 space-y-1.5">
                  <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Pilihan Preset Cepat (1-Klik Isi Form):
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => applyPreset('blueray')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-sky-600/30 text-slate-300 hover:text-sky-300 border border-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      ⚡ Lensa Blueray 1.56
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('photochromic')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-600/30 text-slate-300 hover:text-amber-300 border border-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      ☀️ Lensa Photochromic UV
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('progressive')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-600/30 text-slate-300 hover:text-purple-300 border border-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      👓 Lensa Progresif Digital
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('frame')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-600/30 text-slate-300 hover:text-emerald-300 border border-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      🕶️ Frame Titanium
                    </button>
                  </div>
                </div>
              )}

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Nama Produk / Lensa *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder="Contoh: Lensa Essilor Crizal Sapphire"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">SKU / Kode Barang</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              {/* Kategori Utama & Satuan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Kategori Barang</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as OpticalCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Subkategori / Merek</label>
                  <input
                    type="text"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="Contoh: Hoya / Rodenstock"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Satuan</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as UnitType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    {units.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* KATEGORI LENSA MULTI-SELECT (User requirement) */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-750 space-y-2">
                <label className="block font-bold text-slate-200 text-[11px] uppercase tracking-wider">
                  Kategori Lensa Optik (Dapat Dipilih Lebih Dari Satu / Kombinasi)
                </label>
                <p className="text-[11px] text-slate-400">
                  Misal: Lensa Single Vision + Blueray + Photochromic dapat dicentang bersamaan.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
                  {LENS_CATEGORIES.map((cat) => {
                    const isSelected = selectedLensCategories.includes(cat.key);
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => toggleLensCategory(cat.key)}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? 'bg-sky-600/20 border-sky-500 text-white'
                            : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                            isSelected ? 'bg-sky-600 border-sky-500 text-white' : 'border-slate-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="font-semibold text-xs">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ATRIBUT LENSA (Sph, Cyl, Axis, Add, Coating, Diameter) */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-750 space-y-3">
                <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider">
                  Atribut Preskripsi & Fisik Lensa
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Sph (Sferis)</label>
                    <input
                      type="text"
                      value={sph}
                      onChange={(e) => setSph(e.target.value)}
                      placeholder="-2.00 / Plano"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Cyl (Silindris)</label>
                    <input
                      type="text"
                      value={cyl}
                      onChange={(e) => setCyl(e.target.value)}
                      placeholder="-0.50"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Axis (0-180°)</label>
                    <input
                      type="text"
                      value={axis}
                      onChange={(e) => setAxis(e.target.value)}
                      placeholder="180"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Add (Bifokal)</label>
                    <input
                      type="text"
                      value={add}
                      onChange={(e) => setAdd(e.target.value)}
                      placeholder="+1.50"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-center"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 font-semibold mb-1">Diameter Lensa</label>
                    <input
                      type="text"
                      value={diameter}
                      onChange={(e) => setDiameter(e.target.value)}
                      placeholder="Contoh: 70mm / 65mm"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Coating (Lapisan Lensa)
                  </label>
                  <input
                    type="text"
                    value={coating}
                    onChange={(e) => setCoating(e.target.value)}
                    placeholder="Contoh: Super Hydrophobic, Blue Ray Cut EMI, Anti-Gores Satin"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              {/* Harga & HPP Riil Kalkulator */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-750 space-y-3">
                <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                  Kalkulator HPP Riil & Harga Jual
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Modal Beli Lensa/Frame</label>
                    <input
                      type="number"
                      value={basePurchasePrice}
                      onChange={(e) => setBasePurchasePrice(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Ongkos Faset (Edging Cost)</label>
                    <input
                      type="number"
                      value={edgingCostPerUnit}
                      onChange={(e) => setEdgingCostPerUnit(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Harga Jual Konsumen</label>
                    <input
                      type="number"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-emerald-400"
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] flex items-center justify-between text-emerald-400">
                  <span>HPP Riil: {formatRupiah(calculatedRealHpp)}</span>
                  <span>Est. Margin Laba: {formatRupiah(estimatedMargin)} ({marginPercent.toFixed(1)}%)</span>
                </div>
              </div>

              {/* Stok & Peringatan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Jumlah Stok Fisik</label>
                  <input
                    type="number"
                    value={stockQty}
                    onChange={(e) => setStockQty(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Batas Peringatan Stok Minimum</label>
                  <input
                    type="number"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              {/* MEDIA UPLOAD: Foto Gambar & Video Produk */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-750 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-sky-400" />
                    <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider">
                      Media Produk (Foto Gambar & Video Demonstrasi Lensa / Frame)
                    </span>
                  </div>
                  <span className="text-[10px] text-sky-400 font-semibold bg-sky-500/10 px-2 py-0.5 rounded-full">
                    Tampil di Eye Hub Marketplace
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Unggah file dari perangkat Anda (drag-and-drop atau klik) atau masukkan link URL eksternal gambar & video.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 1. Upload / Masukkan Gambar */}
                  <div className="space-y-2">
                    <label className="block font-semibold text-slate-300 text-xs flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                      Foto Produk / Lensa
                    </label>

                    {/* Image Drag and Drop Zone */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingImage(true);
                      }}
                      onDragLeave={() => setIsDraggingImage(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingImage(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file && file.type.startsWith('image/')) {
                          const reader = new FileReader();
                          reader.onload = (ev) => setImageUrl(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className={`relative border-2 border-dashed rounded-xl p-3 text-center transition-colors ${
                        isDraggingImage
                          ? 'border-sky-500 bg-sky-500/10'
                          : 'border-slate-700 bg-slate-800/80 hover:border-slate-600'
                      }`}
                    >
                      {imageUrl ? (
                        <div className="relative group rounded-lg overflow-hidden max-h-36 bg-slate-900 flex items-center justify-center">
                          <img
                            src={imageUrl}
                            alt="Preview Produk"
                            className="w-full h-32 object-contain rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => setImageUrl('')}
                            className="absolute top-2 right-2 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-lg transition-colors cursor-pointer"
                            title="Hapus foto"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer block py-3">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => setImageUrl(ev.target?.result as string);
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                          <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-1.5" />
                          <div className="text-xs font-semibold text-slate-300">
                            Pilih Foto atau Tarik ke Sini
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Format PNG, JPG, WebP (Maks 10MB)
                          </div>
                        </label>
                      )}
                    </div>

                    {/* URL Image Fallback Input */}
                    <div className="pt-1">
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Atau tempel Link URL Foto Gambar"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-sky-500"
                      />
                    </div>
                  </div>

                  {/* 2. Upload / Masukkan Video */}
                  <div className="space-y-2">
                    <label className="block font-semibold text-slate-300 text-xs flex items-center gap-1.5">
                      <VideoIcon className="w-3.5 h-3.5 text-purple-400" />
                      Video Produk / Demonstrasi Lensa
                    </label>

                    {/* Video Drag and Drop Zone */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingVideo(true);
                      }}
                      onDragLeave={() => setIsDraggingVideo(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingVideo(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file && file.type.startsWith('video/')) {
                          const reader = new FileReader();
                          reader.onload = (ev) => setVideoUrl(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className={`relative border-2 border-dashed rounded-xl p-3 text-center transition-colors ${
                        isDraggingVideo
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-slate-700 bg-slate-800/80 hover:border-slate-600'
                      }`}
                    >
                      {videoUrl ? (
                        <div className="relative group rounded-lg overflow-hidden max-h-36 bg-black flex items-center justify-center">
                          <video
                            src={videoUrl}
                            controls
                            className="w-full h-32 object-contain rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => setVideoUrl('')}
                            className="absolute top-2 right-2 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-lg transition-colors cursor-pointer"
                            title="Hapus video"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer block py-3">
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => setVideoUrl(ev.target?.result as string);
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                          <VideoIcon className="w-8 h-8 text-slate-500 mx-auto mb-1.5" />
                          <div className="text-xs font-semibold text-slate-300">
                            Pilih Video atau Tarik ke Sini
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Format MP4, WebM (Maks 50MB)
                          </div>
                        </label>
                      )}
                    </div>

                    {/* URL Video Fallback Input */}
                    <div className="pt-1">
                      <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="Atau tempel Link Video (MP4 / Streaming)"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* Modal Footer: Sticky at bottom, ALWAYS VISIBLE & EASY TO TAP */}
            <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-900/95 flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
              {formError && (
                <div className="w-full sm:flex-1 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer disabled:opacity-50 text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={isSaving}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-bold shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs min-h-[42px] transition-all"
                >
                  {isSaving ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Menyimpan Stok...</span>
                    </>
                  ) : (
                    <span>{editingProduct ? 'Simpan Perubahan Stok' : 'Tambahkan ke Katalog Stok'}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stock Adjustment Modal */}
      {quickStockProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-black text-white">Sesuaikan Stok Produk</h3>
                <p className="text-xs text-slate-400 truncate max-w-[220px]">{quickStockProduct.name}</p>
              </div>
              <button
                onClick={() => setQuickStockProduct(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-400">Stok Saat Ini:</span>
              <span className="font-mono font-bold text-sky-400 text-sm">
                {quickStockProduct.stockQty} {quickStockProduct.unit}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Jumlah Stok Baru ({quickStockProduct.unit})
              </label>
              <input
                type="number"
                min={0}
                value={quickStockQty}
                onChange={(e) => setQuickStockQty(Math.max(0, Number(e.target.value)))}
                className="w-full text-center font-mono text-xl font-bold py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:border-sky-500"
              />
            </div>

            {/* Quick adjust increment buttons */}
            <div className="grid grid-cols-4 gap-1.5">
              {[-5, -1, 1, 5].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setQuickStockQty((prev) => Math.max(0, prev + amt))}
                  className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-300 border border-slate-700 cursor-pointer"
                >
                  {amt > 0 ? `+${amt}` : amt}
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setQuickStockProduct(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApplyQuickStock}
                className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/30"
              >
                Simpan Stok Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
