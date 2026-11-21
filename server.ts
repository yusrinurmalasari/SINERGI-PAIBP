import express, { type NextFunction, type Request, type Response } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import type { SheetKey, SinergiDatabase, WhatsAppLogRecord } from './src/types/sinergi.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'sinergi-paibp.json');
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

const REQUIRED_SHEET_TABS = [
  'Users Guru',
  'User Orangtua',
  'Data_Siswa',
  'Jadwal_Pelajaran',
  'Absensi',
  'Nilai',
  'Arsip_Soal',
  'Jurnal_Harian',
  'Catatan_Siswa',
  'Sertifikat',
  'Evaluasi setor hafalan',
  'Tugas',
  'Log_WhatsApp',
];

function createInitialDatabase(): SinergiDatabase {
  return {
    spreadsheetName: 'SINERGI-PAIBP',
    initializedTabs: REQUIRED_SHEET_TABS,
    lastSetupAt: new Date().toISOString(),
    teacherProfile: {
      nama: 'Yusri Nurmalasari, S.Pd.I., M.Pd.',
      nip: '19890412 201903 2 011',
      sekolah: 'SDN Harapan Mulia 01',
      email: 'yusrinurmalasari49@guru.sd.belajar.id',
      alamat: 'Jl. Pendidikan Islam No. 45, Kec. Sukamaju, Kota Bandung',
      tiktok: 'https://tiktok.com/@yusri.paibp',
      youtube: 'https://youtube.com/@sinergipaibp',
      whatsapp: '6281234567890',
      fotoUrl: '/src/assets/images/teacher_avatar_1795255653444.jpg',
    },
    users_guru: [
      {
        UserID: 'G-001',
        Username: 'yusri',
        Password: '123',
        NamaGuru: 'Yusri Nurmalasari, S.Pd.I.',
        Mapel: 'PAIBP',
        Role: 'Admin Guru',
      },
      {
        UserID: 'G-002',
        Username: 'ahmad_paibp',
        Password: '123',
        NamaGuru: 'Ahmad Fauzan, S.Ag.',
        Mapel: 'PAIBP',
        Role: 'Guru PAIBP',
      },
    ],
    user_orangtua: [
      { UserID: 'O-001', Username: '0123456789', Password: '123' },
      { UserID: 'O-002', Username: '0123456790', Password: '123' },
      { UserID: 'O-003', Username: '0123456791', Password: '123' },
      { UserID: 'O-004', Username: '0123456792', Password: '123' },
      { UserID: 'O-005', Username: '0123456793', Password: '123' },
    ],
    data_siswa: [
      {
        NISN: '0123456789',
        NamaSiswa: 'Aisyah Putri Ramadhani',
        Kelas: 'V-A',
        JenisKelamin: 'P',
        KontakOrtu: '081298765432',
        FotoSiswa: '/src/assets/images/student_avatar_1795255655017.jpg',
      },
      {
        NISN: '0123456790',
        NamaSiswa: 'Muhammad Fatih Al-Ghazali',
        Kelas: 'V-A',
        JenisKelamin: 'L',
        KontakOrtu: '081344556677',
        FotoSiswa: '',
      },
      {
        NISN: '0123456791',
        NamaSiswa: 'Nabila Zahra Khairunnisa',
        Kelas: 'V-B',
        JenisKelamin: 'P',
        KontakOrtu: '085611223344',
        FotoSiswa: '',
      },
      {
        NISN: '0123456792',
        NamaSiswa: 'Rizky Pratama Hidayat',
        Kelas: 'VI-A',
        JenisKelamin: 'L',
        KontakOrtu: '087722334455',
        FotoSiswa: '',
      },
      {
        NISN: '0123456793',
        NamaSiswa: 'Siti Salma Azzahra',
        Kelas: 'VI-A',
        JenisKelamin: 'P',
        KontakOrtu: '081933445566',
        FotoSiswa: '',
      },
    ],
    jadwal_pelajaran: [
      { IDJadwal: 'JDW-01', Hari: 'Senin', Jam: '07:30 - 09:15', Kelas: 'V-A' },
      { IDJadwal: 'JDW-02', Hari: 'Selasa', Jam: '09:30 - 11:15', Kelas: 'V-B' },
      { IDJadwal: 'JDW-03', Hari: 'Rabu', Jam: '07:30 - 09:15', Kelas: 'VI-A' },
      { IDJadwal: 'JDW-04', Hari: 'Kamis', Jam: '10:00 - 11:30', Kelas: 'VI-B' },
    ],
    absensi: [
      { IDAbsensi: 'ABS-001', Tanggal: '2026-11-02', NISN: '0123456789', NamaSiswa: 'Aisyah Putri Ramadhani', Kelas: 'V-A', Status: 'Hadir', Keterangan: 'Tepat waktu' },
      { IDAbsensi: 'ABS-002', Tanggal: '2026-11-02', NISN: '0123456790', NamaSiswa: 'Muhammad Fatih Al-Ghazali', Kelas: 'V-A', Status: 'Hadir', Keterangan: 'Tepat waktu' },
      { IDAbsensi: 'ABS-003', Tanggal: '2026-11-03', NISN: '0123456791', NamaSiswa: 'Nabila Zahra Khairunnisa', Kelas: 'V-B', Status: 'Izin', Keterangan: 'Acara keluarga' },
      { IDAbsensi: 'ABS-004', Tanggal: '2026-11-04', NISN: '0123456792', NamaSiswa: 'Rizky Pratama Hidayat', Kelas: 'VI-A', Status: 'Hadir', Keterangan: 'Aktif berdiskusi' },
      { IDAbsensi: 'ABS-005', Tanggal: '2026-11-04', NISN: '0123456793', NamaSiswa: 'Siti Salma Azzahra', Kelas: 'VI-A', Status: 'Sakit', Keterangan: 'Surat keterangan orangtua' },
      { IDAbsensi: 'ABS-006', Tanggal: '2026-11-09', NISN: '0123456789', NamaSiswa: 'Aisyah Putri Ramadhani', Kelas: 'V-A', Status: 'Hadir', Keterangan: 'Tepat waktu' },
      { IDAbsensi: 'ABS-007', Tanggal: '2026-11-09', NISN: '0123456790', NamaSiswa: 'Muhammad Fatih Al-Ghazali', Kelas: 'V-A', Status: 'Hadir', Keterangan: 'Tepat waktu' },
      { IDAbsensi: 'ABS-008', Tanggal: '2026-11-10', NISN: '0123456791', NamaSiswa: 'Nabila Zahra Khairunnisa', Kelas: 'V-B', Status: 'Hadir', Keterangan: 'Tepat waktu' },
      { IDAbsensi: 'ABS-009', Tanggal: '2026-11-11', NISN: '0123456792', NamaSiswa: 'Rizky Pratama Hidayat', Kelas: 'VI-A', Status: 'Alpha', Keterangan: 'Tanpa keterangan' },
      { IDAbsensi: 'ABS-010', Tanggal: '2026-11-11', NISN: '0123456793', NamaSiswa: 'Siti Salma Azzahra', Kelas: 'VI-A', Status: 'Hadir', Keterangan: 'Tepat waktu' },
      { IDAbsensi: 'ABS-011', Tanggal: '2026-10-12', NISN: '0123456789', NamaSiswa: 'Aisyah Putri Ramadhani', Kelas: 'V-A', Status: 'Hadir', Keterangan: 'Hadir penuh' },
      { IDAbsensi: 'ABS-012', Tanggal: '2026-10-12', NISN: '0123456790', NamaSiswa: 'Muhammad Fatih Al-Ghazali', Kelas: 'V-A', Status: 'Sakit', Keterangan: 'Demam ringan' },
      { IDAbsensi: 'ABS-013', Tanggal: '2025-11-10', NISN: '0123456789', NamaSiswa: 'Aisyah Putri Ramadhani', Kelas: 'V-A', Status: 'Hadir', Keterangan: 'Semester lalu' },
    ],
    nilai: [
      { IDNilai: 'NIL-001', NISN: '0123456789', NamaSiswa: 'Aisyah Putri Ramadhani', Kelas: 'V-A', Mapel: 'PAIBP', JenisEvaluasi: 'Ulangan Harian 1 (Asmaul Husna)', Nilai: 94, Semester: 'Ganjil 2026/2027' },
      { IDNilai: 'NIL-002', NISN: '0123456789', NamaSiswa: 'Aisyah Putri Ramadhani', Kelas: 'V-A', Mapel: 'PAIBP', JenisEvaluasi: 'PTS Ganjil', Nilai: 92, Semester: 'Ganjil 2026/2027' },
      { IDNilai: 'NIL-003', NISN: '0123456790', NamaSiswa: 'Muhammad Fatih Al-Ghazali', Kelas: 'V-A', Mapel: 'PAIBP', JenisEvaluasi: 'Ulangan Harian 1 (Asmaul Husna)', Nilai: 88, Semester: 'Ganjil 2026/2027' },
      { IDNilai: 'NIL-004', NISN: '0123456791', NamaSiswa: 'Nabila Zahra Khairunnisa', Kelas: 'V-B', Mapel: 'PAIBP', JenisEvaluasi: 'PTS Ganjil', Nilai: 90, Semester: 'Ganjil 2026/2027' },
      { IDNilai: 'NIL-005', NISN: '0123456792', NamaSiswa: 'Rizky Pratama Hidayat', Kelas: 'VI-A', Mapel: 'PAIBP', JenisEvaluasi: 'Praktik Ibadah Sholat', Nilai: 85, Semester: 'Ganjil 2026/2027' },
      { IDNilai: 'NIL-006', NISN: '0123456793', NamaSiswa: 'Siti Salma Azzahra', Kelas: 'VI-A', Mapel: 'PAIBP', JenisEvaluasi: 'PTS Ganjil', Nilai: 96, Semester: 'Ganjil 2026/2027' },
    ],
    arsip_soal: [
      { IDSoal: 'SOL-001', Mapel: 'PAIBP', Kelas: 'V-A', Topik: 'Menyayangi Anak Yatim & QS. Al-Maun', LinkDriveSoal: 'https://drive.google.com/file/d/contoh-soal-al-maun', TanggalUpload: '2026-10-15' },
      { IDSoal: 'SOL-002', Mapel: 'PAIBP', Kelas: 'VI-A', Topik: 'Ketentuan Zakat Fitrah dan Zakat Mal', LinkDriveSoal: 'https://drive.google.com/file/d/contoh-soal-zakat', TanggalUpload: '2026-11-01' },
    ],
    jurnal_harian: [
      { IDJurnal: 'JRN-001', Tanggal: '2026-11-11', Kelas: 'V-A', Mapel: 'PAIBP', Materi: 'Makna Asmaul Husna Al-Qawiyyu & Al-Qayyum', CatatanKejadian: 'Sebagian besar siswa antusias menghafal arti Asmaul Husna', Tindakan: 'Memberikan penguatan hafalan berpasangan' },
      { IDJurnal: 'JRN-002', Tanggal: '2026-11-12', Kelas: 'VI-A', Mapel: 'PAIBP', Materi: 'Hikmah Berinfak dan Bersedekah', CatatanKejadian: 'Diskusi kelompok berjalan kondusif', Tindakan: 'Menugaskan proyek infak pekanan kelas' },
    ],
    catatan_siswa: [
      { IDCatatan: 'CAT-001', Tanggal: '2026-11-08', NISN: '0123456789', NamaSiswa: 'Aisyah Putri Ramadhani', Kelas: 'V-A', JenisCatatan: 'Prestasi Sikap', Detail: 'Membantu teman yang kesulitan membaca huruf hijaiyah saat jam istirahat.' },
      { IDCatatan: 'CAT-002', Tanggal: '2026-11-11', NISN: '0123456792', NamaSiswa: 'Rizky Pratama Hidayat', Kelas: 'VI-A', JenisCatatan: 'Pembinaan Kedisiplinan', Detail: 'Perlu pendampingan kehadiran tepat waktu di jam pertama.' },
    ],
    sertifikat: [
      { IDSertifikat: 'SRT-001', NISN: '0123456789', NamaSiswa: 'Aisyah Putri Ramadhani', Kelas: 'V-A', NamaPenghargaan: 'Juara 1 MHQ Tingkat Kecamatan', Tanggal: '2026-10-28', LinkFile: 'https://drive.google.com/file/d/contoh-sertifikat-mhq' },
      { IDSertifikat: 'SRT-002', NISN: '0123456793', NamaSiswa: 'Siti Salma Azzahra', Kelas: 'VI-A', NamaPenghargaan: 'Siswa Teladan Adab & Sholat Dhuha', Tanggal: '2026-11-05', LinkFile: 'https://drive.google.com/file/d/contoh-sertifikat-adab' },
    ],
    evaluasi_hafalan: [
      { IDHafalan: 'HAF-001', NISN: '0123456789', HariTanggal: 'Senin, 2026-11-09', NamaSiswa: 'Aisyah Putri Ramadhani', Kelas: 'V-A', NamaSurah: 'QS. Al-Maun (Ayat 1-7)', Nilai: 95, CatatanEvaluasi: 'Makhraj dan panjang pendek (mad) sangat baik dan lancar.' },
      { IDHafalan: 'HAF-002', NISN: '0123456789', HariTanggal: 'Senin, 2026-11-16', NamaSiswa: 'Aisyah Putri Ramadhani', Kelas: 'V-A', NamaSurah: 'QS. At-Tin (Ayat 1-8)', Nilai: 93, CatatanEvaluasi: 'Tajwid ikhfa dan ghunnah tepat, terus dipertahankan.' },
      { IDHafalan: 'HAF-003', NISN: '0123456790', HariTanggal: 'Senin, 2026-11-16', NamaSiswa: 'Muhammad Fatih Al-Ghazali', Kelas: 'V-A', NamaSurah: 'QS. Al-Maun (Ayat 1-7)', Nilai: 88, CatatanEvaluasi: 'Lancar, perlu sedikit perbaikan pada qalqalah ayat 3.' },
      { IDHafalan: 'HAF-004', NISN: '0123456791', HariTanggal: 'Selasa, 2026-11-17', NamaSiswa: 'Nabila Zahra Khairunnisa', Kelas: 'V-B', NamaSurah: 'QS. Ad-Dhuha (Ayat 1-11)', Nilai: 91, CatatanEvaluasi: 'Bacaan tartil dan tenang.' },
      { IDHafalan: 'HAF-005', NISN: '0123456793', HariTanggal: 'Rabu, 2026-11-18', NamaSiswa: 'Siti Salma Azzahra', Kelas: 'VI-A', NamaSurah: 'QS. Al-Alaq (Ayat 1-19)', Nilai: 97, CatatanEvaluasi: 'Mutqin, fasih, dan suara jelas.' },
    ],
    tugas: [
      {
        IDTugas: 'TGS-001',
        TanggalBuat: '2026-11-14',
        Kelas: 'V-A',
        Mapel: 'PAIBP',
        JudulTugas: 'Resume Hikmah Kisah Keteladanan Nabi Ibrahim AS',
        Deskripsi: 'Tuliskan 3 hikmah utama keteladanan Nabi Ibrahim AS di buku tugas atau Google Docs lalu unggah tautan dokumen/foto.',
        Tenggat: '2026-11-25',
        LinkMateri: 'https://drive.google.com/file/d/materi-nabi-ibrahim',
        NISN_Pengumpul: '0123456789',
        NamaSiswa: 'Aisyah Putri Ramadhani',
        LinkPengumpulan: 'https://drive.google.com/file/d/tugas-aisyah-ibrahim',
        TanggalKumpul: '2026-11-18',
        StatusPengumpulan: 'Dinilai',
        NilaiTugas: '95',
        CatatanGuru: 'Penjelasan sangat runtut dan tulisan rapi.',
      },
      {
        IDTugas: 'TGS-002',
        TanggalBuat: '2026-11-18',
        Kelas: 'VI-A',
        Mapel: 'PAIBP',
        JudulTugas: 'Poster Digital Adab Bertetangga dalam Islam',
        Deskripsi: 'Buat poster sederhana berisi minimal 4 adab bertetangga sesuai ajaran Rasulullah SAW.',
        Tenggat: '2026-11-28',
        LinkMateri: 'https://drive.google.com/file/d/panduan-poster-adab',
        NISN_Pengumpul: '0123456793',
        NamaSiswa: 'Siti Salma Azzahra',
        LinkPengumpulan: 'https://drive.google.com/file/d/poster-salma',
        TanggalKumpul: '2026-11-20',
        StatusPengumpulan: 'Sudah Dikumpulkan',
        NilaiTugas: '',
        CatatanGuru: 'Menunggu penilaian guru.',
      },
      {
        IDTugas: 'TGS-003',
        TanggalBuat: '2026-11-20',
        Kelas: 'V-B',
        Mapel: 'PAIBP',
        JudulTugas: 'Praktik Wudhu Tertib (Video Singkat)',
        Deskripsi: 'Rekam praktik tata cara wudhu sesuai rukun dan sunnah lalu kumpulkan tautan Google Drive.',
        Tenggat: '2026-11-30',
        LinkMateri: 'https://drive.google.com/file/d/panduan-wudhu',
        NISN_Pengumpul: '',
        NamaSiswa: '',
        LinkPengumpulan: '',
        TanggalKumpul: '',
        StatusPengumpulan: 'Belum Dikumpulkan',
        NilaiTugas: '',
        CatatanGuru: '',
      },
      {
        IDTugas: 'TGS-004',
        TanggalBuat: '2026-11-19',
        Kelas: 'V-A',
        Mapel: 'PAIBP',
        JudulTugas: 'Hafalan Doa Sebelum & Sesudah Wudhu',
        Deskripsi: 'Setorkan rekaman audio hafalan doa sebelum dan sesudah wudhu beserta artinya.',
        Tenggat: '2026-11-23',
        LinkMateri: 'https://drive.google.com/file/d/doa-wudhu',
        NISN_Pengumpul: '0123456790',
        NamaSiswa: 'Muhammad Fatih Al-Ghazali',
        LinkPengumpulan: '',
        TanggalKumpul: '',
        StatusPengumpulan: 'Belum Dikumpulkan',
        NilaiTugas: '',
        CatatanGuru: '',
      },
    ],
    whatsapp_logs: [],
  };
}

