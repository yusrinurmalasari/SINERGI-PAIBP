import React, { useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, ExternalLink, X, MessageCircle, History, CheckCircle2, BellRing, AlertTriangle, Download } from 'lucide-react';
import type { DataSiswaRecord, SheetKey, SinergiDatabase } from '../types/sinergi';
import {
  WhatsAppNotifyModal,
  WhatsAppHistoryPanel,
  type WhatsAppTargetContext,
} from './WhatsAppNotifyModal';

export interface FieldConfig {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'url';
  options?: string[];
  required?: boolean;
  readOnlyOnEdit?: boolean;
  isStudentNisnPicker?: boolean;
  isNumericCol?: boolean;
}

export interface ModuleConfig {
  sheet: SheetKey;
  tabName: string;
  title: string;
  subtitle: string;
  idField: string;
  fields: FieldConfig[];
}

export const MODULE_CONFIGS: Record<SheetKey, ModuleConfig> = {
  data_siswa: {
    sheet: 'data_siswa',
    tabName: 'Data_Siswa',
    title: 'Data Siswa',
    subtitle: 'Tab Google Sheets: Data_Siswa (NISN, NamaSiswa, Kelas, JenisKelamin, KontakOrtu)',
    idField: 'NISN',
    fields: [
      { key: 'NISN', label: 'NISN', required: true, readOnlyOnEdit: true, isNumericCol: true },
      { key: 'NamaSiswa', label: 'Nama Siswa', required: true },
      { key: 'Kelas', label: 'Kelas', required: true },
      { key: 'JenisKelamin', label: 'Jenis Kelamin', type: 'select', options: ['L', 'P'], required: true },
      { key: 'KontakOrtu', label: 'Kontak Orangtua', isNumericCol: true },
    ],
  },
  jadwal_pelajaran: {
    sheet: 'jadwal_pelajaran',
    tabName: 'Jadwal_Pelajaran',
    title: 'Jadwal Pelajaran',
    subtitle: 'Tab Google Sheets: Jadwal_Pelajaran (IDJadwal, Hari, Jam, Kelas)',
    idField: 'IDJadwal',
    fields: [
      { key: 'IDJadwal', label: 'ID Jadwal', readOnlyOnEdit: true },
      { key: 'Hari', label: 'Hari', type: 'select', options: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'], required: true },
      { key: 'Jam', label: 'Jam Pelajaran', required: true },
      { key: 'Kelas', label: 'Kelas', required: true },
    ],
  },
  absensi: {
    sheet: 'absensi',
    tabName: 'Absensi',
    title: 'Absensi Siswa',
    subtitle: 'Tab Google Sheets: Absensi (IDAbsensi, Tanggal, NISN, NamaSiswa, Kelas, Status, Keterangan)',
    idField: 'IDAbsensi',
    fields: [
      { key: 'IDAbsensi', label: 'ID Absensi', readOnlyOnEdit: true },
      { key: 'Tanggal', label: 'Tanggal', type: 'date', required: true, isNumericCol: true },
      { key: 'NISN', label: 'NISN', isStudentNisnPicker: true, required: true, isNumericCol: true },
      { key: 'NamaSiswa', label: 'Nama Siswa', required: true },
      { key: 'Kelas', label: 'Kelas', required: true },
      { key: 'Status', label: 'Status', type: 'select', options: ['Hadir', 'Sakit', 'Izin', 'Alpha'], required: true },
      { key: 'Keterangan', label: 'Keterangan' },
    ],
  },
  nilai: {
    sheet: 'nilai',
    tabName: 'Nilai',
    title: 'Nilai Akademik PAIBP',
    subtitle: 'Tab Google Sheets: Nilai (IDNilai, NISN, NamaSiswa, Kelas, Mapel, JenisEvaluasi, Nilai, Semester)',
    idField: 'IDNilai',
    fields: [
      { key: 'IDNilai', label: 'ID Nilai', readOnlyOnEdit: true },
      { key: 'NISN', label: 'NISN', isStudentNisnPicker: true, required: true, isNumericCol: true },
      { key: 'NamaSiswa', label: 'Nama Siswa', required: true },
      { key: 'Kelas', label: 'Kelas', required: true },
      { key: 'Mapel', label: 'Mata Pelajaran', required: true },
      { key: 'JenisEvaluasi', label: 'Jenis Evaluasi', required: true },
      { key: 'Nilai', label: 'Nilai', type: 'number', required: true, isNumericCol: true },
      { key: 'Semester', label: 'Semester', required: true },
    ],
  },
  evaluasi_hafalan: {
    sheet: 'evaluasi_hafalan',
    tabName: 'Evaluasi setor hafalan',
    title: 'Evaluasi Setor Hafalan',
    subtitle: 'Tab Google Sheets: Evaluasi setor hafalan (NISN, Hari/Tanggal, Nama Siswa, Kelas, Nama Surah, Nilai, Catatan Evaluasi)',
    idField: 'IDHafalan',
    fields: [
      { key: 'IDHafalan', label: 'ID Hafalan', readOnlyOnEdit: true },
      { key: 'NISN', label: 'NISN', isStudentNisnPicker: true, required: true, isNumericCol: true },
      { key: 'HariTanggal', label: 'Hari / Tanggal', required: true },
      { key: 'NamaSiswa', label: 'Nama Siswa', required: true },
      { key: 'Kelas', label: 'Kelas', required: true },
      { key: 'NamaSurah', label: 'Nama Surah', required: true },
      { key: 'Nilai', label: 'Nilai', type: 'number', required: true, isNumericCol: true },
      { key: 'CatatanEvaluasi', label: 'Catatan Evaluasi', type: 'textarea' },
    ],
  },
  tugas: {
    sheet: 'tugas',
    tabName: 'Tugas',
    title: 'Tugas & Pengumpulan Siswa',
    subtitle: 'Tab Google Sheets: Tugas (Distribusi tugas oleh guru dan pemantauan pengumpulan tugas siswa)',
    idField: 'IDTugas',
    fields: [
      { key: 'IDTugas', label: 'ID Tugas', readOnlyOnEdit: true },
      { key: 'TanggalBuat', label: 'Tanggal Dibuat', type: 'date', required: true, isNumericCol: true },
      { key: 'Kelas', label: 'Kelas Sasaran', required: true },
      { key: 'Mapel', label: 'Mapel', required: true },
      { key: 'JudulTugas', label: 'Judul Tugas', required: true },
      { key: 'Deskripsi', label: 'Instruksi Tugas', type: 'textarea' },
      { key: 'Tenggat', label: 'Tenggat Waktu', type: 'date', required: true, isNumericCol: true },
      { key: 'LinkMateri', label: 'Link Materi / Soal', type: 'url' },
      { key: 'NISN_Pengumpul', label: 'NISN Siswa Pengumpul', isStudentNisnPicker: true, isNumericCol: true },
      { key: 'NamaSiswa', label: 'Nama Siswa Pengumpul' },
      { key: 'LinkPengumpulan', label: 'Link Pengumpulan Siswa', type: 'url' },
      { key: 'TanggalKumpul', label: 'Tanggal Kumpul', type: 'date', isNumericCol: true },
      { key: 'StatusPengumpulan', label: 'Status Pengumpulan', type: 'select', options: ['Belum Dikumpulkan', 'Sudah Dikumpulkan', 'Dinilai'] },
      { key: 'NilaiTugas', label: 'Nilai Tugas', type: 'number', isNumericCol: true },
      { key: 'CatatanGuru', label: 'Catatan Guru', type: 'textarea' },
    ],
  },
  arsip_soal: {
    sheet: 'arsip_soal',
    tabName: 'Arsip_Soal',
    title: 'Arsip Soal',
    subtitle: 'Tab Google Sheets: Arsip_Soal (IDSoal, Mapel, Kelas, Topik, LinkDriveSoal, TanggalUpload)',
    idField: 'IDSoal',
    fields: [
      { key: 'IDSoal', label: 'ID Soal', readOnlyOnEdit: true },
      { key: 'Mapel', label: 'Mapel', required: true },
      { key: 'Kelas', label: 'Kelas', required: true },
      { key: 'Topik', label: 'Topik Materi', required: true },
      { key: 'LinkDriveSoal', label: 'Link Google Drive Soal', type: 'url', required: true },
      { key: 'TanggalUpload', label: 'Tanggal Upload', type: 'date', required: true, isNumericCol: true },
    ],
  },
  jurnal_harian: {
    sheet: 'jurnal_harian',
    tabName: 'Jurnal_Harian',
    title: 'Jurnal Harian Guru',
    subtitle: 'Tab Google Sheets: Jurnal_Harian (IDJurnal, Tanggal, Kelas, Mapel, Materi, CatatanKejadian, Tindakan)',
    idField: 'IDJurnal',
    fields: [
      { key: 'IDJurnal', label: 'ID Jurnal', readOnlyOnEdit: true },
      { key: 'Tanggal', label: 'Tanggal', type: 'date', required: true, isNumericCol: true },
      { key: 'Kelas', label: 'Kelas', required: true },
      { key: 'Mapel', label: 'Mapel', required: true },
      { key: 'Materi', label: 'Materi Pembelajaran', required: true },
      { key: 'CatatanKejadian', label: 'Catatan Kejadian', type: 'textarea' },
      { key: 'Tindakan', label: 'Tindakan Tindak Lanjut', type: 'textarea' },
    ],
  },
  catatan_siswa: {
    sheet: 'catatan_siswa',
    tabName: 'Catatan_Siswa',
    title: 'Catatan Siswa',
    subtitle: 'Tab Google Sheets: Catatan_Siswa (IDCatatan, Tanggal, NISN, NamaSiswa, Kelas, JenisCatatan, Detail)',
    idField: 'IDCatatan',
    fields: [
      { key: 'IDCatatan', label: 'ID Catatan', readOnlyOnEdit: true },
      { key: 'Tanggal', label: 'Tanggal', type: 'date', required: true, isNumericCol: true },
      { key: 'NISN', label: 'NISN', isStudentNisnPicker: true, required: true, isNumericCol: true },
      { key: 'NamaSiswa', label: 'Nama Siswa', required: true },
      { key: 'Kelas', label: 'Kelas', required: true },
      { key: 'JenisCatatan', label: 'Jenis Catatan', type: 'select', options: ['Prestasi Sikap', 'Pembinaan Kedisiplinan', 'Bimbingan Ibadah', 'Konsultasi Orangtua'], required: true },
      { key: 'Detail', label: 'Detail Catatan', type: 'textarea', required: true },
    ],
  },
  sertifikat: {
    sheet: 'sertifikat',
    tabName: 'Sertifikat',
    title: 'Sertifikat & Penghargaan',
    subtitle: 'Tab Google Sheets: Sertifikat (IDSertifikat, NISN, NamaSiswa, Kelas, NamaPenghargaan, Tanggal, LinkFile)',
    idField: 'IDSertifikat',
    fields: [
      { key: 'IDSertifikat', label: 'ID Sertifikat', readOnlyOnEdit: true },
      { key: 'NISN', label: 'NISN', isStudentNisnPicker: true, required: true, isNumericCol: true },
      { key: 'NamaSiswa', label: 'Nama Siswa', required: true },
      { key: 'Kelas', label: 'Kelas', required: true },
      { key: 'NamaPenghargaan', label: 'Nama Penghargaan', required: true },
      { key: 'Tanggal', label: 'Tanggal', type: 'date', required: true, isNumericCol: true },
      { key: 'LinkFile', label: 'Link File Sertifikat', type: 'url' },
    ],
  },
  users_guru: {
    sheet: 'users_guru',
    tabName: 'Users Guru',
    title: 'Manajemen Users Guru',
    subtitle: 'Tab Google Sheets: Users Guru (UserID, Username, Password, NamaGuru, Mapel, Role)',
    idField: 'UserID',
    fields: [
      { key: 'UserID', label: 'User ID', readOnlyOnEdit: true },
      { key: 'Username', label: 'Username', required: true },
      { key: 'Password', label: 'Password', required: true },
      { key: 'NamaGuru', label: 'Nama Guru', required: true },
      { key: 'Mapel', label: 'Mapel', required: true },
      { key: 'Role', label: 'Role', type: 'select', options: ['Admin Guru', 'Guru PAIBP'], required: true },
    ],
  },
  user_orangtua: {
    sheet: 'user_orangtua',
    tabName: 'User Orangtua',
    title: 'Manajemen User Orangtua',
    subtitle: 'Tab Google Sheets: User Orangtua (UserID, Username menggunakan NISN, Password)',
    idField: 'UserID',
    fields: [
      { key: 'UserID', label: 'User ID', readOnlyOnEdit: true },
      { key: 'Username', label: 'Username (NISN Siswa)', isStudentNisnPicker: true, required: true, isNumericCol: true },
      { key: 'Password', label: 'Password', required: true },
    ],
  },
};

interface CrudModuleViewProps {
  sheet: SheetKey;
  db: SinergiDatabase;
  authToken?: string;
  onRefresh: () => Promise<void>;
}

function getTaskReminderInfo(
  row: Record<string, unknown>,
  thresholdDays: number
): { isUrgent: boolean; label: string; diffDays: number | null } {
  const status = String(row.StatusPengumpulan ?? '');
  if (status === 'Sudah Dikumpulkan' || status === 'Dinilai') {
    return { isUrgent: false, label: '', diffDays: null };
  }
  const rawDate = String(row.Tenggat ?? '').trim();
  if (!rawDate) return { isUrgent: false, label: '', diffDays: null };

  const match = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return { isUrgent: false, label: '', diffDays: null };

  const due = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      isUrgent: true,
      label: `Pengingat · Lewat ${Math.abs(diffDays)} hari`,
      diffDays,
    };
  }
  if (diffDays === 0) {
    return {
      isUrgent: true,
      label: 'Pengingat · Tenggat Hari Ini',
      diffDays,
    };
  }
  if (diffDays <= thresholdDays) {
    return {
      isUrgent: true,
      label: `Pengingat · ${diffDays} hari lagi`,
      diffDays,
    };
  }
  return { isUrgent: false, label: '', diffDays };
}

