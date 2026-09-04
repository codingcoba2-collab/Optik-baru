import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SaleOrder, SalesChannel, SalesFormat, SaleItem } from '../../types';
import { formatRupiah, formatNumber } from '../../utils/formatters';
import { CommaNumberInput } from '../common/CommaNumberInput';
import {
  ShoppingBag,
  Plus,
  Radio,
  Search,
  Store,
  MessageCircle,
  Tag,
  Trash2,
  Receipt,
  UserCheck,
  CheckCircle2,
  X,
  Layers,
  ArrowRight
} from 'lucide-react';

export const SalesModule: React.FC = () => {
  const { salesOrders, addSaleOrder, deleteSaleOrder, products, employees, store, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [channel, setChannel] = useState<SalesChannel>('TikTok Live');
  const [orderFormat, setOrderFormat] = useState<SalesFormat>('Bundling Resep');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');

  // Selected Order Items
  const [orderItems, setOrderItems] = useState<SaleItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [productCodeName, setProductCodeName] = useState<string>('');
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [itemQty, setItemQty] = useState(1);
  const [itemCustomPrice, setItemCustomPrice] = useState(0);

  // Employee Attribution
  const [hostEmployeeId, setHostEmployeeId] = useState<string>('');
  const [adminEmployeeId, setAdminEmployeeId] = useState<string>('');
  const [fasetTechnicianId, setFasetTechnicianId] = useState<string>('');

  const channels: SalesChannel[] = [
    'TikTok Live',
    'Shopee Live',
    'Tokopedia Live',
    'IG Live',
    'Shopee Reguler',
    'TikTok Shop Reguler',
    'Offline Optik Store',
    'WA Order Resep',
  ];

  const hosts = employees.filter((e) => e.roles.includes('host'));
  const pelayans = employees.filter((e) => e.roles.includes('admin') || e.roles.includes('pelayan'));
  const technicians = employees.filter((e) => e.roles.includes('faset') || e.roles.includes('teknisi'));

  const matchingProducts = productCodeName.trim()
    ? products.filter(
        (p) =>
          p.sku.toLowerCase().includes(productCodeName.toLowerCase().trim()) ||
          p.name.toLowerCase().includes(productCodeName.toLowerCase().trim())
      )
    : [];

  const handleAddItemToCart = () => {
    let targetProduct = products.find((p) => p.id === selectedProductId);
    if (!targetProduct && productCodeName.trim()) {
      targetProduct =
        products.find(
          (p) =>
            p.sku.toLowerCase() === productCodeName.toLowerCase().trim() ||
            p.name.toLowerCase() === productCodeName.toLowerCase().trim()
        ) || matchingProducts[0];
    }

    const inputName = targetProduct ? targetProduct.name : productCodeName.trim();
    if (!inputName) {
      showToast('Ketik code name produk / SKU terlebih dahulu', 'warning');
      return;
    }

    const price = itemCustomPrice > 0 ? itemCustomPrice : (targetProduct ? targetProduct.sellingPrice : 0);
    const isBundle = orderFormat === 'Bundling Resep' || (targetProduct ? targetProduct.category === 'Lensa Kacamata' : false);
    const hpp = targetProduct ? targetProduct.realHpp : price * 0.6;

    const newItem: SaleItem = {
      productId: targetProduct ? targetProduct.id : 'custom-' + Date.now(),
      productName: targetProduct ? `[${targetProduct.sku}] ${targetProduct.name}` : inputName,
      qty: itemQty,
      price,
      hpp,
      isBundle,
    };

    setOrderItems((prev) => [...prev, newItem]);
    setProductCodeName('');
    setSelectedProductId('');
    setItemQty(1);
    setItemCustomPrice(0);
    setIsSuggestOpen(false);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculations for active form
  const grossAmount = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const totalHpp = orderItems.reduce((sum, i) => sum + i.hpp * i.qty, 0);

  const isMarketplace = channel.includes('TikTok') || channel.includes('Shopee') || channel.includes('Tokopedia');
  const marketplaceAdminFee = isMarketplace
    ? Math.round((grossAmount * (store.marketplaceAdminFeePercent || 8.5)) / 100)
    : 0;
  const serviceFee = isMarketplace ? store.serviceFeePerOrder || 1000 : 0;
  const netRevenue = grossAmount - marketplaceAdminFee - serviceFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || orderItems.length === 0) return;

    const invoiceNo = `INV/EYE/${new Date().toISOString().slice(0, 10).replace(/-/g, '')}/${Date.now().toString().slice(-4)}`;

    const newOrder: SaleOrder = {
      id: 'ord-' + Date.now(),
      invoiceNo,
      date: new Date().toISOString().split('T')[0],
      storeId: store.id,
      channel,
      orderFormat,
      customerName,
      items: orderItems,
      grossAmount,
      marketplaceAdminFee,
      serviceFee,
      netRevenue,
      totalHpp,
      hostEmployeeId: hostEmployeeId || undefined,
      adminEmployeeId: adminEmployeeId || undefined,
      fasetTechnicianId: fasetTechnicianId || undefined,
      notes,
    };

    addSaleOrder(newOrder);
    setIsModalOpen(false);

    // Reset Form
    setCustomerName('');
    setOrderItems([]);
    setNotes('');
  };

  const filteredOrders = salesOrders.filter((o) => {
    const matchesChannel = selectedChannel === 'Semua' || o.channel === selectedChannel;
    const matchesSearch =
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChannel && matchesSearch;
  });

  const totalGross = salesOrders.reduce((sum, o) => sum + o.grossAmount, 0);
  const totalNet = salesOrders.reduce((sum, o) => sum + o.netRevenue, 0);
  const totalAdminFees = salesOrders.reduce((sum, o) => sum + o.marketplaceAdminFee + o.serviceFee, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-500 mb-1">
            <Radio className="w-4 h-4" />
            Penjualan Multi-Kanal (Live Stream, MP & Offline)
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Transaksi Penjualan & Atribusi Komisi Karyawan
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pencatatan omzet live, potongan admin marketplace otomatis, dan pembagian insentif Host, Admin & Teknisi Faset
          </p>
        </div>

        <button
          onClick={() => {
            setOrderItems([]);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md shadow-rose-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Penjualan Baru</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Omzet Kotor</div>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            {formatRupiah(totalGross)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{salesOrders.length} Pesanan tercatat</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Potongan Admin Marketplace</div>
          <div className="text-lg sm:text-xl font-black text-rose-500">
            {formatRupiah(totalAdminFees)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Biaya admin + gratis ongkir</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Pendapatan Bersih (Net)</div>
          <div className="text-lg sm:text-xl font-black text-emerald-500">
            {formatRupiah(totalNet)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Masuk ke kas / escrow toko</div>
        </div>
      </div>

      {/* Search & Channel Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama pembeli atau no invoice..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {['Semua', ...channels].map((ch) => (
            <button
              key={ch}
              onClick={() => setSelectedChannel(ch)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedChannel === ch
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>

      {/* Sales Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-750">
              <tr>
                <th className="py-3 px-4">Invoice & Tanggal</th>
                <th className="py-3 px-3">Pelanggan & Kanal</th>
                <th className="py-3 px-3">Item Kacamata</th>
                <th className="py-3 px-3">Atribusi Staf</th>
                <th className="py-3 px-3 text-right">Omzet Kotor</th>
                <th className="py-3 px-3 text-right">Potongan MP</th>
                <th className="py-3 px-3 text-right">Net Omzet</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {filteredOrders.map((order) => {
                const hostEmp = employees.find((e) => e.id === order.hostEmployeeId);
                const adminEmp = employees.find((e) => e.id === order.adminEmployeeId);
                const fasetEmp = employees.find((e) => e.id === order.fasetTechnicianId);

                return (
                  <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold font-mono text-slate-900 dark:text-white">{order.invoiceNo}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{order.date}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900 dark:text-white">{order.customerName}</div>
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        {order.channel}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="space-y-0.5">
                        {order.items.map((i, idx) => (
                          <div key={idx} className="text-[11px]">
                            • {i.productName} <span className="text-slate-400">({i.qty}x)</span>
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] font-semibold text-purple-500">
                        Format: {order.orderFormat}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="text-[11px] space-y-0.5 text-slate-500 dark:text-slate-400">
                        {hostEmp && <div>Host: <strong className="text-slate-700 dark:text-slate-200">{hostEmp.name}</strong></div>}
                        {adminEmp && <div>Pelayan: <strong className="text-slate-700 dark:text-slate-200">{adminEmp.name}</strong></div>}
                        {fasetEmp && <div>Lab: <strong className="text-slate-700 dark:text-slate-200">{fasetEmp.name}</strong></div>}
                        {!hostEmp && !adminEmp && !fasetEmp && <span>-</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                      {formatRupiah(order.grossAmount)}
                    </td>
                    <td className="py-3.5 px-3 text-right text-rose-500">
                      {order.marketplaceAdminFee + order.serviceFee > 0 ? (
                        <div>
                          <div>-{formatRupiah(order.marketplaceAdminFee + order.serviceFee)}</div>
                          <div className="text-[9px] text-slate-400">Fee MP + Layanan</div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                      {formatRupiah(order.netRevenue)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => deleteSaleOrder(order.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                        title="Hapus Transaksi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada transaksi penjualan yang sesuai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Catat Penjualan Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-rose-500" />
              Catat Transaksi Penjualan Toko Optik
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kanal Penjualan
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as SalesChannel)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                  >
                    {channels.map((ch) => (
                      <option key={ch} value={ch}>{ch}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Format Penjualan
                  </label>
                  <select
                    value={orderFormat}
                    onChange={(e) => setOrderFormat(e.target.value as SalesFormat)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Satuan">Satuan (Frame / Softlens Saja)</option>
                    <option value="Bundling Resep">Bundling Resep (Frame + Lensa)</option>
                    <option value="Campuran">Campuran</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Customer / Akun
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nama pelanggan atau username"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Add Items to Order Section - Input Code Name Produk */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Pilih Item Frame / Lensa / Aksesoris (Input Code Name Produk)</span>
                  <span className="text-[11px] text-slate-400">Total Item Terpilih: {orderItems.length}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  {/* Code Name Input */}
                  <div className="sm:col-span-6 relative">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Ketik Code Name / SKU Produk
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={productCodeName}
                        onChange={(e) => {
                          setProductCodeName(e.target.value);
                          setIsSuggestOpen(true);
                        }}
                        onFocus={() => setIsSuggestOpen(true)}
                        placeholder="Ketik code name / SKU produk..."
                        className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                      />
                      {productCodeName && (
                        <button
                          type="button"
                          onClick={() => {
                            setProductCodeName('');
                            setSelectedProductId('');
                            setIsSuggestOpen(false);
                          }}
                          className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Auto-suggest dropdown based on code name / SKU */}
                    {isSuggestOpen && matchingProducts.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-1.5 z-50">
                        {matchingProducts.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSelectedProductId(p.id);
                              setProductCodeName(`${p.sku} - ${p.name}`);
                              setItemCustomPrice(p.sellingPrice);
                              setIsSuggestOpen(false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-sky-50 dark:hover:bg-slate-700 flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <div>
                              <span className="font-mono font-bold text-sky-600 dark:text-sky-400 mr-2">[{p.sku}]</span>
                              <span className="font-medium text-slate-900 dark:text-white">{p.name}</span>
                              <span className="text-[10px] text-slate-400 block">{p.category} • Stok: {p.stockQty}</span>
                            </div>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs shrink-0 ml-2">
                              {formatRupiah(p.sellingPrice)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1 text-center">
                      Qty
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={itemQty}
                      onChange={(e) => setItemQty(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-center font-bold text-xs"
                    />
                  </div>

                  <div className="sm:col-span-4 flex items-end">
                    <button
                      type="button"
                      onClick={handleAddItemToCart}
                      className="w-full py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-colors flex items-center justify-center gap-1.5 text-xs shadow-sm cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah ke Pesanan
                    </button>
                  </div>
                </div>

                {/* Items List in Cart */}
                {orderItems.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                    {orderItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">{item.productName}</span>
                          <span className="text-slate-400 ml-2">x{item.qty}</span>
                          {item.isBundle && (
                            <span className="ml-2 text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400">
                              Bundling
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {formatRupiah(item.price * item.qty)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-rose-400 hover:text-rose-600 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Employee Attribution */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Atribusi Host Live
                  </label>
                  <select
                    value={hostEmployeeId}
                    onChange={(e) => setHostEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="">-- Tanpa Host (Reguler/Offline) --</option>
                    {hosts.map((h) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Atribusi Pelayan Toko
                  </label>
                  <select
                    value={adminEmployeeId}
                    onChange={(e) => setAdminEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="">-- Tanpa Pelayan Khusus --</option>
                    {pelayans.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Teknisi Lab Faset (Jika Resep)
                  </label>
                  <select
                    value={fasetTechnicianId}
                    onChange={(e) => setFasetTechnicianId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="">-- Bukan Custom Lensa --</option>
                    {technicians.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Financial Calculation Review */}
              <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal Omzet Kotor:</span>
                  <strong className="text-white font-mono">{formatRupiah(grossAmount)}</strong>
                </div>
                {isMarketplace && (
                  <div className="flex justify-between text-rose-400">
                    <span>Potongan Admin MP ({store.marketplaceAdminFeePercent}% + Layanan Rp {store.serviceFeePerOrder}):</span>
                    <span className="font-mono">-{formatRupiah(marketplaceAdminFee + serviceFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Estimasi Total HPP Terjual:</span>
                  <span className="font-mono">{formatRupiah(totalHpp)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-black text-emerald-400 text-sm">
                  <span>Estimasi Omzet Bersih Masuk Kas:</span>
                  <span>{formatRupiah(netRevenue)}</span>
                </div>
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
                  disabled={orderItems.length === 0}
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold shadow-md shadow-rose-600/20"
                >
                  Simpan Transaksi Penjualan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
