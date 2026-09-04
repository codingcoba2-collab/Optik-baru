import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OpticalProduct, OpticalCategory, UnitType } from '../../types';
import { formatRupiah, formatNumber } from '../../utils/formatters';
import { CommaNumberInput } from '../common/CommaNumberInput';
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
  X
} from 'lucide-react';

export const InventoryModule: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, adjustStock, store } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<OpticalProduct | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<OpticalCategory>('Frame Kacamata');
  const [subcategory, setSubcategory] = useState('Titanium');
  const [unit, setUnit] = useState<UnitType>('Pcs');
  const [stockQty, setStockQty] = useState(20);
  const [minStockAlert, setMinStockAlert] = useState(5);
  const [basePurchasePrice, setBasePurchasePrice] = useState(50000);
  const [edgingCostPerUnit, setEdgingCostPerUnit] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(150000);
  const [description, setDescription] = useState('');

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

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setSku(`OPT-${Date.now().toString().slice(-4)}`);
    setCategory('Frame Kacamata');
    setSubcategory('Titanium');
    setUnit('Pcs');
    setStockQty(20);
    setMinStockAlert(5);
    setBasePurchasePrice(65000);
    setEdgingCostPerUnit(0);
    setSellingPrice(175000);
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: OpticalProduct) => {
    setEditingProduct(p);
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
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const realHpp = basePurchasePrice + edgingCostPerUnit;

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name,
        sku,
        category,
        subcategory,
        unit,
        stockQty,
        minStockAlert,
        basePurchasePrice,
        edgingCostPerUnit,
        realHpp,
        sellingPrice,
        description,
      });
    } else {
      const newProd: OpticalProduct = {
        id: 'prod-' + Date.now(),
        storeId: store.id,
        sku,
        name,
        category,
        subcategory,
        unit,
        stockQty,
        minStockAlert,
        basePurchasePrice,
        edgingCostPerUnit,
        realHpp,
        sellingPrice,
        description,
      };
      addProduct(newProd);
    }
    setIsModalOpen(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subcategory.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalInventoryAsset = products.reduce((sum, p) => sum + p.realHpp * p.stockQty, 0);
  const totalStockUnits = products.reduce((sum, p) => sum + p.stockQty, 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-500 mb-1">
            <Glasses className="w-4 h-4" />
            Inventaris & Kalkulator HPP Riil
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Katalog Frame, Lensa & Aksesoris Optik
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kalkulasi otomatis HPP riil mencakup modal beli awal + biaya pengerjaan lab faset lensa
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md shadow-sky-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Produk Optik</span>
        </button>
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Nilai Aset Stok</div>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            {formatRupiah(totalInventoryAsset)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Dihitung berdasarkan HPP Riil</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Unit Tersedia</div>
          <div className="text-lg sm:text-xl font-black text-sky-500">
            {formatNumber(totalStockUnits)} Item
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{products.length} SKU terdaftar</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Peringatan Restock</div>
          <div className="text-lg sm:text-xl font-black text-amber-500">
            {products.filter((p) => p.stockQty <= p.minStockAlert).length} Produk Menipis
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Di bawah batas minimum</div>
        </div>
      </div>

      {/* Search & Category Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari frame, nama lensa, SKU, atau subkategori..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {['Semua', ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-750">
              <tr>
                <th className="py-3 px-4">Produk & SKU</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3 text-right">Modal Awal</th>
                <th className="py-3 px-3 text-right">Biaya Faset</th>
                <th className="py-3 px-3 text-right">HPP Riil</th>
                <th className="py-3 px-3 text-right">Harga Jual</th>
                <th className="py-3 px-3 text-right">Margin</th>
                <th className="py-3 px-3 text-center">Stok</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {filteredProducts.map((p) => {
                const margin = p.sellingPrice - p.realHpp;
                const mPercent = p.sellingPrice > 0 ? (margin / p.sellingPrice) * 100 : 0;
                const isLow = p.stockQty <= p.minStockAlert;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p.sku}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                        {p.category}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">{p.subcategory}</div>
                    </td>
                    <td className="py-3.5 px-3 text-right text-slate-500">{formatRupiah(p.basePurchasePrice)}</td>
                    <td className="py-3.5 px-3 text-right text-purple-600 dark:text-purple-400">
                      {p.edgingCostPerUnit > 0 ? formatRupiah(p.edgingCostPerUnit) : '-'}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                      {formatRupiah(p.realHpp)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-black text-sky-600 dark:text-sky-400">
                      {formatRupiah(p.sellingPrice)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-medium text-emerald-600 dark:text-emerald-400">
                      {formatRupiah(margin)}
                      <div className="text-[10px] text-emerald-500">{mPercent.toFixed(0)}%</div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => adjustStock(p.id, -1)}
                          className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-bold"
                        >
                          -
                        </button>
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-xs ${
                            isLow
                              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {p.stockQty} {p.unit}
                        </span>
                        <button
                          onClick={() => adjustStock(p.id, 1)}
                          className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-bold"
                        >
                          +
                        </button>
                      </div>
                      {isLow && (
                        <div className="text-[9px] text-rose-500 font-semibold mt-0.5">Stok Rendah!</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Produk"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Tidak ada produk optik yang sesuai pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Glasses className="w-5 h-5 text-sky-500" />
              {editingProduct ? 'Edit Data Produk Optik' : 'Tambah Produk / Lensa / Frame Baru'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Produk
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Frame Titanium Ultralight Korea"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kode SKU
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori Optik
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as OpticalCategory)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subkategori / Bahan
                  </label>
                  <input
                    type="text"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="Titanium, Bluechromic, dll"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Satuan Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as UnitType)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {units.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* HPP Calculator Section */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-purple-500" />
                  Kalkulator HPP Riil & Margin Toko Optik
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Modal Beli Awal
                    </label>
                    <CommaNumberInput
                      value={basePurchasePrice}
                      onChange={setBasePurchasePrice}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Biaya Lab / Faset
                    </label>
                    <CommaNumberInput
                      value={edgingCostPerUnit}
                      onChange={setEdgingCostPerUnit}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Harga Jual Konsumen
                    </label>
                    <CommaNumberInput
                      value={sellingPrice}
                      onChange={setSellingPrice}
                    />
                  </div>
                </div>

                {/* HPP & Margin Calculation Live Preview */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500">HPP Riil: </span>
                    <strong className="text-slate-900 dark:text-white font-mono">
                      {formatRupiah(calculatedRealHpp)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Estimasi Laba/Pcs: </span>
                    <strong className="text-emerald-500 font-mono">
                      {formatRupiah(estimatedMargin)} ({marginPercent.toFixed(1)}%)
                    </strong>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Stok Awal
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stockQty}
                    onChange={(e) => setStockQty(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Batas Peringatan Minimum
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan / Deskripsi Tambahan
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Karakteristik frame, keunggulan lensa, garansi..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-md shadow-sky-600/20"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
