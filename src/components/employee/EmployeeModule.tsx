import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Employee, Role } from '../../types';
import {
  Users,
  UserPlus,
  Shield,
  DollarSign,
  TrendingUp,
  Target,
  Edit2,
  Trash2,
  Check,
  X,
  Eye,
  EyeOff,
  UserCheck,
  Award
} from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';

const ALL_ROLES: { key: Role; label: string; desc: string; color: string }[] = [
  { key: 'owner', label: 'Owner', desc: 'Pemilik optik, akses penuh ke semua modul', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { key: 'assisten', label: 'Asisten', desc: 'Membantu kasir, administrasi, dan pelaporan', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
  { key: 'optisi', label: 'Optisi / RO', desc: 'Pemeriksaan refraksi mata, resep sferis & silindris', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { key: 'pelayan', label: 'Pelayan / Pramuniaga', desc: 'Melayani konsumen, fitting frame, penjualan live', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  { key: 'teknisi', label: 'Teknisi Lab Faset', desc: 'Potong lensa faset, edging, beveling, assembly frame', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' }
];

export const EmployeeModule: React.FC = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee, store, showToast, currentUser, currentRole } = useApp();

  const isOwner = currentRole === 'owner' || currentUser?.role === 'owner' || (Array.isArray(currentUser?.roles) && currentUser.roles.includes('owner'));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>(['pelayan']);
  const [phone, setPhone] = useState('');
  const [active, setActive] = useState(true);

  // Gaji
  const [salaryPeriod, setSalaryPeriod] = useState<'hourly' | 'daily' | 'monthly'>('monthly');
  const [salaryRate, setSalaryRate] = useState<number>(2500000);
  const [salaryCalculationType, setSalaryCalculationType] = useState<'flat' | 'per_pcs' | 'per_package'>('flat');

  // Insentif
  const [incentivePeriod, setIncentivePeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [incentiveRate, setIncentiveRate] = useState<number>(5000);
  const [incentiveCalculationType, setIncentiveCalculationType] = useState<'per_pcs' | 'per_package'>('per_pcs');

  // Target Harian Tambahan
  const [dailyTargetEnabled, setDailyTargetEnabled] = useState<boolean>(true);
  const [dailyThresholdUnits, setDailyThresholdUnits] = useState<number>(20);
  const [dailyRegularRate, setDailyRegularRate] = useState<number>(5000);
  const [dailyExcessBonusRate, setDailyExcessBonusRate] = useState<number>(10000);

  // Target Bulanan Tambahan
  const [monthlyTargetEnabled, setMonthlyTargetEnabled] = useState<boolean>(true);
  const [monthlyTargetOmzet, setMonthlyTargetOmzet] = useState<number>(store.monthlyTargetOmzet || 50000000);
  const [monthlyNetProfitPercent, setMonthlyNetProfitPercent] = useState<number>(2.5);

  const resetForm = () => {
    setName('');
    setUsername('');
    setPassword('');
    setSelectedRoles(['pelayan']);
    setPhone('');
    setActive(true);
    setSalaryPeriod('monthly');
    setSalaryRate(2500000);
    setSalaryCalculationType('flat');
    setIncentivePeriod('daily');
    setIncentiveRate(5000);
    setIncentiveCalculationType('per_pcs');
    setDailyTargetEnabled(true);
    setDailyThresholdUnits(20);
    setDailyRegularRate(5000);
    setDailyExcessBonusRate(10000);
    setMonthlyTargetEnabled(true);
    setMonthlyTargetOmzet(store.monthlyTargetOmzet || 50000000);
    setMonthlyNetProfitPercent(2.5);
    setEditingId(null);
  };

  const handleOpenAddModal = () => {
    if (!isOwner) {
      showToast('Pegawai tidak dapat menambah pegawai. Akses ini khusus Owner.', 'error');
      return;
    }
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingId(emp.id);
    setName(emp.name);
    setUsername(emp.username);
    setPassword(emp.password || '');
    setSelectedRoles(emp.roles || ['pelayan']);
    setPhone(emp.phone || '');
    setActive(emp.active);

    setSalaryPeriod(emp.salaryPeriod || 'monthly');
    setSalaryRate(emp.salaryRate || 0);
    setSalaryCalculationType(emp.salaryCalculationType || 'flat');

    setIncentivePeriod(emp.incentivePeriod || 'daily');
    setIncentiveRate(emp.incentiveRate || 0);
    setIncentiveCalculationType(emp.incentiveCalculationType || 'per_pcs');

    setDailyTargetEnabled(emp.dailyTarget?.enabled ?? true);
    setDailyThresholdUnits(emp.dailyTarget?.thresholdUnits ?? 20);
    setDailyRegularRate(emp.dailyTarget?.regularRate ?? 5000);
    setDailyExcessBonusRate(emp.dailyTarget?.excessBonusRate ?? 10000);

    setMonthlyTargetEnabled(emp.monthlyTarget?.enabled ?? true);
    setMonthlyTargetOmzet(emp.monthlyTarget?.targetOmzet ?? 50000000);
    setMonthlyNetProfitPercent(emp.monthlyTarget?.netProfitPercent ?? 2.5);

    setIsModalOpen(true);
  };

  const toggleRole = (r: Role) => {
    if (selectedRoles.includes(r)) {
      if (selectedRoles.length === 1) {
        showToast('Minimal harus memiliki 1 role peran kerja', 'warning');
        return;
      }
      setSelectedRoles(selectedRoles.filter((item) => item !== r));
    } else {
      setSelectedRoles([...selectedRoles, r]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId && !isOwner) {
      showToast('Pegawai tidak dapat menambah pegawai. Akses ini khusus Owner.', 'error');
      return;
    }
    if (!name.trim() || !username.trim()) {
      showToast('Nama dan Username wajib diisi', 'error');
      return;
    }

    const empPayload: Omit<Employee, 'id'> = {
      storeId: store.id,
      name: name.trim(),
      username: username.trim(),
      password: password.trim() || '123456',
      roles: selectedRoles,
      phone: phone.trim(),
      active,
      salaryPeriod,
      salaryRate: Number(salaryRate) || 0,
      salaryCalculationType,
      incentivePeriod,
      incentiveRate: Number(incentiveRate) || 0,
      incentiveCalculationType,
      dailyTarget: {
        enabled: dailyTargetEnabled,
        thresholdUnits: Number(dailyThresholdUnits) || 20,
        regularRate: Number(dailyRegularRate) || 0,
        excessBonusRate: Number(dailyExcessBonusRate) || 0
      },
      monthlyTarget: {
        enabled: monthlyTargetEnabled,
        targetOmzet: Number(monthlyTargetOmzet) || 0,
        netProfitPercent: Number(monthlyNetProfitPercent) || 0
      },
      salaryScheme: {
        baseType: salaryPeriod,
        baseRate: Number(salaryRate) || 0,
        perFrameSold: Number(incentiveRate) || 0,
        perPackageSold: Number(incentiveRate) || 0,
        perLensFaset: 10000,
        fixedNominal: 0,
        ownerProfitPercent: 0,
        tierRule: {
          enabled: dailyTargetEnabled,
          thresholdUnits: Number(dailyThresholdUnits) || 20,
          bonusRate: Number(dailyExcessBonusRate) || 0,
          mode: 'excess_only'
        },
        dualRoleBonus: {
          enabled: selectedRoles.length > 1,
          quotaUnits: 10,
          bonusPerUnit: 2500
        },
        monthlyOmzetBonus: {
          enabled: monthlyTargetEnabled,
          targetOmzet: Number(monthlyTargetOmzet) || 50000000,
          type: 'percent_net_profit',
          value: Number(monthlyNetProfitPercent) || 2.5
        }
      }
    };

    if (editingId) {
      await updateEmployee(editingId, empPayload);
    } else {
      await addEmployee(empPayload);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string, empName: string) => {
    if (window.confirm(`Yakin ingin menghapus pegawai "${empName}"?`)) {
      await deleteEmployee(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-6 h-6 text-sky-400" />
            <h1 className="text-xl font-black text-white tracking-tight">Manajemen Pegawai Toko</h1>
          </div>
          <p className="text-xs text-slate-400">
            Dikelola langsung oleh Owner. Buat username, password, multi-role, skema gaji, insentif, dan target omzet.
          </p>
        </div>

        {isOwner && (
          <button
            onClick={handleOpenAddModal}
            className="py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 flex items-center gap-2 transition-all shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Tambah Pegawai Baru</span>
          </button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] font-semibold text-slate-400">Total Pegawai</span>
          <div className="text-xl font-bold text-white mt-0.5">{employees.length} Orang</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] font-semibold text-slate-400">Pegawai Aktif</span>
          <div className="text-xl font-bold text-emerald-400 mt-0.5">
            {employees.filter((e) => e.active).length} Aktif
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] font-semibold text-slate-400">Multi-Role (Rangkap)</span>
          <div className="text-xl font-bold text-purple-400 mt-0.5">
            {employees.filter((e) => (e.roles || []).length > 1).length} Pegawai
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[11px] font-semibold text-slate-400">Target Bonus Aktif</span>
          <div className="text-xl font-bold text-sky-400 mt-0.5">
            {employees.filter((e) => e.dailyTarget?.enabled || e.monthlyTarget?.enabled).length} Skema
          </div>
        </div>
      </div>

      {/* Employees Grid / Empty state */}
      {employees.length === 0 ? (
        <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Belum Ada Data Pegawai</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Data dimulai dari awal (kosong). Klik tombol di bawah untuk mendaftarkan pegawai optik beserta peran dan sistem gajinya.
          </p>
          {isOwner && (
            <button
              onClick={handleOpenAddModal}
              className="py-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Tambah Pegawai Pertama</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between"
            >
              <div>
                {/* Header Card */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                      <span>{emp.name}</span>
                      {!emp.active && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          Nonaktif
                        </span>
                      )}
                    </h3>
                    <div className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                      <span>@{emp.username}</span>
                      {emp.phone && <span>• {emp.phone}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(emp)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                      title="Edit Data Pegawai"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(emp.id, emp.name)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                      title="Hapus Pegawai"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Roles (Bisa Rangkap) */}
                <div className="mb-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Peran Kerja (Multi-Role)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(emp.roles || []).map((r) => {
                      const matchRole = ALL_ROLES.find((item) => item.key === r);
                      return (
                        <span
                          key={r}
                          className={`text-xs px-2 py-0.5 rounded-lg font-semibold border ${
                            matchRole?.color || 'text-slate-300 bg-slate-800 border-slate-700'
                          }`}
                        >
                          {matchRole?.label || r}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Gaji & Insentif Details */}
                <div className="space-y-2 py-3 border-y border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      Gaji Pokok ({emp.salaryPeriod}):
                    </span>
                    <span className="font-bold text-white">
                      {formatRupiah(emp.salaryRate || 0)}
                      {emp.salaryCalculationType !== 'flat' && ` (${emp.salaryCalculationType.replace('_', ' ')})`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                      Insentif ({emp.incentivePeriod}):
                    </span>
                    <span className="font-bold text-sky-400">
                      {formatRupiah(emp.incentiveRate || 0)} / {emp.incentiveCalculationType.replace('per_', '')}
                    </span>
                  </div>

                  {/* Target Harian */}
                  {emp.dailyTarget?.enabled && (
                    <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-750 text-[11px] space-y-1">
                      <div className="font-bold text-slate-300 flex items-center gap-1">
                        <Target className="w-3 h-3 text-amber-400" />
                        Target Harian: &gt; {emp.dailyTarget.thresholdUnits} Terjual
                      </div>
                      <div className="text-slate-400">
                        Insentif Reguler: {formatRupiah(emp.dailyTarget.regularRate)} / pcs
                      </div>
                      <div className="text-amber-400 font-semibold">
                        Bonus Tambahan: +{formatRupiah(emp.dailyTarget.excessBonusRate)} per unit ke-{emp.dailyTarget.thresholdUnits + 1} dst
                      </div>
                    </div>
                  )}

                  {/* Target Bulanan */}
                  {emp.monthlyTarget?.enabled && (
                    <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-750 text-[11px] space-y-1">
                      <div className="font-bold text-slate-300 flex items-center gap-1">
                        <Award className="w-3 h-3 text-purple-400" />
                        Target Omzet: {formatRupiah(emp.monthlyTarget.targetOmzet)}
                      </div>
                      <div className="text-purple-400 font-semibold">
                        Insentif Laba: {emp.monthlyTarget.netProfitPercent}% dari laba bersih setelah semua pengeluaran
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Account Credential Info */}
              <div className="mt-4 pt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>Login: {emp.username}</span>
                <span className="font-mono bg-slate-800/60 px-2 py-0.5 rounded text-slate-400">
                  Pass: {emp.password ? '••••••••' : 'Default'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal (Add / Edit Pegawai) with Fixed Alignment and Scroll */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl my-auto flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header (Sticky) */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingId ? 'Edit Data Pegawai' : 'Buat Akun & Skema Pegawai Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Pengaturan kredensial login, peran rangkap, dan formula penggajian
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="employee-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
              {/* 1. Basic Identitas */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">
                  1. Informasi Identitas Pegawai
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nomor HP / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contoh: 081298765432"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Login Credentials */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px] uppercase tracking-wider">
                  2. Kredensial Akun Login Pegawai (Dibuat oleh Owner)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                      Username Login <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Contoh: budi_optisi"
                      className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                      Password Login <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full px-3 pr-9 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Multi-Role (Bisa Rangkap) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-bold text-slate-800 dark:text-slate-200 text-xs">
                    3. Peran Kerja / Jabatan (Dapat Dipilih Lebih Dari Satu / Bisa Rangkap)
                  </label>
                  <span className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold">
                    {selectedRoles.length} Peran Terpilih
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ALL_ROLES.map((role) => {
                    const isSelected = selectedRoles.includes(role.key);
                    return (
                      <button
                        key={role.key}
                        type="button"
                        onClick={() => toggleRole(role.key)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 text-slate-900 dark:text-white shadow-xs'
                            : 'bg-slate-50/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border shrink-0 ${
                            isSelected
                              ? 'bg-sky-600 border-sky-500 text-white'
                              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between">
                            <span>{role.label}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                            {role.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Skema Gaji Pokok */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px] uppercase tracking-wider">
                  4. Skema Gaji Pokok
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Periode Gaji</label>
                    <select
                      value={salaryPeriod}
                      onChange={(e) => setSalaryPeriod(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="monthly">Per Bulan</option>
                      <option value="daily">Per Hari</option>
                      <option value="hourly">Per Jam</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Nominal Gaji</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                      <input
                        type="number"
                        min="0"
                        value={salaryRate || ''}
                        onChange={(e) => setSalaryRate(Number(e.target.value))}
                        placeholder="Contoh: 3000000"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Hitungan Gaji</label>
                    <select
                      value={salaryCalculationType}
                      onChange={(e) => setSalaryCalculationType(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="flat">Gaji Tetap (Flat)</option>
                      <option value="per_pcs">Sesuai Pcs Terjual</option>
                      <option value="per_package">Sesuai Paket Terjual</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 5. Skema Insentif */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px] uppercase tracking-wider">
                  5. Skema Insentif Penjualan Reguler
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Periode Insentif</label>
                    <select
                      value={incentivePeriod}
                      onChange={(e) => setIncentivePeriod(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="monthly">Per Bulan</option>
                      <option value="weekly">Per Minggu</option>
                      <option value="daily">Per Hari</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Nominal Insentif</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                      <input
                        type="number"
                        min="0"
                        value={incentiveRate || ''}
                        onChange={(e) => setIncentiveRate(Number(e.target.value))}
                        placeholder="Contoh: 15000"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Berdasarkan</label>
                    <select
                      value={incentiveCalculationType}
                      onChange={(e) => setIncentiveCalculationType(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="per_pcs">Per Pcs Terjual</option>
                      <option value="per_package">Per Paket Resep</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 6. Insentif Tambahan Target Per Hari */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-amber-500" />
                    6. Insentif Tambahan Target Per Hari
                  </span>
                  <label className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dailyTargetEnabled}
                      onChange={(e) => setDailyTargetEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-600 cursor-pointer"
                    />
                    <span>Aktifkan</span>
                  </label>
                </div>

                {dailyTargetEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                        Batas Target Unit (Misal: &gt; 20 pcs)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={dailyThresholdUnits}
                        onChange={(e) => setDailyThresholdUnits(Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                        Insentif Reguler s/d Batas
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                        <input
                          type="number"
                          min="0"
                          value={dailyRegularRate}
                          onChange={(e) => setDailyRegularRate(Number(e.target.value))}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                        Bonus Tambahan Unit Lewat Target
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                        <input
                          type="number"
                          min="0"
                          value={dailyExcessBonusRate}
                          onChange={(e) => setDailyExcessBonusRate(Number(e.target.value))}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 7. Insentif Tambahan Target Per Bulan */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-purple-500" />
                    7. Insentif Tambahan Target Per Bulan (Omzet & Laba Bersih)
                  </span>
                  <label className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={monthlyTargetEnabled}
                      onChange={(e) => setMonthlyTargetEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-600 cursor-pointer"
                    />
                    <span>Aktifkan</span>
                  </label>
                </div>

                {monthlyTargetEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                        Target Omzet Bulanan Toko
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                        <input
                          type="number"
                          min="0"
                          value={monthlyTargetOmzet}
                          onChange={(e) => setMonthlyTargetOmzet(Number(e.target.value))}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                        Bonus: % Dari Laba Bersih Setelah Semua Beban
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={monthlyNetProfitPercent}
                          onChange={(e) => setMonthlyNetProfitPercent(Number(e.target.value))}
                          placeholder="Contoh: 2.5"
                          className="w-full px-3 pr-8 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Aktif */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="empActive"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 cursor-pointer"
                />
                <label htmlFor="empActive" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                  Status Pegawai Aktif Bekerja
                </label>
              </div>
            </form>

            {/* Modal Footer (Sticky) */}
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                form="employee-form"
                className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-lg shadow-sky-600/30 transition-all cursor-pointer"
              >
                {editingId ? 'Simpan Perubahan' : 'Daftarkan Pegawai'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
