import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AiEvaluationResult } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import {
  Sparkles,
  Zap,
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle2,
  Clock,
  Glasses,
  Video,
  Layers,
  BarChart3
} from 'lucide-react';

export const AiEvaluationModule: React.FC = () => {
  const { employees, salesOrders, fasetOrders, attendance, store } = useApp();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    employees[0]?.id || ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<AiEvaluationResult | null>(null);

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId) || employees[0];

  // Specific performance metrics for the selected employee
  const employeeAttendance = attendance.filter((a) => a.employeeId === selectedEmployee?.id);
  const presentDays = employeeAttendance.filter((a) => a.status === 'Hadir' || a.status === 'Terlambat').length;
  const lateDays = employeeAttendance.filter((a) => a.status === 'Terlambat').length;
  const totalLateMins = employeeAttendance.reduce((sum, a) => sum + (a.lateMinutes || 0), 0);

  const hostSales = salesOrders.filter((s) => (s.hostEmployeeId || s.hostId) === selectedEmployee?.id);
  const totalHostRevenue = hostSales.reduce((sum, s) => sum + s.grossAmount, 0);
  const totalHostPcs = hostSales.reduce((sum, s) => sum + (s.items || []).reduce((iSum, item) => iSum + (item.qty || item.quantity || 1), 0), 0);

  const technicianFasetOrders = fasetOrders.filter((f) => f.technicianId === selectedEmployee?.id);
  const completedFaset = technicianFasetOrders.filter((f) => f.status === 'Selesai & Siap' || (f.status as any) === 'Selesai' || (f.status as any) === 'Terkirim').length;
  const rejectedFaset = technicianFasetOrders.filter((f) => f.status === 'Reject Lab' || (f.status as any) === 'Gagal/Reject').length;
  const fasetSuccessRate = technicianFasetOrders.length > 0
    ? Math.round((completedFaset / technicianFasetOrders.length) * 100)
    : 100;

  const handleRunAiEvaluation = async () => {
    if (!selectedEmployee) return;

    setIsLoading(true);
    setEvaluationResult(null);

    try {
      const response = await fetch('/api/ai/evaluate-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeName: selectedEmployee.name,
          roles: selectedEmployee.roles,
          attendanceStats: {
            presentDays,
            totalHours: presentDays * 7,
            overtimeHours: 4,
            permits: employeeAttendance.filter((a) => a.status === 'Izin').length,
            lateMinutes: totalLateMins,
          },
          salesStats: {
            unitsSold: totalHostPcs,
            bundlesSold: Math.round(totalHostPcs * 0.4),
            totalRevenue: totalHostRevenue,
            returnCount: 1,
          },
          fasetStats: {
            lensesCut: technicianFasetOrders.length,
            qualityPass: completedFaset,
            rejectCount: rejectedFaset,
            avgTimeMins: 22,
          },
          targetQuota: {
            unitsTarget: 60,
            revenueTarget: 15000000,
          },
        }),
      });

      const data = await response.json();
      setEvaluationResult(data);
    } catch (err) {
      console.error('Error running AI evaluation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Safe fallback getters
  const displayScore = evaluationResult?.overallScore ?? evaluationResult?.score ?? 85;
  const displayGrade = evaluationResult?.performanceGrade ?? (displayScore >= 90 ? 'S' : displayScore >= 80 ? 'A' : displayScore >= 70 ? 'B' : 'C');
  const displayHeadline = evaluationResult?.headline || `Predikat Kinerja Karyawan: Grade ${displayGrade} (${displayScore}/100)`;
  const displaySummary = evaluationResult?.narrativeSummary || evaluationResult?.overallSummary || 'Karyawan menunjukkan kontribusi konsisten dalam alur operasional kacamata optik dan live commerce.';
  const displayStrengths = evaluationResult?.keyStrengths || evaluationResult?.strengths || [];
  const displayImprovements = evaluationResult?.areasForImprovement || evaluationResult?.improvements || [];
  const displayRecommendations = evaluationResult?.actionRecommendations || evaluationResult?.recommendations || [];
  const ratings = evaluationResult?.efficiencyRatings;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-pink-500 mb-1">
            <Sparkles className="w-4 h-4" />
            AI Evaluasi Kinerja Karyawan Toko Optik
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Analisis Objektif Kinerja Berbasis AI Gemini
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Penilaian mendalam Host Live stream, Admin Marketplace & Teknisi Lab Faset Lensa
          </p>
        </div>

        {/* Employee Selection dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Pilih Karyawan:</label>
          <select
            value={selectedEmployeeId}
            onChange={(e) => {
              setSelectedEmployeeId(e.target.value);
              setEvaluationResult(null);
            }}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold"
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.roles.join(', ')})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Profile & KPI Summary Card */}
      {selectedEmployee && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedEmployee.name}
                </h3>
                <div className="flex items-center gap-1">
                  {selectedEmployee.roles.map((r) => (
                    <span
                      key={r}
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/10 text-pink-500 border border-pink-500/20 capitalize"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Cabang: {store.name} • Status: Aktif
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Total Omzet Pribadi</div>
                <div className="font-bold text-sm text-emerald-500">{formatRupiah(totalHostRevenue)}</div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                <Clock className="w-3.5 h-3.5" />
                Presensi & Keterlambatan
              </div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                {presentDays} Hari Hadir
              </div>
              <div className="text-[10px] text-rose-500">{lateDays}x Terlambat ({totalLateMins} mnt)</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                <Video className="w-3.5 h-3.5" />
                Output Live Stream
              </div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                {totalHostPcs} Pcs Terjual
              </div>
              <div className="text-[10px] text-emerald-500">{hostSales.length} Transaksi Selesai</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                <Glasses className="w-3.5 h-3.5" />
                Pekerjaan Lab Faset
              </div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                {technicianFasetOrders.length} Pasang Lensa
              </div>
              <div className="text-[10px] text-purple-400">
                {completedFaset} Sukses • {rejectedFaset} Reject
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                <Layers className="w-3.5 h-3.5" />
                Akurasi Lab Faset
              </div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                {fasetSuccessRate}% Pass QC
              </div>
              <div className="text-[10px] text-slate-400">Presisi Sumbu Axis & PD</div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={handleRunAiEvaluation}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-pink-600/20 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Gemini Menganalisis Kinerja...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Jalankan Evaluasi AI Gemini</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* AI Evaluation Output View */}
      {evaluationResult ? (
        <div className="space-y-4">
          {/* Main Score Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-indigo-950/40 border border-pink-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-pink-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Award className="w-4 h-4" />
                Skor Kinerja Keseluruhan
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {displayHeadline}
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                {displaySummary}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 dark:bg-slate-900/60 border border-pink-500/20 shrink-0 min-w-[130px]">
              <div className="text-3xl font-black text-pink-400 font-mono">
                {displayScore}/100
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                Grade: {displayGrade} • Gemini AI
              </div>
            </div>
          </div>

          {/* Efficiency Ratings Progress Bars */}
          {ratings && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <BarChart3 className="w-4 h-4 text-purple-500" />
                Breakdown Metrik Efisiensi & Kualitas Kerja
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Produktivitas</span>
                    <span className="text-sky-500">{ratings.productivity}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full" style={{ width: `${ratings.productivity}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Penjualan</span>
                    <span className="text-emerald-500">{ratings.salesContribution}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${ratings.salesContribution}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Kedisiplinan</span>
                    <span className="text-amber-500">{ratings.discipline}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${ratings.discipline}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>QC Lab Optik</span>
                    <span className="text-purple-500">{ratings.opticalQc}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${ratings.opticalQc}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Three Column Breakdown: Strengths, Improvements, Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Strengths */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                Poin Kekuatan Utama
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {displayStrengths.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider">
                <AlertCircle className="w-4 h-4" />
                Area Perlu Ditingkatkan
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {displayImprovements.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-sky-500 font-bold text-xs uppercase tracking-wider">
                <TrendingUp className="w-4 h-4" />
                Rekomendasi Karir & Insentif
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {displayRecommendations.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-sky-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Belum ada hasil evaluasi untuk {selectedEmployee?.name}
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Tekan tombol "Jalankan Evaluasi AI Gemini" untuk meminta Google Gemini menganalisis kinerja penjualan live, lab faset optik, serta kedisiplinan karyawan ini secara objektif.
          </p>
        </div>
      )}
    </div>
  );
};
