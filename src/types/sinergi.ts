export type SheetKey =
  | 'users_guru'
  | 'user_orangtua'
  | 'data_siswa'
  | 'jadwal_pelajaran'
  | 'absensi'
  | 'nilai'
  | 'arsip_soal'
  | 'jurnal_harian'
  | 'catatan_siswa'
  | 'sertifikat'
  | 'evaluasi_hafalan'
  | 'tugas';

export interface UsersGuruRecord {
  UserID: string;
  Username: string;
  Password: string;
  NamaGuru: string;
  Mapel: string;
  Role: string;
}

export interface UserOrangtuaRecord {
  UserID: string;
  Username: string; // NISN
  Password: string;
}

export interface DataSiswaRecord {
  NISN: string;
  NamaSiswa: string;
  Kelas: string;
  JenisKelamin: 'L' | 'P' | string;
  KontakOrtu: string;
  FotoSiswa?: string;
}

export interface JadwalPelajaranRecord {
  IDJadwal: string;
  Hari: string;
  Jam: string;
  Kelas: string;
}

export interface AbsensiRecord {
  IDAbsensi: string;
  Tanggal: string; // YYYY-MM-DD
  NISN: string;
  NamaSiswa: string;
  Kelas: string;
  Status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpha' | string;
  Keterangan: string;
}

export interface NilaiRecord {
  IDNilai: string;
  NISN: string;
  NamaSiswa: string;
  Kelas: string;
  Mapel: string;
  JenisEvaluasi: string;
  Nilai: number;
  Semester: string;
}

export interface ArsipSoalRecord {
  IDSoal: string;
  Mapel: string;
  Kelas: string;
  Topik: string;
  LinkDriveSoal: string;
  TanggalUpload: string;
}

export interface JurnalHarianRecord {
  IDJurnal: string;
  Tanggal: string;
  Kelas: string;
  Mapel: string;
  Materi: string;
  CatatanKejadian: string;
  Tindakan: string;
}

export interface CatatanSiswaRecord {
  IDCatatan: string;
  Tanggal: string;
  NISN: string;
  NamaSiswa: string;
  Kelas: string;
  JenisCatatan: string;
  Detail: string;
}

export interface SertifikatRecord {
  IDSertifikat: string;
  NISN: string;
  NamaSiswa: string;
  Kelas: string;
  NamaPenghargaan: string;
  Tanggal: string;
  LinkFile: string;
}

export interface EvaluasiHafalanRecord {
  IDHafalan: string;
  NISN: string;
  HariTanggal: string;
  NamaSiswa: string;
  Kelas: string;
  NamaSurah: string;
  Nilai: number;
  CatatanEvaluasi: string;
}

export interface TugasRecord {
  IDTugas: string;
  TanggalBuat: string;
  Kelas: string;
  Mapel: string;
  JudulTugas: string;
  Deskripsi: string;
  Tenggat: string;
  LinkMateri: string;
  NISN_Pengumpul: string;
  NamaSiswa: string;
  LinkPengumpulan: string;
  TanggalKumpul: string;
  StatusPengumpulan: 'Belum Dikumpulkan' | 'Sudah Dikumpulkan' | 'Dinilai' | string;
  NilaiTugas: string;
  CatatanGuru: string;
}

export interface TeacherProfile {
  nama: string;
  nip: string;
  sekolah: string;
  email: string;
  alamat: string;
  tiktok: string;
  youtube: string;
  whatsapp: string;
  fotoUrl: string;
}

export interface WhatsAppLogRecord {
  IDLog: string;
  TanggalKirim: string;
  NISN: string;
  NamaSiswa: string;
  KontakOrtu: string;
  Modul: 'Nilai' | 'Evaluasi Setor Hafalan' | 'Ringkasan Perkembangan';
  RingkasanPesan: string;
  StatusKirim: 'Terkirim via API' | 'Siap Kirim (WhatsApp Web)' | 'Gagal';
  ModeKirim: string;
}

export interface SinergiDatabase {
  spreadsheetName: string;
  initializedTabs: string[];
  lastSetupAt: string;
  teacherProfile: TeacherProfile;
  users_guru: UsersGuruRecord[];
  user_orangtua: UserOrangtuaRecord[];
  data_siswa: DataSiswaRecord[];
  jadwal_pelajaran: JadwalPelajaranRecord[];
  absensi: AbsensiRecord[];
  nilai: NilaiRecord[];
  arsip_soal: ArsipSoalRecord[];
  jurnal_harian: JurnalHarianRecord[];
  catatan_siswa: CatatanSiswaRecord[];
  sertifikat: SertifikatRecord[];
  evaluasi_hafalan: EvaluasiHafalanRecord[];
  tugas: TugasRecord[];
  whatsapp_logs?: WhatsAppLogRecord[];
}

export interface AuthSession {
  role: 'guru' | 'orangtua';
  userId: string;
  username: string;
  displayName: string;
  nisn?: string;
  token?: string;
}