export const CrudModuleView: React.FC<CrudModuleViewProps> = ({ sheet, db, authToken, onRefresh }) => {
  const config = MODULE_CONFIGS[sheet];
  const rows = db[sheet] as unknown as Array<Record<string, unknown>>;
  const isWhatsAppModule = sheet === 'nilai' || sheet === 'evaluasi_hafalan';
  const isTugasModule = sheet === 'tugas';

  const [search, setSearch] = useState('');
  const [reminderDays, setReminderDays] = useState<number>(3);
  const [onlyReminders, setOnlyReminders] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [autoSendWa, setAutoSendWa] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [waContext, setWaContext] = useState<WhatsAppTargetContext | null>(null);
  const [showWaHistory, setShowWaHistory] = useState(false);
  const [autoWaNotice, setAutoWaNotice] = useState<{
    message: string;
    waUrl?: string;
  } | null>(null);

  const visibleFields = useMemo(() => {
    // For Tugas, show the key summary columns in the table to keep horizontal scrolling clean, while modal edits all 15 fields
    if (sheet === 'tugas') {
      return config.fields.filter((f) =>
        ['IDTugas', 'JudulTugas', 'Kelas', 'Tenggat', 'NamaSiswa', 'StatusPengumpulan', 'NilaiTugas', 'LinkPengumpulan'].includes(f.key)
      );
    }
    return config.fields;
  }, [sheet, config.fields]);

  const urgentTugasCount = useMemo(() => {
    if (!isTugasModule) return 0;
    return rows.filter((r) => getTaskReminderInfo(r, reminderDays).isUrgent).length;
  }, [isTugasModule, rows, reminderDays]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (isTugasModule && onlyReminders && !getTaskReminderInfo(row, reminderDays).isUrgent) {
        return false;
      }
      if (!q) return true;
      return Object.values(row).some((val) => String(val ?? '').toLowerCase().includes(q));
    });
  }, [rows, search, isTugasModule, onlyReminders, reminderDays]);

  const openAddModal = () => {
    setEditingId(null);
    setErrorMsg(null);
    const defaults: Record<string, string> = {};
    config.fields.forEach((f) => {
      if (f.key === 'Mapel') defaults[f.key] = 'PAIBP';
      else if (f.key === 'Semester') defaults[f.key] = 'Ganjil 2026/2027';
      else if (f.type === 'date') defaults[f.key] = new Date().toISOString().slice(0, 10);
      else if (f.key === 'HariTanggal') defaults[f.key] = `Hari ini, ${new Date().toISOString().slice(0, 10)}`;
      else if (f.type === 'select' && f.options?.length) defaults[f.key] = f.options[0];
      else defaults[f.key] = '';
    });
    setFormValues(defaults);
    setAutoSendWa(false);
    setModalOpen(true);
  };

  const openEditModal = (row: Record<string, unknown>) => {
    const idVal = String(row[config.idField] ?? '');
    setEditingId(idVal);
    setErrorMsg(null);
    const initial: Record<string, string> = {};
    config.fields.forEach((f) => {
      initial[f.key] = String(row[f.key] ?? '');
    });
    setFormValues(initial);
    setAutoSendWa(false);
    setModalOpen(true);
  };

  const handleFieldChange = (field: FieldConfig, value: string) => {
    const next = { ...formValues, [field.key]: value };
    if (field.isStudentNisnPicker) {
      const student = db.data_siswa.find((s: DataSiswaRecord) => s.NISN === value);
      if (student) {
        if ('NamaSiswa' in next) next.NamaSiswa = student.NamaSiswa;
        if ('Kelas' in next && sheet !== 'tugas') next.Kelas = student.Kelas;
      }
    }
    setFormValues(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setAutoWaNotice(null);

    const payload: Record<string, unknown> = { ...formValues };
    if ('Nilai' in payload) {
      payload.Nilai = Number(payload.Nilai || 0);
    }

    try {
      const endpoint = editingId
        ? `/api/records/${sheet}/${encodeURIComponent(editingId)}`
        : `/api/records/${sheet}`;
      const res = await fetch(endpoint, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Gagal menyimpan data.');
        setSaving(false);
        return;
      }

      if (isWhatsAppModule && autoSendWa && formValues.NISN) {
        const savedRecordId = String(data.record?.[config.idField] || editingId || '');
        const waModul = sheet === 'nilai' ? 'Nilai' : 'Evaluasi Setor Hafalan';
        const waRes = await fetch('/api/notifications/whatsapp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify({
            nisn: formValues.NISN,
            modul: waModul,
            recordId: savedRecordId,
          }),
        });
        const waData = await waRes.json();
        setAutoWaNotice({
          message: waData.success
            ? `Notifikasi WhatsApp untuk ${waData.namaSiswa} (${waData.targetPhone}): ${waData.statusKirim}`
            : waData.message || 'Notifikasi WhatsApp gagal dikirim.',
          waUrl: waData.waUrl,
        });
      }

      await onRefresh();
      setModalOpen(false);
    } catch {
      setErrorMsg('Terjadi gangguan koneksi saat menyimpan ke server.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: Record<string, unknown>) => {
    const idVal = String(row[config.idField] ?? '');
    try {
      const res = await fetch(`/api/records/${sheet}/${encodeURIComponent(idVal)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await onRefresh();
      }
    } catch {
      // handled silently
    }
  };

  const handleExportCsv = () => {
    const fields = config.fields;
    const sanitizeCell = (raw: unknown): string => {
      let str = String(raw ?? '').replace(/\r?\n/g, ' ');
      if (/^[=+@]/.test(str)) {
        str = `'${str}`;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    const headerRow = fields.map((f) => sanitizeCell(f.key)).join(',');
    const dataRows = filteredRows.map((row) =>
      fields.map((f) => sanitizeCell(row[f.key])).join(',')
    );

    const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeTab = config.tabName.replace(/\s+/g, '_');
    const dateStamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `SINERGI-PAIBP_${safeTab}_${dateStamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
            {config.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {config.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari baris data..."
              className="pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 w-56 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {isWhatsAppModule && (
            <>
              <button
                type="button"
                onClick={() =>
                  setWaContext({
                    mode: 'bulk',
                    modul: sheet === 'nilai' ? 'Nilai' : 'Evaluasi Setor Hafalan',
                  })
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Kirim WA Massal</span>
              </button>
              <button
                type="button"
                onClick={() => setShowWaHistory((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                <History className="w-3.5 h-3.5" />
                <span>{showWaHistory ? 'Tutup Riwayat WA' : 'Riwayat WA'}</span>
              </button>
            </>
          )}

          {isTugasModule && (
            <>
              <select
                aria-label="Batas hari pengingat tenggat"
                value={reminderDays}
                onChange={(e) => setReminderDays(Number(e.target.value))}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
              >
                <option value={1}>Pengingat: ≤ 1 Hari</option>
                <option value={3}>Pengingat: ≤ 3 Hari</option>
                <option value={7}>Pengingat: ≤ 7 Hari</option>
                <option value={14}>Pengingat: ≤ 14 Hari</option>
              </select>
              <button
                type="button"
                onClick={() => setOnlyReminders((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  onlyReminders
                    ? 'bg-red-600 border-red-600 text-white'
                    : 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/60'
                }`}
              >
                <BellRing className="w-3.5 h-3.5" />
                <span className="tabular-nums">Pengingat ({urgentTugasCount})</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredRows.length === 0}
            title="Unduh data tabel saat ini sebagai file CSV"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor ke CSV</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Data</span>
          </button>
        </div>
      </div>

      {isTugasModule && urgentTugasCount > 0 && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs text-red-800 dark:text-red-200">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            <span>
              Pengingat Tenggat: Terdapat <strong className="font-mono tabular-nums">{urgentTugasCount}</strong> tugas yang mendekati (≤ {reminderDays} hari) atau melewati batas waktu pengumpulan.
            </span>
          </div>
          {onlyReminders && (
            <button
              type="button"
              onClick={() => setOnlyReminders(false)}
              className="font-semibold underline text-red-700 dark:text-red-300"
            >
              Tampilkan Semua Tugas
            </button>
          )}
        </div>
      )}

      {autoWaNotice && (
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{autoWaNotice.message}</span>
          </div>
          {autoWaNotice.waUrl && (
            <a
              href={autoWaNotice.waUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold whitespace-nowrap"
            >
              <span>Buka di WhatsApp Web</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {isWhatsAppModule && showWaHistory && (
        <WhatsAppHistoryPanel logs={db.whatsapp_logs || []} />
      )}

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 font-semibold">
                {visibleFields.map((f) => (
                  <th
                    key={f.key}
                    className={`py-3 px-4 whitespace-nowrap ${
                      f.isNumericCol ? 'text-right' : 'text-left'
                    }`}
                  >
                    {f.label}
                  </th>
                ))}
                {isTugasModule && (
                  <th className="py-3 px-4 text-left whitespace-nowrap">Pengingat</th>
                )}
                <th className="py-3 px-4 text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleFields.length + (isTugasModule ? 2 : 1)}
                    className="py-12 px-4 text-center text-slate-500 dark:text-slate-400"
                  >
                    <p className="font-medium mb-2">Belum ada data pada tab {config.tabName}.</p>
                    <button
                      type="button"
                      onClick={openAddModal}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Catat Entri Pertama</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => {
                  const rowKey = String(row[config.idField] ?? idx);
                  const reminder = isTugasModule
                    ? getTaskReminderInfo(row, reminderDays)
                    : { isUrgent: false, label: '', diffDays: null };

                  return (
                    <tr
                      key={rowKey}
                      className={
                        reminder.isUrgent
                          ? 'bg-red-50/90 dark:bg-red-950/35 hover:bg-red-100/80 dark:hover:bg-red-950/55 transition-colors'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors'
                      }
                    >
                      {visibleFields.map((f) => {
                        const rawVal = String(row[f.key] ?? '');
                        const isUrl = f.type === 'url' && rawVal.startsWith('http');
                        const isStatus = f.key === 'Status' || f.key === 'StatusPengumpulan';

                        return (
                          <td
                            key={f.key}
                            className={`py-2.5 px-4 align-middle ${
                              f.isNumericCol ? 'text-right font-mono tabular-nums' : 'text-left'
                            } ${
                              reminder.isUrgent && f.key === 'Tenggat'
                                ? 'text-red-700 dark:text-red-400 font-semibold'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {isUrl ? (
                              <a
                                href={rawVal}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 hover:underline font-medium whitespace-nowrap"
                              >
                                <span>Buka Tautan</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : isStatus ? (
                              <span
                                className={`font-medium ${
                                  rawVal === 'Hadir' || rawVal === 'Dinilai' || rawVal === 'Sudah Dikumpulkan'
                                    ? 'text-emerald-700 dark:text-emerald-400'
                                    : rawVal === 'Alpha' || rawVal === 'Belum Dikumpulkan'
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-amber-600 dark:text-amber-400'
                                }`}
                              >
                                {rawVal || '-'}
                              </span>
                            ) : (
                              <span className="line-clamp-2">{rawVal || '-'}</span>
                            )}
                          </td>
                        );
                      })}
                      {isTugasModule && (
                        <td className="py-2.5 px-4 align-middle whitespace-nowrap">
                          {reminder.isUrgent ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-600 text-white text-xs font-semibold tabular-nums">
                              <BellRing className="w-3.5 h-3.5 shrink-0" />
                              <span>{reminder.label}</span>
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                              {String(row.StatusPengumpulan ?? '') === 'Sudah Dikumpulkan' ||
                              String(row.StatusPengumpulan ?? '') === 'Dinilai'
                                ? 'Selesai'
                                : 'Aman'}
                            </span>
                          )}
                        </td>
                      )}
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {isWhatsAppModule && (
                            <button
                              type="button"
                              onClick={() =>
                                setWaContext({
                                  mode: 'single',
                                  modul: sheet === 'nilai' ? 'Nilai' : 'Evaluasi Setor Hafalan',
                                  nisn: String(row.NISN || ''),
                                  recordId: String(row[config.idField] || ''),
                                })
                              }
                              title="Kirim ringkasan perkembangan ke WhatsApp Orangtua"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-xs font-medium transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Kirim WA</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openEditModal(row)}
                            title="Edit data"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(row)}
                            title="Hapus data"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-display font-bold text-base">
                {editingId ? `Edit ${config.title}` : `Tambah ${config.title}`}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 max-h-[78vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {config.fields.map((field) => {
                  const val = formValues[field.key] ?? '';
                  const disabled = Boolean(editingId && field.readOnlyOnEdit);

                  return (
                    <div
                      key={field.key}
                      className={field.type === 'textarea' ? 'sm:col-span-2' : ''}
                    >
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {field.label}
                      </label>

                      {field.isStudentNisnPicker ? (
                        <div className="space-y-1">
                          <select
                            value={db.data_siswa.some((s) => s.NISN === val) ? val : ''}
                            onChange={(e) => {
                              if (e.target.value) handleFieldChange(field, e.target.value);
                            }}
                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 mb-1"
                          >
                            <option value="">-- Pilih Cepat dari Data_Siswa --</option>
                            {db.data_siswa.map((s) => (
                              <option key={s.NISN} value={s.NISN}>
                                {s.NISN} — {s.NamaSiswa} ({s.Kelas})
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            required={field.required}
                            value={val}
                            onChange={(e) => handleFieldChange(field, e.target.value)}
                            placeholder="Atau ketik NISN manual"
                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                          />
                        </div>
                      ) : field.type === 'select' ? (
                        <select
                          required={field.required}
                          value={val}
                          onChange={(e) => handleFieldChange(field, e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                        >
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          rows={2}
                          required={field.required}
                          value={val}
                          onChange={(e) => handleFieldChange(field, e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                        />
                      ) : (
                        <input
                          type={field.type || 'text'}
                          required={field.required}
                          disabled={disabled}
                          value={val}
                          placeholder={disabled ? 'Otomatis dibuat' : ''}
                          onChange={(e) => handleFieldChange(field, e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 disabled:opacity-60"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {isWhatsAppModule && (
                <label className="mt-4 flex items-center gap-2.5 p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 cursor-pointer text-xs text-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={autoSendWa}
                    onChange={(e) => setAutoSendWa(e.target.checked)}
                    className="w-4 h-4 accent-emerald-700 rounded"
                  />
                  <span>
                    Kirim ringkasan perkembangan via WhatsApp secara otomatis ke nomor <span className="font-mono">KontakOrtu</span> di <span className="font-mono">Data_Siswa</span> setelah data disimpan.
                  </span>
                </label>
              )}

              {errorMsg && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
                  {errorMsg}
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white"
                >
                  {saving ? 'Menyimpan...' : 'Simpan ke SINERGI-PAIBP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <WhatsAppNotifyModal
        open={Boolean(waContext)}
        context={waContext}
        db={db}
        authToken={authToken}
        onClose={() => setWaContext(null)}
        onSent={onRefresh}
      />
    </div>
  );
};
