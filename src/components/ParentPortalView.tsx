import React, { useMemo, useState } from 'react';
import { Camera, Award, Mic, BookOpen } from 'lucide-react';
import type { AuthSession, SinergiDatabase } from '../types/sinergi';

interface ParentPortalViewProps {
  session: AuthSession;
  db: SinergiDatabase;
  activeTab: 'nilai' | 'hafalan';
  onTabChange: (tab: 'nilai' | 'hafalan') => void;
  onRefresh: () => Promise<void>;
}

export const ParentPortalView: React.FC<ParentPortalViewProps> = ({
  session,
  db,
  activeTab,
  onTabChange,
  onRefresh,
}) => {
  const [uploading, setUploading] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const nisn = session.nisn || session.username;

  const student = useMemo(
    () => db.data_siswa.find((s) => s.NISN === nisn),
    [db.data_siswa, nisn]
  );

  const studentNilai = useMemo(
    () => db.nilai.filter((n) => n.NISN === nisn),
    [db.nilai, nisn]
  );

  const studentHafalan = useMemo(
    () => db.evaluasi_hafalan.filter((h) => h.NISN === nisn),
    [db.evaluasi_hafalan, nisn]
  );

  const avgNilai = studentNilai.length
    ? Math.round(studentNilai.reduce((sum, n) => sum + Number(n.Nilai || 0), 0) / studentNilai.length)
    : 0;

  const avgHafalan = studentHafalan.length
    ? Math.round(studentHafalan.reduce((sum, h) => sum + Number(h.Nilai || 0), 0) / studentHafalan.length)
    : 0;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const fotoBase64 = String(ev.target?.result || '');
      if (fotoBase64) {
        await fetch('/api/profile/student-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nisn, fotoBase64 }),
        });
        setImgFailed(false);
        await onRefresh();
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Student Profile Banner with Photo Upload Icon */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {student?.FotoSiswa && !imgFailed ? (
                <img
                  src={student.FotoSiswa}
                  alt={student.NamaSiswa}
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className="w-20 h-20 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-emerald-700 text-white flex items-center justify-center font-display text-2xl font-bold">
                  {(student?.NamaSiswa || 'S').slice(0, 2).toUpperCase()}
                </div>
              )}

              <label
                htmlFor="parent-student-photo"
                title="Unggah foto profil siswa"
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center cursor-pointer border-2 border-white dark:border-slate-900 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                <input
                  id="parent-student-photo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>

            <div>
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                Portal Pemantauan Orangtua · Mode Lihat Saja
              </p>
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {student?.NamaSiswa || `Siswa NISN ${nisn}`}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums mt-1">
                NISN {nisn} · Kelas {student?.Kelas || '-'} · {uploading ? 'Mengunggah foto...' : 'Klik ikon kamera untuk unggah foto anak'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Rata-rata Nilai</span>
              <span className="font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {avgNilai}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Rata-rata Hafalan</span>
              <span className="font-mono text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                {avgHafalan}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Restricted 2-Menu Segmented Switcher (ONLY Nilai & Evaluasi Setor Hafalan) */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-lg w-full sm:w-fit">
        <button
          type="button"
          onClick={() => onTabChange('nilai')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'nilai'
              ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Nilai Akademik</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange('hafalan')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'hafalan'
              ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Evaluasi Setor Hafalan</span>
        </button>
      </div>

      {/* Read-only Tables */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        {activeTab === 'nilai' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <th className="py-3 px-4">Mata Pelajaran</th>
                  <th className="py-3 px-4">Jenis Evaluasi</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4 text-right">Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {studentNilai.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-500 text-sm">
                      Belum ada catatan nilai untuk NISN {nisn}.
                    </td>
                  </tr>
                ) : (
                  studentNilai.map((n) => (
                    <tr key={n.IDNilai} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-medium">{n.Mapel}</td>
                      <td className="py-3 px-4">{n.JenisEvaluasi}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{n.Semester}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                        {n.Nilai}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <th className="py-3 px-4">Hari / Tanggal</th>
                  <th className="py-3 px-4">Nama Surah</th>
                  <th className="py-3 px-4 text-right">Nilai</th>
                  <th className="py-3 px-4">Catatan Evaluasi Guru</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {studentHafalan.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-500 text-sm">
                      Belum ada riwayat setor hafalan untuk NISN {nisn}.
                    </td>
                  </tr>
                ) : (
                  studentHafalan.map((h) => (
                    <tr key={h.IDHafalan} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 whitespace-nowrap">{h.HariTanggal}</td>
                      <td className="py-3 px-4 font-medium">{h.NamaSurah}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                        {h.Nilai}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{h.CatatanEvaluasi}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Contact Teacher Note */}
      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 px-1">
        <BookOpen className="w-4 h-4 shrink-0" />
        <span>
          Data nilai dan hafalan disinkronkan secara langsung dari laporan Guru PAIBP ({db.teacherProfile.nama}).
        </span>
      </div>
    </div>
  );
};
