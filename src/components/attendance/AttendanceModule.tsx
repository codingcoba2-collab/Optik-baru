import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceRecord, ShiftType } from '../../types';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Calendar,
  UserCheck,
  Search,
  LogIn,
  LogOut,
  X
} from 'lucide-react';

export const AttendanceModule: React.FC = () => {
  const { attendance, clockIn, clockOut, addAttendance, employees, store } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShift, setSelectedShift] = useState<string>('Semua');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Manual Attendance Modal Form State
  const [employeeId, setEmployeeId] = useState(employees[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState<ShiftType>('Shift Pagi (09:00 - 15:00)');
  const [status, setStatus] = useState<'Hadir' | 'Terlambat' | 'Izin' | 'Sakit' | 'Alpa'>('Hadir');
  const [checkInTime, setCheckInTime] = useState('09:00');
  const [checkOutTime, setCheckOutTime] = useState('15:00');
  const [notes, setNotes] = useState('');

  const shifts: ShiftType[] = [
    'Shift Pagi (09:00 - 15:00)',
    'Shift Sore (15:00 - 21:00)',
    'Shift Live Streaming (Malam)',
    'Full Day',
  ];

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: AttendanceRecord = {
      id: 'att-' + Date.now(),
      employeeId,
      storeId: store.id,
      date,
      shift,
      status,
      clockIn: checkInTime,
      clockOut: checkOutTime,
      checkInTime,
      checkOutTime,
      totalHours: 6,
      lateMinutes: status === 'Terlambat' ? 30 : 0,
      notes,
    };
    addAttendance(newRecord);
    setIsManualModalOpen(false);
  };

  const filteredAttendance = attendance.filter((a) => {
    const emp = employees.find((e) => e.id === a.employeeId);
    const empName = emp ? emp.name.toLowerCase() : '';
    const matchesSearch = empName.includes(searchQuery.toLowerCase()) || a.date.includes(searchQuery);
    const matchesShift = selectedShift === 'Semua' || a.shift === selectedShift;
    return matchesSearch && matchesShift;
  });

  const totalPresent = attendance.filter((a) => a.status === 'Hadir').length;
  const totalLate = attendance.filter((a) => a.status === 'Terlambat').length;
  const totalExcused = attendance.filter((a) => a.status === 'Izin' || a.status === 'Sakit').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500 mb-1">
            <Clock className="w-4 h-4" />
            Presensi & Jadwal Shift Karyawan Optik
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Absensi Shift Masuk / Pulang
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pencatatan shift Host Live streaming, Admin order, dan Teknisi Lab Faset lensa
          </p>
        </div>

        <button
          onClick={() => setIsManualModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Input Presensi Manual</span>
        </button>
      </div>

      {/* Quick Clock-in Board for Active Employees */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-sky-500" />
          Panel Presensi Cepat Hari Ini ({new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {employees.map((emp) => {
            const todayStr = new Date().toISOString().split('T')[0];
            const todayAtt = attendance.find((a) => a.employeeId === emp.id && a.date === todayStr);

            return (
              <div
                key={emp.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-xs">{emp.name}</div>
                  <div className="text-[10px] text-slate-500 capitalize">{emp.roles.join(' • ')}</div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                  {todayAtt ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Masuk:</span>
                        <strong className="text-emerald-500 font-mono">{todayAtt.checkInTime}</strong>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Pulang:</span>
                        <strong className="text-sky-500 font-mono">{todayAtt.checkOutTime || '-'}</strong>
                      </div>
                      {!todayAtt.checkOutTime && (
                        <button
                          onClick={() => clockOut(todayAtt.id)}
                          className="w-full py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] mt-1"
                        >
                          Clock-out Sekarang
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => clockIn(emp.id, 'Shift Pagi (09:00 - 15:00)')}
                      className="w-full py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      Clock-in Masuk
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Hadir Tepat Waktu</div>
          <div className="text-lg sm:text-xl font-black text-emerald-500">
            {totalPresent} Shift
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Disiplin tinggi</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Terlambat Masuk</div>
          <div className="text-lg sm:text-xl font-black text-amber-500">
            {totalLate} Kali
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Catatan potongan kedisiplinan</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Izin / Sakit</div>
          <div className="text-lg sm:text-xl font-black text-sky-500">
            {totalExcused} Hari
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Dengan surat keterangan</div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-750">
              <tr>
                <th className="py-3 px-4">Nama Staf</th>
                <th className="py-3 px-3">Tanggal</th>
                <th className="py-3 px-3">Jadwal Shift</th>
                <th className="py-3 px-3">Jam Masuk</th>
                <th className="py-3 px-3">Jam Pulang</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {filteredAttendance.map((att) => {
                const emp = employees.find((e) => e.id === att.employeeId);
                return (
                  <tr key={att.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {emp?.name || 'Karyawan'}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-500">{att.date}</td>
                    <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">{att.shift}</td>
                    <td className="py-3.5 px-3 font-mono font-bold text-emerald-500">{att.checkInTime}</td>
                    <td className="py-3.5 px-3 font-mono font-bold text-sky-500">{att.checkOutTime || '-'}</td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          att.status === 'Hadir'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : att.status === 'Terlambat'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {att.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{att.notes || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Attendance Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500" />
              Input Presensi Karyawan Manual
            </h3>

            <form onSubmit={handleManualSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Karyawan
                </label>
                <select
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>{e.name} ({e.roles.join(', ')})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status Kehadiran
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Hadir">Hadir</option>
                    <option value="Terlambat">Terlambat</option>
                    <option value="Izin">Izin</option>
                    <option value="Sakit">Sakit</option>
                    <option value="Alpa">Alpa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Shift Kerja
                </label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value as ShiftType)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {shifts.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jam Masuk
                  </label>
                  <input
                    type="time"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jam Pulang
                  </label>
                  <input
                    type="time"
                    value={checkOutTime}
                    onChange={(e) => setCheckOutTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Keterangan dispensasi / lembur"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  Simpan Presensi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
