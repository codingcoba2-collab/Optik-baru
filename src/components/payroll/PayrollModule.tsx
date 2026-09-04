import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Employee, SalaryScheme } from '../../types';
import { formatRupiah, calculateEmployeePayroll, PayrollCalculation } from '../../utils/formatters';
import { CommaNumberInput } from '../common/CommaNumberInput';
import {
  DollarSign,
  Printer,
  Sliders,
  Award,
  Wrench,
  Glasses
} from 'lucide-react';

export const PayrollModule: React.FC = () => {
  const { employees, updateEmployee, salesOrders, fasetOrders, attendance, store, currentUser, currentRole } = useApp();

  const isOwner = currentRole === 'owner' || currentUser?.role === 'owner' || (Array.isArray(currentUser?.roles) && currentUser.roles.includes('owner'));

  // Restrict: Employees can only view their own salary
  const targetEmployee = employees.find((e) => e.id === currentUser?.id || e.username === currentUser?.username);
  const visibleEmployees = isOwner 
    ? employees 
    : (targetEmployee ? [targetEmployee] : (employees[0] ? [employees[0]] : []));

  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [selectedEmployeeForSlip, setSelectedEmployeeForSlip] = useState<{
    emp: Employee;
    payroll: PayrollCalculation;
  } | null>(null);

  const [editingIncentiveEmp, setEditingIncentiveEmp] = useState<Employee | null>(null);
  const [schemeForm, setSchemeForm] = useState<SalaryScheme | null>(null);

  const handleOpenConfig = (emp: Employee) => {
    if (!isOwner) return;
    setEditingIncentiveEmp(emp);
    setSchemeForm({ ...emp.salaryScheme });
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner || !editingIncentiveEmp || !schemeForm) return;

    updateEmployee(editingIncentiveEmp.id, {
      ...editingIncentiveEmp,
      salaryScheme: schemeForm,
    });
    setEditingIncentiveEmp(null);
  };

  const totalStoreOmzet = salesOrders.reduce((sum, o) => sum + o.grossAmount, 0);
  const storeNetProfit = totalStoreOmzet * 0.35; // approx 35% net margin

  const allCalculations = visibleEmployees.map((emp) => {
    const payroll = calculateEmployeePayroll(
      emp,
      attendance,
      salesOrders,
      fasetOrders,
      totalStoreOmzet,
      storeNetProfit
    );
    return { emp, payroll };
  });

  const totalPayrollBudget = allCalculations.reduce((sum, item) => sum + item.payroll.netSalary, 0);
  const totalCommissions = allCalculations.reduce(
    (sum, item) => sum + item.payroll.frameIncentive + item.payroll.packageIncentive + item.payroll.fasetIncentive + item.payroll.tierBonus,
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 mb-1">
            <DollarSign className="w-4 h-4" />
            {isOwner ? 'Payroll, Tiered Incentives & Slip Gaji Karyawan' : 'Rincian Gaji & Insentif Karyawan'}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {isOwner ? 'Penggajian & Komisi Karyawan Toko Optik' : `Gaji & Komisi: ${targetEmployee?.name || currentUser?.name || 'Saya'}`}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isOwner 
              ? 'Perhitungan otomatis komisi Host Live, Pelayan Toko, dan insentif per-pasang lensa Teknisi Faset'
              : 'Rincian slip gaji, insentif live streaming, potongan presensi, dan bonus kinerja Anda bulan ini'}
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Periode Gaji:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            {isOwner ? 'Total Anggaran Payroll Bulan Ini' : 'Gaji Bersih Diterima (Take Home)'}
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            {formatRupiah(totalPayrollBudget)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {isOwner ? `${employees.length} Karyawan Aktif` : 'Siap ditransfer / dibayarkan'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            {isOwner ? 'Total Insentif & Komisi Kinerja' : 'Total Komisi & Insentif Saya'}
          </div>
          <div className="text-lg sm:text-xl font-black text-amber-500">
            {formatRupiah(totalCommissions)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {isOwner ? 'Berdasarkan omzet live & output faset' : 'Komisi penjualan live & per-pasang lab'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            {isOwner ? 'Tingkat Kehadiran Keseluruhan' : 'Kehadiran Kerja Saya'}
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-500">
            {allCalculations.reduce((sum, item) => sum + item.payroll.daysPresent, 0)} Hari Kerja
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Presensi terverifikasi</div>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-750">
              <tr>
                <th className="py-3 px-4">Nama & Peran</th>
                <th className="py-3 px-3 text-right">Gaji Pokok</th>
                <th className="py-3 px-3 text-center">Hadir</th>
                <th className="py-3 px-3 text-right">Tunjangan</th>
                <th className="py-3 px-3 text-right">Komisi & Insentif Lab</th>
                <th className="py-3 px-3 text-right">Potongan Telat</th>
                <th className="py-3 px-3 text-right">Gaji Bersih (Take Home)</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {allCalculations.map(({ emp, payroll }) => {
                const totalIncentives =
                  payroll.frameIncentive +
                  payroll.packageIncentive +
                  payroll.fasetIncentive +
                  payroll.tierBonus +
                  payroll.dualRoleBonus +
                  payroll.monthlyOmzetBonus;

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{emp.name}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{emp.roles.join(' • ')}</div>
                    </td>
                    <td className="py-3.5 px-3 text-right text-slate-600 dark:text-slate-300">
                      {formatRupiah(payroll.basePay)}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-500">
                        {payroll.daysPresent} hari
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right text-slate-600 dark:text-slate-300">
                      {formatRupiah(payroll.fixedAllowance)}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="font-bold text-amber-600 dark:text-amber-400">
                        {formatRupiah(totalIncentives)}
                      </div>
                      {payroll.fasetIncentive > 0 && (
                        <div className="text-[9px] text-purple-400">Lab: {formatRupiah(payroll.fasetIncentive)} ({payroll.lensesFaseted} psg)</div>
                      )}
                      {(payroll.frameIncentive > 0 || payroll.packageIncentive > 0) && (
                        <div className="text-[9px] text-emerald-500">Sales: {formatRupiah(payroll.frameIncentive + payroll.packageIncentive)}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right text-rose-500 font-semibold">
                      {payroll.lateDeduction > 0 ? `-${formatRupiah(payroll.lateDeduction)}` : '-'}
                    </td>
                    <td className="py-3.5 px-3 text-right font-black text-slate-900 dark:text-white text-sm">
                      {formatRupiah(payroll.netSalary)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedEmployeeForSlip({ emp, payroll })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-slate-800 cursor-pointer"
                          title="Lihat & Cetak Slip Gaji"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {isOwner && (
                          <button
                            onClick={() => handleOpenConfig(emp)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-slate-800 cursor-pointer"
                            title="Atur Skema Insentif"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incentive Scheme Config Modal */}
      {editingIncentiveEmp && schemeForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-500" />
              Konfigurasi Skema Komisi & Insentif: {editingIncentiveEmp.name}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Atur parameter gaji pokok, insentif penjualan live streaming, dan pengerjaan lab faset optik.
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tarif Dasar ({schemeForm.baseType === 'hourly' ? 'per Jam' : 'per Hari'}) (Rp)
                  </label>
                  <CommaNumberInput
                    value={schemeForm.baseRate}
                    onChange={(val) => setSchemeForm({ ...schemeForm, baseRate: val })}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tunjangan Tetap / Uang Makan (Rp)
                  </label>
                  <CommaNumberInput
                    value={schemeForm.fixedNominal}
                    onChange={(val) => setSchemeForm({ ...schemeForm, fixedNominal: val })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Insentif Faset / Pasang Lensa (Rp)
                  </label>
                  <CommaNumberInput
                    value={schemeForm.perLensFaset}
                    onChange={(val) => setSchemeForm({ ...schemeForm, perLensFaset: val })}
                  />
                  <span className="text-[10px] text-slate-400">Teknisi Lab</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Insentif per-Frame (Rp)
                  </label>
                  <CommaNumberInput
                    value={schemeForm.perFrameSold}
                    onChange={(val) => setSchemeForm({ ...schemeForm, perFrameSold: val })}
                  />
                  <span className="text-[10px] text-slate-400">Host Live Satuan</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Insentif Bundling Resep (Rp)
                  </label>
                  <CommaNumberInput
                    value={schemeForm.perPackageSold}
                    onChange={(val) => setSchemeForm({ ...schemeForm, perPackageSold: val })}
                  />
                  <span className="text-[10px] text-slate-400">Frame + Lensa</span>
                </div>
              </div>

              {/* Tier Rules */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  Bonus Target Tier ({schemeForm.tierRule.thresholdUnits} Unit)
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Bonus Tambahan per Unit:</span>
                  <span className="font-bold text-emerald-500">{formatRupiah(schemeForm.tierRule.bonusRate)} / unit</span>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingIncentiveEmp(null)}
                  className="px-4 py-2 rounded-lg text-slate-400 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold cursor-pointer"
                >
                  Simpan Skema
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Payslip Modal */}
      {selectedEmployeeForSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white text-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            {/* Header Slip */}
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div>
                <h3 className="font-black text-lg tracking-tight">{store.name}</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  SLIP GAJI KARYAWAN OPTIK & LIVE COMMERCE
                </p>
              </div>
              <div className="text-right">
                <div className="font-bold text-xs">Periode: {selectedMonth}</div>
                <div className="text-[10px] text-emerald-600 font-semibold">Status: Siap Transfer</div>
              </div>
            </div>

            {/* Employee Info */}
            <div className="space-y-1.5 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Karyawan:</span>
                <strong className="text-slate-900">{selectedEmployeeForSlip.emp.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jabatan/Peran:</span>
                <span className="capitalize">{selectedEmployeeForSlip.emp.roles.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Rekening Bank:</span>
                <span>{selectedEmployeeForSlip.emp.bankInfo || 'BCA 8839-2910-22'}</span>
              </div>
            </div>

            {/* Salary Breakdown */}
            <div className="space-y-2 border-y py-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Gaji Pokok ({selectedEmployeeForSlip.payroll.daysPresent} hari kerja):</span>
                <span className="font-mono">{formatRupiah(selectedEmployeeForSlip.payroll.basePay)}</span>
              </div>
              {selectedEmployeeForSlip.payroll.fixedAllowance > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Tunjangan Tetap / Makan:</span>
                  <span className="font-mono">{formatRupiah(selectedEmployeeForSlip.payroll.fixedAllowance)}</span>
                </div>
              )}
              {selectedEmployeeForSlip.payroll.frameIncentive + selectedEmployeeForSlip.payroll.packageIncentive > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Komisi Penjualan Frame & Resep:</span>
                  <span className="font-mono">+{formatRupiah(selectedEmployeeForSlip.payroll.frameIncentive + selectedEmployeeForSlip.payroll.packageIncentive)}</span>
                </div>
              )}
              {selectedEmployeeForSlip.payroll.fasetIncentive > 0 && (
                <div className="flex justify-between text-purple-600">
                  <span>Insentif Lab Faset ({selectedEmployeeForSlip.payroll.lensesFaseted} pasang lensa):</span>
                  <span className="font-mono">+{formatRupiah(selectedEmployeeForSlip.payroll.fasetIncentive)}</span>
                </div>
              )}
              {selectedEmployeeForSlip.payroll.tierBonus > 0 && (
                <div className="flex justify-between text-amber-600">
                  <span>Bonus Target Tier Omzet:</span>
                  <span className="font-mono">+{formatRupiah(selectedEmployeeForSlip.payroll.tierBonus)}</span>
                </div>
              )}
              {selectedEmployeeForSlip.payroll.lateDeduction > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Potongan Keterlambatan:</span>
                  <span className="font-mono">-{formatRupiah(selectedEmployeeForSlip.payroll.lateDeduction)}</span>
                </div>
              )}
            </div>

            {/* Take Home Pay */}
            <div className="pt-3 flex justify-between items-center text-slate-900">
              <span className="font-black text-sm">TOTAL DITERIMA (TAKE HOME PAY):</span>
              <span className="font-black text-base text-emerald-600 font-mono">
                {formatRupiah(selectedEmployeeForSlip.payroll.netSalary)}
              </span>
            </div>

            <div className="mt-6 pt-4 border-t flex justify-between items-center">
              <button
                onClick={() => setSelectedEmployeeForSlip(null)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-sky-600 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak Slip Resmi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
