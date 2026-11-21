import React, { useMemo, useState } from 'react';
import { Printer, ArrowLeft } from 'lucide-react';
import type { SinergiDatabase } from '../types/sinergi';

interface PdfReportViewProps {
  db: SinergiDatabase;
  onBack: () => void;
}

export const PdfReportView: React.FC<PdfReportViewProps> = ({ db, onBack }) => {
  const [reportType, setReportType] = useState<'gabungan' | 'nilai' | 'hafalan'>('gabungan');
  const [selectedKelas, setSelectedKelas] = useState('ALL');
  const [selectedNisn, setSelectedNisn] = useState('ALL');

  const kelasList = useMemo(
    () => Array.from(new Set(db.data_siswa.map((s) => s.Kelas))).sort(),
    [db.data_siswa]
  );

  const filteredStudents = useMemo(() => {
    if (selectedKelas === 'ALL') return db.data_siswa;
    return db.data_siswa.filter((s) => s.Kelas === selectedKelas);
  }, [db.data_siswa, selectedKelas]);

  const nilaiRows = useMemo(() => {
    return db.nilai.filter((n) => {
      if (selectedKelas !== 'ALL' && n.Kelas !== selectedKelas) return false;
      if (selectedNisn !== 'ALL' && n.NISN !== selectedNisn) return false;
      return true;
    });
  }, [db.nilai, selectedKelas, selectedNisn]);

  const hafalanRows = useMemo(() => {
    return db.evaluasi_hafalan.filter((h) => {
      if (selectedKelas !== 'ALL' && h.Kelas !== selectedKelas) return false;
      if (selectedNisn !== 'ALL' && h.NISN !== selectedNisn) return false;
      return true;
    });
  }, [db.evaluasi_hafalan, selectedKelas, selectedNisn]);

  const avgNilai = nilaiRows.length
    ? (nilaiRows.reduce((acc, r) => acc + Number(r.Nilai || 0), 0) / nilaiRows.length).toFixed(1)
    : '0.0';

  const avgHafalan = hafalanRows.length
    ? (hafalanRows.reduce((acc, r) => acc + Number(r.Nilai || 0), 0) / hafalanRows.length).toFixed(1)
    : '0.0';

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-4">
      {/* Print Controls Toolbar (Hidden on Print) */}
      <div className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </button>

          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as 'gabungan' | 'nilai' | 'hafalan')}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
          >
            <option value="gabungan">Rekap Nilai &amp; Evaluasi Setor Hafalan</option>
            <option value="nilai">Rekap Nilai Akademik Saja</option>
            <option value="hafalan">Rekap Evaluasi Setor Hafalan Saja</option>
          </select>

          <select
            value={selectedKelas}
            onChange={(e) => {
              setSelectedKelas(e.target.value);
              setSelectedNisn('ALL');
            }}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
          >
            <option value="ALL">Semua Kelas</option>
            {kelasList.map((k) => (
              <option key={k} value={k}>
                Kelas {k}
              </option>
            ))}
          </select>

          <select
            value={selectedNisn}
            onChange={(e) => setSelectedNisn(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
          >
            <option value="ALL">Semua Siswa</option>
            {filteredStudents.map((s) => (
              <option key={s.NISN} value={s.NISN}>
                {s.NamaSiswa} ({s.NISN})
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak / Simpan PDF</span>
        </button>
      </div>

      {/* Printable A4 Sheet */}
      <div className="print-only-container bg-white text-slate-900 border border-slate-200 rounded-xl p-8 sm:p-10 max-w-4xl mx-auto">
        {/* Letterhead */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center">
          <p className="text-xs font-semibold tracking-wider text-slate-600">
            {db.teacherProfile.sekolah.toUpperCase()}
          </p>
          <h2 className="font-display text-xl font-bold mt-1">
            LAPORAN REKAPITULASI NILAI &amp; EVALUASI SETOR HAFALAN PAIBP
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            {db.teacherProfile.alamat} · Email: {db.teacherProfile.email}
          </p>
        </div>

        {/* Metadata Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
          <div>
            <span className="text-slate-500 block">Kelas</span>
            <span className="font-semibold">{selectedKelas === 'ALL' ? 'Semua Kelas' : `Kelas ${selectedKelas}`}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Tanggal Cetak</span>
            <span className="font-semibold font-mono tabular-nums">{todayFormatted}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Rata-rata Nilai</span>
            <span className="font-semibold font-mono tabular-nums">{avgNilai}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Rata-rata Hafalan</span>
            <span className="font-semibold font-mono tabular-nums">{avgHafalan}</span>
          </div>
        </div>

        {/* Section A: Nilai */}
        {(reportType === 'gabungan' || reportType === 'nilai') && (
          <div className="mb-8">
            <h3 className="font-display text-sm font-bold mb-2.5">
              A. Rekapitulasi Nilai Akademik PAIBP
            </h3>
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 py-2 px-2.5 text-left">No</th>
                  <th className="border border-slate-300 py-2 px-2.5 text-left">NISN</th>
                  <th className="border border-slate-300 py-2 px-2.5 text-left">Nama Siswa</th>
                  <th className="border border-slate-300 py-2 px-2.5 text-left">Kelas</th>
                  <th className="border border-slate-300 py-2 px-2.5 text-left">Jenis Evaluasi</th>
                  <th className="border border-slate-300 py-2 px-2.5 text-left">Semester</th>
                  <th className="border border-slate-300 py-2 px-2.5 text-right">Nilai</th>
                </tr>
              </thead>
              <tbody>
                {nilaiRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="border border-slate-300 py-4 text-center text-slate-500">
                      Tidak ada data nilai sesuai filter.
                    </td>
                  </tr>
                ) : (
                  nilaiRows.map((n, idx) => (
                    <tr key={n.IDNilai}>
                      <td className="border border-slate-300 py-1.5 px-2.5 font-mono tabular-nums">{idx + 1}</td>
                      <td className="border border-slate-300 py-1.5 px-2.5 font-mono tabular-nums">{n.NISN}</td>
                      <td className="border border-slate-300 py-1.5 px-2.5">{n.NamaSiswa}</td>
                      <td className="border border-slate-300 py-1.5 px-2.5">{n.Kelas}</td>
                      <td className="border border-slate-300 py-1.5 px-2.5">{n.JenisEvaluasi}</td>
                      <td className="border border-slate-300 py-1.5 px-2.5">{n.Semester}</td>
                      <td className="border border-slate-300 py-1.5 px-2.5 text-right font-mono font-bold tabular-nums">
                        {n.Nilai}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Section B: Evaluasi Setor Hafalan */}
        {(reportType === 'gabungan' || reportType === 'hafalan') && (
          <div className="mb-8">
            <h3 className="font-display text-sm font-bold mb-2.5">
              B. Rekapitulasi Evaluasi Setor Hafalan
            </h3>
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 py-2 px-2.5 text-left">No</th>
                  <th className="border border-slate-300 py-2 px-2.5 text-left">Hari / Tanggal</th>
                  <th className="border border-slate-300 py-2 px-2.5 text-left">Nama Siswa</th>
                  <th className="border border-slate-300 py-2 px-2.5 text-left">Kelas</th>
                  <th className="border border-slate-300 py-2 px-2.5 text-left">Nama Surah</th>
                  <th className="border border-slate-300 py-2 px-2.5 text-right">Nilai</th>
                  <th className="border border-slate-300 py-2 px-2.5 text-left">Catatan Evaluasi</th>
                </tr>
              </thead>
              <tbody>
                {hafalanRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="border border-slate-300 py-4 text-center text-slate-500">
                      Tidak ada data setor hafalan sesuai filter.
                    </td>
                  </tr>
                ) : (
                  hafalanRows.map((h, idx) => (
                    <tr key={h.IDHafalan}>
                      <td className="border border-slate-300 py-1.5 px-2.5 font-mono tabular-nums">{idx + 1}</td>
                      <td className="border border-slate-300 py-1.5 px-2.5">{h.HariTanggal}</td>
                      <td className="border border-slate-300 py-1.5 px-2.5">{h.NamaSiswa}</td>
                      <td className="border border-slate-300 py-1.5 px-2.5">{h.Kelas}</td>
                      <td className="border border-slate-300 py-1.5 px-2.5 font-medium">{h.NamaSurah}</td>
                      <td className="border border-slate-300 py-1.5 px-2.5 text-right font-mono font-bold tabular-nums">
                        {h.Nilai}
                      </td>
                      <td className="border border-slate-300 py-1.5 px-2.5">{h.CatatanEvaluasi}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Signature Block */}
        <div className="flex justify-end mt-10 pt-4 text-xs">
          <div className="text-left w-64">
            <p>{todayFormatted}</p>
            <p className="mt-0.5">Guru Mata Pelajaran PAIBP,</p>
            <div className="h-16" />
            <p className="font-bold underline">{db.teacherProfile.nama}</p>
            <p className="font-mono text-[11px] text-slate-600">NIP. {db.teacherProfile.nip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
