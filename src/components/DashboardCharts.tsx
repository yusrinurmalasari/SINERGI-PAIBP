import React, { useMemo, useState } from 'react';
import type { SinergiDatabase } from '../types/sinergi';

interface DashboardChartsProps {
  db: SinergiDatabase;
}

const MONTHS = [
  { value: '01', label: 'Januari' },
  { value: '02', label: 'Februari' },
  { value: '03', label: 'Maret' },
  { value: '04', label: 'April' },
  { value: '05', label: 'Mei' },
  { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' },
  { value: '08', label: 'Agustus' },
  { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
];

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ db }) => {
  const [selectedMonth, setSelectedMonth] = useState('11');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);

  const availableYears = useMemo(() => {
    const years = new Set<string>(['2025', '2026', '2027']);
    db.absensi.forEach((a) => {
      if (a.Tanggal && a.Tanggal.length >= 4) years.add(a.Tanggal.slice(0, 4));
    });
    return Array.from(years).sort();
  }, [db.absensi]);

  const absensiFiltered = useMemo(() => {
    const prefix = `${selectedYear}-${selectedMonth}`;
    return db.absensi.filter((a) => String(a.Tanggal || '').startsWith(prefix));
  }, [db.absensi, selectedMonth, selectedYear]);

  const statusStats = useMemo(() => {
    const counts = { Hadir: 0, Sakit: 0, Izin: 0, Alpha: 0 };
    absensiFiltered.forEach((a) => {
      if (a.Status === 'Hadir') counts.Hadir += 1;
      else if (a.Status === 'Sakit') counts.Sakit += 1;
      else if (a.Status === 'Izin') counts.Izin += 1;
      else if (a.Status === 'Alpha') counts.Alpha += 1;
    });
    const total = counts.Hadir + counts.Sakit + counts.Izin + counts.Alpha;
    return [
      { key: 'Hadir', count: counts.Hadir, color: '#16A34A', pct: total ? Math.round((counts.Hadir / total) * 100) : 0 },
      { key: 'Sakit', count: counts.Sakit, color: '#D97706', pct: total ? Math.round((counts.Sakit / total) * 100) : 0 },
      { key: 'Izin', count: counts.Izin, color: '#2563EB', pct: total ? Math.round((counts.Izin / total) * 100) : 0 },
      { key: 'Alpha', count: counts.Alpha, color: '#DC2626', pct: total ? Math.round((counts.Alpha / total) * 100) : 0 },
    ];
  }, [absensiFiltered]);

  const maxCount = Math.max(1, ...statusStats.map((s) => s.count));
  const totalAttendanceEntries = statusStats.reduce((sum, s) => sum + s.count, 0);

  // Class performance averages (Nilai vs Hafalan)
  const classSummary = useMemo(() => {
    const kelasSet = Array.from(new Set(db.data_siswa.map((s) => s.Kelas))).sort();
    return kelasSet.map((kelas) => {
      const nilaiList = db.nilai.filter((n) => n.Kelas === kelas).map((n) => Number(n.Nilai) || 0);
      const hafalanList = db.evaluasi_hafalan.filter((h) => h.Kelas === kelas).map((h) => Number(h.Nilai) || 0);
      const avgNilai = nilaiList.length ? Math.round(nilaiList.reduce((a, b) => a + b, 0) / nilaiList.length) : 0;
      const avgHafalan = hafalanList.length ? Math.round(hafalanList.reduce((a, b) => a + b, 0) / hafalanList.length) : 0;
      const studentCount = db.data_siswa.filter((s) => s.Kelas === kelas).length;
      return { kelas, avgNilai, avgHafalan, studentCount };
    });
  }, [db.data_siswa, db.nilai, db.evaluasi_hafalan]);

  // SVG Donut ring calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let cumulativeDash = 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between">
      {/* Header + Month & Year Dropdowns */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Visualisasi Kehadiran Bulanan
          </p>
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
            Rekapitulasi Absensi &amp; Capaian Kelas
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <select
            aria-label="Filter Bulan Absensi"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter Tahun Absensi"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Chart Grid: Grouped Bar Chart + Donut Proportion */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Bar Chart */}
        <div className="md:col-span-7">
          <div className="h-44 flex items-end justify-around gap-4 px-3 pt-4 pb-2 border-b border-slate-200 dark:border-slate-800">
            {statusStats.map((item) => {
              const barHeightPct = totalAttendanceEntries > 0 ? Math.max(8, (item.count / maxCount) * 100) : 4;
              const isHovered = hoveredStatus === item.key;
              return (
                <div
                  key={item.key}
                  onMouseEnter={() => setHoveredStatus(item.key)}
                  onMouseLeave={() => setHoveredStatus(null)}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end cursor-default"
                >
                  <span className="text-xs font-mono font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                    {item.count}
                  </span>
                  <div className="w-full max-w-[44px] h-28 flex items-end justify-center">
                    <div
                      style={{
                        height: `${barHeightPct}%`,
                        backgroundColor: item.color,
                        opacity: hoveredStatus && !isHovered ? 0.45 : 1,
                      }}
                      className="w-full rounded-t-md transition-all duration-200"
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-4 gap-2 pt-2 text-center">
            {statusStats.map((item) => (
              <div key={item.key} className="text-xs text-slate-600 dark:text-slate-400">
                <span className="font-medium block">{item.key}</span>
                <span className="font-mono tabular-nums text-[11px] text-slate-500">{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut Chart */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="16"
                className="text-slate-100 dark:text-slate-800"
              />
              {totalAttendanceEntries > 0 &&
                statusStats.map((seg) => {
                  const segLength = (seg.count / totalAttendanceEntries) * circumference;
                  const dashOffset = -cumulativeDash;
                  cumulativeDash += segLength;
                  if (seg.count === 0) return null;
                  return (
                    <circle
                      key={seg.key}
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="16"
                      strokeDasharray={`${segLength} ${circumference}`}
                      strokeDashoffset={dashOffset}
                      className="transition-all duration-300"
                    />
                  );
                })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-mono text-xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {totalAttendanceEntries}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Entri Absen</span>
            </div>
          </div>
        </div>
      </div>

      {/* Per-Class Average Nilai vs Hafalan Strip */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2.5">
          <span>Rata-rata Nilai Akademik &amp; Setor Hafalan per Kelas</span>
          <span className="font-mono">Skala 0–100</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {classSummary.map((c) => (
            <div
              key={c.kelas}
              className="px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800"
            >
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span>Kelas {c.kelas}</span>
                <span className="text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                  {c.studentCount} siswa
                </span>
              </div>
              <div className="space-y-1.5">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-0.5">
                    <span>Nilai</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">{c.avgNilai}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${c.avgNilai}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-0.5">
                    <span>Hafalan</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">{c.avgHafalan}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${c.avgHafalan}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
