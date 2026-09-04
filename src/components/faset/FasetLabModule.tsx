import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FasetLabOrder, FasetStatus, EyePrescription } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import {
  Wrench,
  Plus,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Printer,
  Glasses,
  Search,
  Check,
  X,
  Filter,
  Eye,
  SlidersHorizontal,
  FileText
} from 'lucide-react';

export const FasetLabModule: React.FC = () => {
  const { fasetOrders, addFasetOrder, updateFasetStatus, deleteFasetOrder, employees, store } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<FasetLabOrder | null>(null);

  // Form State for new Faset Job
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [frameName, setFrameName] = useState('Frame Titanium Ultralight Korea Style');
  const [lensType, setLensType] = useState('Lensa Bluechromic (Photocromic + Blue Ray) Index 1.56');
  const [hasTechnician, setHasTechnician] = useState<boolean>(store.hasInternalTechnician);
  const [externalFasetCost, setExternalFasetCost] = useState<number>(store.defaultExternalFasetCost || 20000);
  const [technicianId, setTechnicianId] = useState(() => {
    const fasetEmp = employees.find((e) => e.roles.includes('faset') || e.roles.includes('teknisi'));
    return fasetEmp ? fasetEmp.id : employees[0]?.id || '';
  });
  const [technicianIncentive, setTechnicianIncentive] = useState(8000);
  const [notes, setNotes] = useState('');

  // Prescription Form State
  const [rightSph, setRightSph] = useState('-2.00');
  const [rightCyl, setRightCyl] = useState('0.00');
  const [rightAxis, setRightAxis] = useState('0');
  const [rightAdd, setRightAdd] = useState('');

  const [leftSph, setLeftSph] = useState('-2.00');
  const [leftCyl, setLeftCyl] = useState('0.00');
  const [leftAxis, setLeftAxis] = useState('0');
  const [leftAdd, setLeftAdd] = useState('');

  const [pd, setPd] = useState('63');

  // Reject Modal State
  const [rejectOrderId, setRejectOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Lensa Pecah/Garis');

  const fasetTechnicians = employees.filter((e) => e.roles.includes('faset'));

  const statusList: FasetStatus[] = [
    'Antrean Lab',
    'Proses Faset',
    'Fitting Frame',
    'QC Akurasi',
    'Selesai & Siap',
    'Reject Lab',
  ];

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    const newOrder: FasetLabOrder = {
      id: 'fst-' + Date.now(),
      orderNumber: `FST-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      storeId: store.id,
      customerName,
      phone,
      frameName,
      lensType,
      prescription: {
        rightEye: { sph: rightSph, cyl: rightCyl, axis: rightAxis, add: rightAdd || undefined },
        leftEye: { sph: leftSph, cyl: leftCyl, axis: leftAxis, add: leftAdd || undefined },
        pd: pd + ' mm',
        lensTypeRequested: lensType,
      },
      technicianId: hasTechnician ? technicianId : undefined,
      hasTechnician,
      externalFasetCost: hasTechnician ? 0 : externalFasetCost,
      status: 'Antrean Lab',
      technicianIncentive: hasTechnician ? technicianIncentive : 0,
      notes,
    };

    addFasetOrder(newOrder);
    setIsModalOpen(false);
    // Reset form
    setCustomerName('');
    setPhone('');
    setNotes('');
  };

  const handleConfirmReject = () => {
    if (rejectOrderId) {
      updateFasetStatus(rejectOrderId, 'Reject Lab', rejectReason);
      setRejectOrderId(null);
    }
  };

  const filteredOrders = fasetOrders.filter((o) => {
    const matchesStatus = statusFilter === 'Semua' || o.status === statusFilter;
    const matchesSearch =
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.frameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.lensType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalCompleted = fasetOrders.filter((o) => o.status === 'Selesai & Siap').length;
  const totalRejected = fasetOrders.filter((o) => o.status === 'Reject Lab').length;
  const totalIncentiveEarned = fasetOrders
    .filter((o) => o.status === 'Selesai & Siap')
    .reduce((sum, o) => sum + o.technicianIncentive, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-500 mb-1">
            <Wrench className="w-4 h-4" />
            Laboratorium Faset, Resep & Kontrol Kualitas (QC) Lensa
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Pengerjaan Resep & Pemotongan Lensa
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pencatatan ukuran resep kacamata dokter, pemotongan edger, fitting frame, verifikasi reject & insentif teknisi lab
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md shadow-purple-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Input SPK Lab Faset Baru</span>
        </button>
      </div>

      {/* Metric Cards for Lab */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Lensa Selesai QC</div>
          <div className="text-lg sm:text-xl font-black text-emerald-500">
            {totalCompleted} Pasang Lensa
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Lulus akurasi lensometer</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Antrean & Proses Mesin</div>
          <div className="text-lg sm:text-xl font-black text-purple-500">
            {fasetOrders.filter((o) => o.status !== 'Selesai & Siap' && o.status !== 'Reject Lab').length} Pesanan
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Sedang dikerjakan teknisi</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Reject Lab (Gagal)</div>
          <div className="text-lg sm:text-xl font-black text-rose-500">
            {totalRejected} Pasang
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Cacat sumbu / baret / pecah</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Akumulasi Insentif Teknisi</div>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            {formatRupiah(totalIncentiveEarned)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Masuk komponen payroll lab</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama pasien/pembeli, no order, frame..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {['Semua', ...statusList].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOrders.map((order) => {
          const tech = employees.find((e) => e.id === order.technicianId);

          return (
            <div
              key={order.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header card */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {order.customerName}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        {order.orderNumber}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Tanggal Order: {order.date} • Telp: {order.phone || '-'}
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      order.status === 'Selesai & Siap'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : order.status === 'Reject Lab'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : order.status === 'QC Akurasi'
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        : order.status === 'Proses Faset'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Frame & Lens info */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750 text-xs mb-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Frame:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{order.frameName}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Tipe Lensa:</span>
                    <strong className="text-purple-600 dark:text-purple-400">{order.lensType}</strong>
                  </div>
                </div>

                {/* Prescription Matrix (Resep Dokter / Refraksi) */}
                <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs">
                  <div className="font-bold text-purple-400 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      Parameter Resep Refraksi
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">PD: {order.prescription.pd}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center font-mono">
                    <div className="p-2 rounded-lg bg-white/40 dark:bg-slate-800/80 border border-purple-500/10">
                      <div className="text-[10px] font-bold text-sky-500 mb-1">Mata Kanan (OD)</div>
                      <div className="text-slate-900 dark:text-white font-bold">
                        SPH {order.prescription.rightEye.sph}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        CYL {order.prescription.rightEye.cyl} • AXIS {order.prescription.rightEye.axis}°
                      </div>
                      {order.prescription.rightEye.add && (
                        <div className="text-[10px] text-purple-400">ADD {order.prescription.rightEye.add}</div>
                      )}
                    </div>

                    <div className="p-2 rounded-lg bg-white/40 dark:bg-slate-800/80 border border-purple-500/10">
                      <div className="text-[10px] font-bold text-sky-500 mb-1">Mata Kiri (OS)</div>
                      <div className="text-slate-900 dark:text-white font-bold">
                        SPH {order.prescription.leftEye.sph}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        CYL {order.prescription.leftEye.cyl} • AXIS {order.prescription.leftEye.axis}°
                      </div>
                      {order.prescription.leftEye.add && (
                        <div className="text-[10px] text-purple-400">ADD {order.prescription.leftEye.add}</div>
                      )}
                    </div>
                  </div>

                  {order.notes && (
                    <div className="mt-2 text-[10px] text-slate-400 italic">
                      Catatan: {order.notes}
                    </div>
                  )}

                  {order.rejectReason && (
                    <div className="mt-2 p-1.5 rounded bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-400 font-semibold flex items-center gap-1.5">
                      <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                      Alasan Reject: {order.rejectReason}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Controls & Stage Progress */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs text-slate-500">
                  {order.hasTechnician !== false ? (
                    <>
                      Teknisi: <strong className="text-slate-800 dark:text-slate-200">{tech?.name || 'Internal Lab'}</strong>
                      <span className="text-[10px] text-emerald-500 ml-1">({formatRupiah(order.technicianIncentive)})</span>
                    </>
                  ) : (
                    <>
                      Pengerjaan Luar: <strong className="text-amber-500 font-bold">Biaya Faset {formatRupiah(order.externalFasetCost || 20000)}</strong>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedOrderForPrint(order)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-slate-800"
                    title="Cetak SPK / Resep Kacamata"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  {/* Stage transition buttons */}
                  {order.status === 'Antrean Lab' && (
                    <button
                      onClick={() => updateFasetStatus(order.id, 'Proses Faset')}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-[11px] hover:bg-amber-400 transition-colors"
                    >
                      Mulai Faset
                    </button>
                  )}

                  {order.status === 'Proses Faset' && (
                    <button
                      onClick={() => updateFasetStatus(order.id, 'Fitting Frame')}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-[11px] hover:bg-indigo-500 transition-colors"
                    >
                      Fitting Frame
                    </button>
                  )}

                  {order.status === 'Fitting Frame' && (
                    <button
                      onClick={() => updateFasetStatus(order.id, 'QC Akurasi')}
                      className="px-2.5 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-[11px] hover:bg-purple-500 transition-colors"
                    >
                      Uji QC Lensa
                    </button>
                  )}

                  {order.status === 'QC Akurasi' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateFasetStatus(order.id, 'Selesai & Siap')}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-500 transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Lulus QC
                      </button>
                      <button
                        onClick={() => setRejectOrderId(order.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-500 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {order.status === 'Selesai & Siap' && (
                    <span className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Siap Serah/Kirim
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="col-span-2 py-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            Tidak ada pekerjaan lab faset yang sesuai dengan filter.
          </div>
        )}
      </div>

      {/* Modal Input SPK Faset Baru */}
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
              <Wrench className="w-5 h-5 text-purple-500" />
              Surat Perintah Kerja (SPK) Lab Faset Kacamata
            </h3>

            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Pasien / Customer
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nama pelanggan optik"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    No WhatsApp
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Frame Kacamata
                  </label>
                  <input
                    type="text"
                    required
                    value={frameName}
                    onChange={(e) => setFrameName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tipe & Fitur Lensa
                  </label>
                  <select
                    value={lensType}
                    onChange={(e) => setLensType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Lensa Anti Radiasi Blue Ray UV420 Index 1.56">Lensa Blue Ray UV420 Index 1.56</option>
                    <option value="Lensa Bluechromic (Photocromic + Blue Ray) Index 1.56">Lensa Bluechromic Index 1.56</option>
                    <option value="Lensa Hi-Index 1.67 Ultra Thin Anti Pantul">Lensa Hi-Index 1.67 Tipis</option>
                    <option value="Lensa Progresif Digital Freeform (Jauh + Dekat)">Lensa Progresif Digital Freeform</option>
                    <option value="Lensa Single Vision Standar CR39">Lensa Single Vision Standar CR39</option>
                  </select>
                </div>
              </div>

              {/* Prescription Parameters OD & OS */}
              <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-3">
                <div className="font-bold text-purple-400 flex items-center justify-between">
                  <span>Parameter Ukuran Lensa (Mata Kanan & Kiri)</span>
                  <div className="flex items-center gap-1.5 font-normal">
                    <span className="text-slate-400">PD (Pupil Distance):</span>
                    <input
                      type="text"
                      value={pd}
                      onChange={(e) => setPd(e.target.value)}
                      className="w-14 px-2 py-1 rounded bg-slate-800 border border-purple-500/30 text-center font-bold text-white text-xs"
                      placeholder="63"
                    />
                    <span className="text-slate-400">mm</span>
                  </div>
                </div>

                {/* OD */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-4 text-[10px] font-bold text-sky-400 uppercase">
                    R / OD (Mata Kanan)
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">SPH (Minus/Plus)</label>
                    <input
                      type="text"
                      value={rightSph}
                      onChange={(e) => setRightSph(e.target.value)}
                      placeholder="-2.00"
                      className="w-full px-2 py-1.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-center font-bold font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">CYL (Silinder)</label>
                    <input
                      type="text"
                      value={rightCyl}
                      onChange={(e) => setRightCyl(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-2 py-1.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-center font-bold font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">AXIS (Derajat)</label>
                    <input
                      type="text"
                      value={rightAxis}
                      onChange={(e) => setRightAxis(e.target.value)}
                      placeholder="0"
                      className="w-full px-2 py-1.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-center font-bold font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">ADD (Plus Baca)</label>
                    <input
                      type="text"
                      value={rightAdd}
                      onChange={(e) => setRightAdd(e.target.value)}
                      placeholder="+2.00"
                      className="w-full px-2 py-1.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-center font-bold font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* OS */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-purple-500/10">
                  <div className="col-span-4 text-[10px] font-bold text-sky-400 uppercase">
                    L / OS (Mata Kiri)
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">SPH (Minus/Plus)</label>
                    <input
                      type="text"
                      value={leftSph}
                      onChange={(e) => setLeftSph(e.target.value)}
                      placeholder="-2.00"
                      className="w-full px-2 py-1.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-center font-bold font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">CYL (Silinder)</label>
                    <input
                      type="text"
                      value={leftCyl}
                      onChange={(e) => setLeftCyl(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-2 py-1.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-center font-bold font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">AXIS (Derajat)</label>
                    <input
                      type="text"
                      value={leftAxis}
                      onChange={(e) => setLeftAxis(e.target.value)}
                      placeholder="0"
                      className="w-full px-2 py-1.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-center font-bold font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">ADD (Plus Baca)</label>
                    <input
                      type="text"
                      value={leftAdd}
                      onChange={(e) => setLeftAdd(e.target.value)}
                      placeholder="+2.00"
                      className="w-full px-2 py-1.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-center font-bold font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    Opsi Pengerjaan Faset Lensa
                  </span>
                  <div className="flex items-center gap-3 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 font-semibold">
                      <input
                        type="radio"
                        name="fasetTechMode"
                        checked={hasTechnician}
                        onChange={() => setHasTechnician(true)}
                        className="text-sky-600"
                      />
                      <span>Teknisi Internal</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 font-semibold">
                      <input
                        type="radio"
                        name="fasetTechMode"
                        checked={!hasTechnician}
                        onChange={() => setHasTechnician(false)}
                        className="text-sky-600"
                      />
                      <span>Tidak Ada Teknisi (Faset Luar)</span>
                    </label>
                  </div>
                </div>

                {hasTechnician ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 text-xs">
                        Pilih Teknisi Lab Faset / RO
                      </label>
                      <select
                        value={technicianId}
                        onChange={(e) => setTechnicianId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                      >
                        {employees.map((t) => (
                          <option key={t.id} value={t.id}>{t.name} ({t.roles.join(', ')})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 text-xs">
                        Insentif Teknisi Lab (Rp)
                      </label>
                      <input
                        type="number"
                        value={technicianIncentive}
                        onChange={(e) => setTechnicianIncentive(parseInt(e.target.value, 10) || 0)}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="pt-1">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 text-xs">
                      Biaya Faset (External Edging Cost / Pasang)
                    </label>
                    <input
                      type="number"
                      value={externalFasetCost}
                      onChange={(e) => setExternalFasetCost(parseInt(e.target.value, 10) || 0)}
                      placeholder="Misal: 25000"
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-amber-500 text-xs"
                    />
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                      Biaya faset pihak ketiga/maklon akan otomatis dicatat sebagai pengeluaran lab faset dan HPP.
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Instruksi Khusus Faset / Fitting
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Misal: Bevel rata jangan sampai nongol, stel nosepad agak sempit..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
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
                  className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-md shadow-purple-600/20"
                >
                  Kirim ke Antrean Lab Faset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h4 className="text-sm font-bold text-rose-500 flex items-center gap-2 mb-2">
              <AlertOctagon className="w-5 h-5" />
              Klasifikasi Reject Lab Faset
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Pilih alasan kegagalan faset lensa untuk evaluasi kontrol kualitas teknisi:
            </p>

            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white mb-5 focus:ring-2 focus:ring-rose-500"
            >
              <option value="Lensa Pecah/Garis saat Edging">Lensa Pecah/Garis saat Edging</option>
              <option value="Salah Sumbu Axis Silinder">Salah Sumbu Axis Silinder</option>
              <option value="Ukuran Minus/Cyl Tidak Sesuai Resep">Ukuran Minus/Cyl Tidak Sesuai Resep</option>
              <option value="Frame Patah/Cacat saat Fitting">Frame Patah/Cacat saat Fitting</option>
              <option value="Coating Anti Radiasi Cacat Pabrik">Coating Anti Radiasi Cacat Pabrik</option>
            </select>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRejectOrderId(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-400"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white"
              >
                Tandai Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Job Order Modal (Surat Perintah Kerja Lab) */}
      {selectedOrderForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white text-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h3 className="font-black text-base tracking-tight">{store.name}</h3>
                <p className="text-[10px] text-slate-500">SURAT PERINTAH KERJA (SPK) LAB FASET OPTIK</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold">{selectedOrderForPrint.orderNumber}</span>
                <p className="text-[10px] text-slate-400">{selectedOrderForPrint.date}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Pasien:</span>
                <strong>{selectedOrderForPrint.customerName} ({selectedOrderForPrint.phone || '-'})</strong>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Frame:</span>
                <strong>{selectedOrderForPrint.frameName}</strong>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Lensa:</span>
                <strong>{selectedOrderForPrint.lensType}</strong>
              </div>

              {/* Prescription Spec Table */}
              <div className="p-3 bg-slate-100 rounded-xl font-mono text-xs">
                <div className="text-[10px] font-bold text-slate-500 mb-1 flex justify-between">
                  <span>PARAMETER RESEP KACAMATA</span>
                  <span>PD: {selectedOrderForPrint.prescription.pd}</span>
                </div>
                <table className="w-full text-center text-xs">
                  <thead>
                    <tr className="text-slate-400 text-[10px]">
                      <th>MATA</th>
                      <th>SPH</th>
                      <th>CYL</th>
                      <th>AXIS</th>
                      <th>ADD</th>
                    </tr>
                  </thead>
                  <tbody className="font-bold">
                    <tr>
                      <td className="text-sky-600 text-left">OD (Kanan)</td>
                      <td>{selectedOrderForPrint.prescription.rightEye.sph}</td>
                      <td>{selectedOrderForPrint.prescription.rightEye.cyl}</td>
                      <td>{selectedOrderForPrint.prescription.rightEye.axis}°</td>
                      <td>{selectedOrderForPrint.prescription.rightEye.add || '-'}</td>
                    </tr>
                    <tr>
                      <td className="text-sky-600 text-left">OS (Kiri)</td>
                      <td>{selectedOrderForPrint.prescription.leftEye.sph}</td>
                      <td>{selectedOrderForPrint.prescription.leftEye.cyl}</td>
                      <td>{selectedOrderForPrint.prescription.leftEye.axis}°</td>
                      <td>{selectedOrderForPrint.prescription.leftEye.add || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {selectedOrderForPrint.notes && (
                <div className="p-2 bg-amber-50 text-amber-800 text-[11px] rounded border border-amber-200">
                  Instruksi: {selectedOrderForPrint.notes}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t flex justify-between items-center">
              <button
                onClick={() => setSelectedOrderForPrint(null)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-sky-600 text-white font-semibold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak SPK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