function readDatabase(): SinergiDatabase {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initial = createInitialDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  const parsed = JSON.parse(raw) as SinergiDatabase;
  if (!Array.isArray(parsed.whatsapp_logs)) {
    parsed.whatsapp_logs = [];
  }
  return parsed;
}

function writeDatabase(db: SinergiDatabase): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

interface TokenPayload {
  userId: string;
  username: string;
  role: 'guru' | 'orangtua';
  exp: number;
}

function signSessionToken(payload: Omit<TokenPayload, 'exp'>): string {
  const fullPayload: TokenPayload = {
    ...payload,
    exp: Date.now() + 1000 * 60 * 60 * 12,
  };
  const encoded = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifyBearerToken(authHeader?: string): TokenPayload | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8')) as TokenPayload;
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function requireGuruAuth(req: Request, res: Response, next: NextFunction): void {
  const session = verifyBearerToken(req.headers.authorization);
  if (!session || session.role !== 'guru') {
    res.status(401).json({ success: false, message: 'Akses ditolak. Silakan login kembali sebagai Guru PAIBP.' });
    return;
  }
  next();
}

function normalizeIndonesianPhone(raw: string): string | null {
  const digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return null;
  let normalized = digits;
  if (normalized.startsWith('0')) {
    normalized = '62' + normalized.slice(1);
  } else if (normalized.startsWith('8')) {
    normalized = '62' + normalized;
  }
  if (normalized.length < 10 || normalized.length > 15) {
    return null;
  }
  return normalized;
}

function isSafeGatewayUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      host.startsWith('169.254.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function buildStudentProgressMessage(
  db: SinergiDatabase,
  nisn: string,
  modul: 'Nilai' | 'Evaluasi Setor Hafalan' | 'Ringkasan Perkembangan',
  recordId?: string,
  customNote?: string
): { message: string; namaSiswa: string; kelas: string; rawPhone: string } | null {
  const student = db.data_siswa.find((s) => s.NISN === nisn);
  if (!student) return null;

  const studentNilai = db.nilai.filter((n) => n.NISN === nisn);
  const studentHafalan = db.evaluasi_hafalan.filter((h) => h.NISN === nisn);

  const avgNilai = studentNilai.length
    ? (studentNilai.reduce((a, b) => a + Number(b.Nilai || 0), 0) / studentNilai.length).toFixed(1)
    : '-';
  const avgHafalan = studentHafalan.length
    ? (studentHafalan.reduce((a, b) => a + Number(b.Nilai || 0), 0) / studentHafalan.length).toFixed(1)
    : '-';

  const lines: string[] = [
    `*SINERGI PAIBP - ${db.teacherProfile.sekolah}*`,
    `Assalamu'alaikum Wr. Wb.`,
    `Yth. Bapak/Ibu Wali dari *${student.NamaSiswa}* (Kelas ${student.Kelas} · NISN ${student.NISN}),`,
    '',
  ];

  if (modul === 'Nilai') {
    const target = recordId ? studentNilai.find((n) => n.IDNilai === recordId) : studentNilai[0];
    if (target) {
      lines.push(`*Pembaruan Nilai PAIBP:*`);
      lines.push(`• Evaluasi: ${target.JenisEvaluasi}`);
      lines.push(`• Semester: ${target.Semester}`);
      lines.push(`• Nilai Diperoleh: *${target.Nilai}*`);
      lines.push('');
    }
  } else if (modul === 'Evaluasi Setor Hafalan') {
    const target = recordId ? studentHafalan.find((h) => h.IDHafalan === recordId) : studentHafalan[0];
    if (target) {
      lines.push(`*Pembaruan Evaluasi Setor Hafalan:*`);
      lines.push(`• Tanggal: ${target.HariTanggal}`);
      lines.push(`• Surah: ${target.NamaSurah}`);
      lines.push(`• Nilai Hafalan: *${target.Nilai}*`);
      if (target.CatatanEvaluasi) {
        lines.push(`• Catatan Tajwid/Kelancaran: ${target.CatatanEvaluasi}`);
      }
      lines.push('');
    }
  }

  lines.push(`*Ringkasan Perkembangan Ananda:*`);
  lines.push(`• Rata-rata Nilai PAIBP: ${avgNilai} (${studentNilai.length} evaluasi)`);
  lines.push(`• Rata-rata Setor Hafalan: ${avgHafalan} (${studentHafalan.length} setoran)`);

  const cleanNote = String(customNote || '').trim().slice(0, 300);
  if (cleanNote) {
    lines.push('');
    lines.push(`*Pesan Guru:* ${cleanNote}`);
  }

  lines.push('');
  lines.push(`Terima kasih atas pendampingan belajar ananda di rumah.`);
  lines.push(`Wassalamu'alaikum Wr. Wb.`);
  lines.push(`— ${db.teacherProfile.nama}`);

  return {
    message: lines.join('\n'),
    namaSiswa: student.NamaSiswa,
    kelas: student.Kelas,
    rawPhone: student.KontakOrtu,
  };
}

async function dispatchWhatsAppGateway(
  targetPhone: string,
  message: string
): Promise<{ ok: boolean; statusKirim: WhatsAppLogRecord['StatusKirim']; modeKirim: string; detail: string; waUrl: string }> {
  const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
  const apiUrl = String(process.env.WHATSAPP_API_URL || '').trim();
  const apiToken = String(process.env.WHATSAPP_API_TOKEN || '').trim();
  const provider = String(process.env.WHATSAPP_PROVIDER || 'fonnte').trim().toLowerCase();

  if (!apiUrl || !apiToken) {
    return {
      ok: true,
      statusKirim: 'Siap Kirim (WhatsApp Web)',
      modeKirim: 'Fallback wa.me (WHATSAPP_API_URL / TOKEN belum diatur)',
      detail: 'Tautan WhatsApp Web siap dibuka.',
      waUrl,
    };
  }

  if (!isSafeGatewayUrl(apiUrl)) {
    return {
      ok: false,
      statusKirim: 'Gagal',
      modeKirim: `Gateway ${provider}`,
      detail: 'WHATSAPP_API_URL harus menggunakan protokol HTTPS publik yang valid.',
      waUrl,
    };
  }

  try {
    let headers: Record<string, string> = { 'Content-Type': 'application/json' };
    let body: string;

    if (provider === 'fonnte') {
      headers = { Authorization: apiToken, 'Content-Type': 'application/json' };
      body = JSON.stringify({ target: targetPhone, message, countryCode: '62' });
    } else if (provider === 'wablas') {
      headers = { Authorization: apiToken, 'Content-Type': 'application/json' };
      body = JSON.stringify({ phone: targetPhone, message });
    } else if (provider === 'meta_cloud') {
      headers = { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'application/json' };
      body = JSON.stringify({
        messaging_product: 'whatsapp',
        to: targetPhone,
        type: 'text',
        text: { body: message },
      });
    } else {
      headers = { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'application/json' };
      body = JSON.stringify({ phone: targetPhone, message });
    }

    const resp = await fetch(apiUrl, { method: 'POST', headers, body });
    const text = await resp.text();
    if (!resp.ok) {
      return {
        ok: false,
        statusKirim: 'Gagal',
        modeKirim: `API ${provider}`,
        detail: `Gateway merespons HTTP ${resp.status}: ${text.slice(0, 140)}`,
        waUrl,
      };
    }

    return {
      ok: true,
      statusKirim: 'Terkirim via API',
      modeKirim: `API ${provider}`,
      detail: 'Notifikasi WhatsApp berhasil dikirim melalui Gateway API.',
      waUrl,
    };
  } catch (err) {
    return {
      ok: false,
      statusKirim: 'Gagal',
      modeKirim: `API ${provider}`,
      detail: err instanceof Error ? err.message : 'Gagal menghubungi server Gateway WhatsApp.',
      waUrl,
    };
  }
}

const SHEET_ID_FIELD: Record<SheetKey, string> = {
  users_guru: 'UserID',
  user_orangtua: 'UserID',
  data_siswa: 'NISN',
  jadwal_pelajaran: 'IDJadwal',
  absensi: 'IDAbsensi',
  nilai: 'IDNilai',
  arsip_soal: 'IDSoal',
  jurnal_harian: 'IDJurnal',
  catatan_siswa: 'IDCatatan',
  sertifikat: 'IDSertifikat',
  evaluasi_hafalan: 'IDHafalan',
  tugas: 'IDTugas',
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Initialize DB file on boot
  readDatabase();

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', spreadsheet: 'SINERGI-PAIBP' });
  });

  app.post('/api/setup-database', (_req, res) => {
    const db = readDatabase();
    db.spreadsheetName = 'SINERGI-PAIBP';
    db.initializedTabs = REQUIRED_SHEET_TABS;
    db.lastSetupAt = new Date().toISOString();
    writeDatabase(db);
    res.json({
      success: true,
      spreadsheetName: db.spreadsheetName,
      tabs: REQUIRED_SHEET_TABS,
      lastSetupAt: db.lastSetupAt,
    });
  });

  app.get('/api/data', (_req, res) => {
    const db = readDatabase();
    res.json(db);
  });

  app.post('/api/login', (req, res) => {
    const { role, username, password } = req.body as {
      role: 'guru' | 'orangtua';
      username: string;
      password: string;
    };
    const db = readDatabase();
    const cleanUser = (username || '').trim();
    const cleanPass = (password || '').trim();

    if (role === 'guru') {
      const found = db.users_guru.find(
        (u) => u.Username.toLowerCase() === cleanUser.toLowerCase() && u.Password === cleanPass
      );
      if (!found) {
        res.status(401).json({ success: false, message: 'Username atau Password Guru tidak sesuai.' });
        return;
      }
      const token = signSessionToken({
        userId: found.UserID,
        username: found.Username,
        role: 'guru',
      });
      res.json({
        success: true,
        session: {
          role: 'guru',
          userId: found.UserID,
          username: found.Username,
          displayName: found.NamaGuru,
          token,
        },
      });
      return;
    }

    const foundOrtu = db.user_orangtua.find(
      (u) => u.Username === cleanUser && u.Password === cleanPass
    );
    if (!foundOrtu) {
      res.status(401).json({ success: false, message: 'NISN atau Password Orangtua tidak ditemukan.' });
      return;
    }
    const siswa = db.data_siswa.find((s) => s.NISN === foundOrtu.Username);
    const ortuToken = signSessionToken({
      userId: foundOrtu.UserID,
      username: foundOrtu.Username,
      role: 'orangtua',
    });
    res.json({
      success: true,
      session: {
        role: 'orangtua',
        userId: foundOrtu.UserID,
        username: foundOrtu.Username,
        displayName: siswa ? `Wali dari ${siswa.NamaSiswa}` : `Wali NISN ${foundOrtu.Username}`,
        nisn: foundOrtu.Username,
        token: ortuToken,
      },
    });
  });

  app.get('/api/notifications/whatsapp/status', requireGuruAuth, (_req, res) => {
    const db = readDatabase();
    const configured = Boolean(
      String(process.env.WHATSAPP_API_URL || '').trim() &&
        String(process.env.WHATSAPP_API_TOKEN || '').trim()
    );
    res.json({
      success: true,
      configured,
      provider: String(process.env.WHATSAPP_PROVIDER || 'fonnte').toLowerCase(),
      logs: db.whatsapp_logs || [],
    });
  });

  app.post('/api/notifications/whatsapp/preview', requireGuruAuth, (req, res) => {
    const { nisn, modul, recordId, customNote } = req.body as {
      nisn: string;
      modul: 'Nilai' | 'Evaluasi Setor Hafalan' | 'Ringkasan Perkembangan';
      recordId?: string;
      customNote?: string;
    };
    const db = readDatabase();
    const built = buildStudentProgressMessage(db, String(nisn || '').trim(), modul, recordId, customNote);
    if (!built) {
      res.status(404).json({ success: false, message: 'Siswa dengan NISN tersebut tidak ditemukan di Data_Siswa.' });
      return;
    }
    const normalizedPhone = normalizeIndonesianPhone(built.rawPhone);
    res.json({
      success: true,
      namaSiswa: built.namaSiswa,
      kelas: built.kelas,
      kontakOrtu: built.rawPhone,
      normalizedPhone,
      message: built.message,
    });
  });

  app.post('/api/notifications/whatsapp', requireGuruAuth, async (req, res) => {
    const { nisn, modul, recordId, customNote } = req.body as {
      nisn: string;
      modul: 'Nilai' | 'Evaluasi Setor Hafalan' | 'Ringkasan Perkembangan';
      recordId?: string;
      customNote?: string;
    };

    const allowedModuls = new Set(['Nilai', 'Evaluasi Setor Hafalan', 'Ringkasan Perkembangan']);
    if (!nisn || !allowedModuls.has(modul)) {
      res.status(400).json({ success: false, message: 'Parameter NISN atau modul notifikasi tidak valid.' });
      return;
    }

    const db = readDatabase();
    const built = buildStudentProgressMessage(db, String(nisn).trim(), modul, recordId, customNote);
    if (!built) {
      res.status(404).json({ success: false, message: 'Data siswa tidak ditemukan di Data_Siswa.' });
      return;
    }

    const targetPhone = normalizeIndonesianPhone(built.rawPhone);
    if (!targetPhone) {
      res.status(400).json({
        success: false,
        message: `Nomor KontakOrtu untuk ${built.namaSiswa} belum valid atau kosong di Data_Siswa.`,
      });
      return;
    }

    const result = await dispatchWhatsAppGateway(targetPhone, built.message);
    const logEntry: WhatsAppLogRecord = {
      IDLog: `WA-${Date.now().toString().slice(-6)}`,
      TanggalKirim: new Date().toISOString(),
      NISN: String(nisn).trim(),
      NamaSiswa: built.namaSiswa,
      KontakOrtu: targetPhone,
      Modul: modul,
      RingkasanPesan: built.message,
      StatusKirim: result.statusKirim,
      ModeKirim: result.modeKirim,
    };

    db.whatsapp_logs = [logEntry, ...(db.whatsapp_logs || [])].slice(0, 100);
    writeDatabase(db);

    res.status(result.ok ? 200 : 502).json({
      success: result.ok,
      message: result.detail,
      statusKirim: result.statusKirim,
      modeKirim: result.modeKirim,
      targetPhone,
      namaSiswa: built.namaSiswa,
      formattedText: built.message,
      waUrl: result.waUrl,
      log: logEntry,
    });
  });

  app.post('/api/notifications/whatsapp/bulk', requireGuruAuth, async (req, res) => {
    const { kelas, modul, customNote } = req.body as {
      kelas?: string;
      modul: 'Nilai' | 'Evaluasi Setor Hafalan' | 'Ringkasan Perkembangan';
      customNote?: string;
    };

    const allowedModuls = new Set(['Nilai', 'Evaluasi Setor Hafalan', 'Ringkasan Perkembangan']);
    if (!allowedModuls.has(modul)) {
      res.status(400).json({ success: false, message: 'Modul notifikasi tidak valid.' });
      return;
    }

    const db = readDatabase();
    const students = db.data_siswa.filter((s) => !kelas || kelas === 'ALL' || s.Kelas === kelas);

    const results: Array<{
      nisn: string;
      namaSiswa: string;
      kontakOrtu: string;
      statusKirim: string;
      waUrl?: string;
      detail: string;
    }> = [];

    for (const s of students) {
      const built = buildStudentProgressMessage(db, s.NISN, modul, undefined, customNote);
      const targetPhone = built ? normalizeIndonesianPhone(built.rawPhone) : null;
      if (!built || !targetPhone) {
        results.push({
          nisn: s.NISN,
          namaSiswa: s.NamaSiswa,
          kontakOrtu: s.KontakOrtu || '-',
          statusKirim: 'Gagal',
          detail: 'Nomor KontakOrtu belum valid di Data_Siswa.',
        });
        continue;
      }

      const dispatch = await dispatchWhatsAppGateway(targetPhone, built.message);
      const logEntry: WhatsAppLogRecord = {
        IDLog: `WA-${Date.now().toString().slice(-5)}-${s.NISN.slice(-3)}`,
        TanggalKirim: new Date().toISOString(),
        NISN: s.NISN,
        NamaSiswa: s.NamaSiswa,
        KontakOrtu: targetPhone,
        Modul: modul,
        RingkasanPesan: built.message,
        StatusKirim: dispatch.statusKirim,
        ModeKirim: dispatch.modeKirim,
      };
      db.whatsapp_logs = [logEntry, ...(db.whatsapp_logs || [])].slice(0, 100);
      results.push({
        nisn: s.NISN,
        namaSiswa: s.NamaSiswa,
        kontakOrtu: targetPhone,
        statusKirim: dispatch.statusKirim,
        waUrl: dispatch.waUrl,
        detail: dispatch.detail,
      });
    }

    writeDatabase(db);
    res.json({
      success: true,
      totalDiproses: results.length,
      results,
    });
  });

  app.put('/api/profile/teacher', (req, res) => {
    const db = readDatabase();
    db.teacherProfile = {
      ...db.teacherProfile,
      ...req.body,
    };
    writeDatabase(db);
    res.json({ success: true, teacherProfile: db.teacherProfile });
  });

  app.post('/api/profile/student-photo', (req, res) => {
    const { nisn, fotoBase64 } = req.body as { nisn: string; fotoBase64: string };
    const db = readDatabase();
    const idx = db.data_siswa.findIndex((s) => s.NISN === nisn);
    if (idx === -1) {
      res.status(404).json({ success: false, message: 'Data siswa tidak ditemukan.' });
      return;
    }
    db.data_siswa[idx].FotoSiswa = fotoBase64;
    writeDatabase(db);
    res.json({ success: true, student: db.data_siswa[idx] });
  });

  app.post('/api/records/:sheet', (req, res) => {
    const sheet = req.params.sheet as SheetKey;
    if (!SHEET_ID_FIELD[sheet]) {
      res.status(400).json({ success: false, message: 'Nama tab sheet tidak valid.' });
      return;
    }
    const db = readDatabase();
    const idField = SHEET_ID_FIELD[sheet];
    const record = { ...req.body };

    if (!record[idField]) {
      record[idField] = `${sheet.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-5)}`;
    }

    const list = db[sheet] as unknown as Array<Record<string, unknown>>;
    const exists = list.some((item) => item[idField] === record[idField]);
    if (exists && sheet === 'data_siswa') {
      res.status(409).json({ success: false, message: 'NISN sudah terdaftar.' });
      return;
    }

    list.unshift(record);
    writeDatabase(db);
    res.json({ success: true, record, data: list });
  });

  app.put('/api/records/:sheet/:id', (req, res) => {
    const sheet = req.params.sheet as SheetKey;
    const id = decodeURIComponent(req.params.id);
    if (!SHEET_ID_FIELD[sheet]) {
      res.status(400).json({ success: false, message: 'Nama tab sheet tidak valid.' });
      return;
    }
    const db = readDatabase();
    const idField = SHEET_ID_FIELD[sheet];
    const list = db[sheet] as unknown as Array<Record<string, unknown>>;
    const index = list.findIndex((item) => String(item[idField]) === id);
    if (index === -1) {
      res.status(404).json({ success: false, message: 'Data tidak ditemukan.' });
      return;
    }
    list[index] = { ...list[index], ...req.body, [idField]: id };
    writeDatabase(db);
    res.json({ success: true, record: list[index], data: list });
  });

  app.delete('/api/records/:sheet/:id', (req, res) => {
    const sheet = req.params.sheet as SheetKey;
    const id = decodeURIComponent(req.params.id);
    if (!SHEET_ID_FIELD[sheet]) {
      res.status(400).json({ success: false, message: 'Nama tab sheet tidak valid.' });
      return;
    }
    const db = readDatabase();
    const idField = SHEET_ID_FIELD[sheet];
    const list = db[sheet] as unknown as Array<Record<string, unknown>>;
    const filtered = list.filter((item) => String(item[idField]) !== id);
    (db[sheet] as unknown as Array<Record<string, unknown>>) = filtered;
    writeDatabase(db);
    res.json({ success: true, data: filtered });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SINERGI PAIBP server listening on http://localhost:${PORT}`);
  });
}

startServer();
