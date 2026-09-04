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
  const { employees, addEmployee, updateEmployee, deleteEmployee, store, showToast } = useApp();

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

        <button
          onClick={handleOpenAddModal}
          className="py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 flex items-center gap-2 transition-all shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Tambah Pegawai Baru</span>
        </button>
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
          <button
            onClick={handleOpenAddModal}
            className="py-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tambah Pegawai Pertama</span>
          </button>
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

      {/* Form Modal (Add / Edit Pegawai) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl my-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">
                  {editingId ? 'Edit Data Pegawai' : 'Buat Akun & Skema Pegawai Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Basic Identitas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Nomor HP / WhatsApp</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 081298765432"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Login Credentials dibuat oleh Owner */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-750 space-y-3">
                <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider">
                  Kredensial Login Pegawai (Dibuat oleh Owner)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Username Login</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="budi_optisi"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Password Login</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full px-3 pr-9 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:border-sky-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Multi-Role (Bisa Rangkap) */}
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  Role Peran Kerja (Dapat Dipilih Lebih Dari Satu / Bisa Rangkap)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ALL_ROLES.map((role) => {
                    const isSelected = selectedRoles.includes(role.key);
                    return (
                      <button
                        key={role.key}
                        type="button"
                        onClick={() => toggleRole(role.key)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-sky-600/15 border-sky-500 text-white shadow-sm'
                            : 'bg-slate-800/70 border-slate-700/80 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border shrink-0 ${
                            isSelected
                              ? 'bg-sky-600 border-sky-500 text-white'
                              : 'border-slate-600 bg-slate-800'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="font-bold text-xs flex items-center gap-1.5">
                            <span>{role.label}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">{role.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Skema Gaji Pokok */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-750 space-y-3">
                <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider">
                  Skema Gaji Pokok
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Periode Gaji</label>
                    <select
                      value={salaryPeriod}
                      onChange={(e) => setSalaryPeriod(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    >
                      <option value="hourly">Per Jam</option>
                      <option value="daily">Per Hari</option>
                      <option value="monthly">Per Bulan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Nominal Gaji (Rp)</label>
                    <input
                      type="number"
                      value={salaryRate}
                      onChange={(e) => setSalaryRate(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Hitungan Gaji</label>
                    <select
                      value={salaryCalculationType}
                      onChange={(e) => setSalaryCalculationType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    >
                      <option value="flat">Gaji Tetap (Flat)</option>
                      <option value="per_pcs">Sesuai Pcs Terjual</option>
                      <option value="per_package">Sesuai Paket Terjual</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Skema Insentif */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-750 space-y-3">
                <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider">
                  Skema Insentif Penjualan
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Periode Insentif</label>
                    <select
                      value={incentivePeriod}
                      onChange={(e) => setIncentivePeriod(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    >
                      <option value="daily">Per Hari</option>
                      <option value="weekly">Per Minggu</option>
                      <option value="monthly">Per Bulan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Nominal Insentif (Rp)</label>
                    <input
                      type="number"
                      value={incentiveRate}
                      onChange={(e) => setIncentiveRate(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Berdasarkan</label>
                    <select
                      value={incentiveCalculationType}
                      onChange={(e) => setIncentiveCalculationType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    >
                      <option value="per_pcs">Per Pcs Terjual</option>
                      <option value="per_package">Per Paket Resep</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Insentif Tambahan Target Per Hari */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-750 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                    Insentif Tambahan Target Per Hari
                  </span>
                  <label className="flex items-center gap-1.5 text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dailyTargetEnabled}
                      onChange={(e) => setDailyTargetEnabled(e.target.checked)}
                      className="rounded"
                    />
                    <span>Aktifkan</span>
                  </label>
                </div>

                {dailyTargetEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">
                        Batas Target (Misal: &gt; 20 pcs)
                      </label>
                      <input
                        type="number"
                        value={dailyThresholdUnits}
                        onChange={(e) => setDailyThresholdUnits(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">
                        Insentif Reguler s/d Batas (Rp)
                      </label>
                      <input
                        type="number"
                        value={dailyRegularRate}
                        onChange={(e) => setDailyRegularRate(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">
                        Bonus Tambahan Ke-21 Dst (Rp)
                      </label>
                      <input
                        type="number"
                        value={dailyExcessBonusRate}
                        onChange={(e) => setDailyExcessBonusRate(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Insentif Tambahan Target Per Bulan (Target Omzet & % Laba Bersih) */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-750 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-purple-400" />
                    Insentif Tambahan Target Per Bulan
                  </span>
                  <label className="flex items-center gap-1.5 text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={monthlyTargetEnabled}
                      onChange={(e) => setMonthlyTargetEnabled(e.target.checked)}
                      className="rounded"
                    />
                    <span>Aktifkan</span>
                  </label>
                </div>

                {monthlyTargetEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">
                        Target Omzet Bulanan Toko (Rp)
                      </label>
                      <input
                        type="number"
                        value={monthlyTargetOmzet}
                        onChange={(e) => setMonthlyTargetOmzet(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold">
                        Insentif: % Dari Laba Bersih Setelah Semua Pengeluaran
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          value={monthlyNetProfitPercent}
                          onChange={(e) => setMonthlyNetProfitPercent(Number(e.target.value))}
                          placeholder="2.5"
                          className="w-full px-3 pr-8 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
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
                  className="rounded"
                />
                <label htmlFor="empActive" className="text-slate-300 font-semibold cursor-pointer">
                  Status Pegawai Aktif Bekerja
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-lg shadow-sky-600/30"
                >
                  {editingId ? 'Simpan Perubahan' : 'Daftarkan Pegawai'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
