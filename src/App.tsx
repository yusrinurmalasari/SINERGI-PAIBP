import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardCheck,
  Award,
  Mic,
  BookCheck,
  FolderOpen,
  FileText,
  MessageSquare,
  BadgeCheck,
  UserCog,
  UserCheck,
  Code2,
  Printer,
  LogOut,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Menu,
  X,
  BookOpen,
  Copy,
  Check,
  Music,
  Upload,
} from 'lucide-react';
import type { AuthSession, SheetKey, SinergiDatabase, TeacherProfile } from './types/sinergi';
import { ambientAudio, type AmbientPreset } from './utils/ambientAudio';
import { LoginView } from './components/LoginView';
import { TeacherProfileCard } from './components/TeacherProfileCard';
import { DashboardCharts } from './components/DashboardCharts';
import { CrudModuleView } from './components/CrudModuleView';
import { PdfReportView } from './components/PdfReportView';
import { ParentPortalView } from './components/ParentPortalView';
import { AppsScriptExportView } from './components/AppsScriptExportView';

type ActiveSection = 'dashboard' | 'pdf_report' | 'apps_script' | SheetKey;

interface NavItem {
  id: ActiveSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group: 'Utama' | 'Akademik & Evaluasi' | 'Administrasi & Akun';
}

const GURU_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Utama' },
  { id: 'pdf_report', label: 'Cetak Laporan PDF', icon: Printer, group: 'Utama' },
  { id: 'apps_script', label: 'Kode Apps Script', icon: Code2, group: 'Utama' },
  { id: 'data_siswa', label: 'Data Siswa', icon: Users, group: 'Akademik & Evaluasi' },
  { id: 'jadwal_pelajaran', label: 'Jadwal Pelajaran', icon: Calendar, group: 'Akademik & Evaluasi' },
  { id: 'absensi', label: 'Absensi', icon: ClipboardCheck, group: 'Akademik & Evaluasi' },
  { id: 'nilai', label: 'Nilai', icon: Award, group: 'Akademik & Evaluasi' },
  { id: 'evaluasi_hafalan', label: 'Setor Hafalan', icon: Mic, group: 'Akademik & Evaluasi' },
  { id: 'tugas', label: 'Tugas Siswa', icon: BookCheck, group: 'Akademik & Evaluasi' },
  { id: 'arsip_soal', label: 'Arsip Soal', icon: FolderOpen, group: 'Administrasi & Akun' },
  { id: 'jurnal_harian', label: 'Jurnal Harian', icon: FileText, group: 'Administrasi & Akun' },
  { id: 'catatan_siswa', label: 'Catatan Siswa', icon: MessageSquare, group: 'Administrasi & Akun' },
  { id: 'sertifikat', label: 'Sertifikat', icon: BadgeCheck, group: 'Administrasi & Akun' },
  { id: 'users_guru', label: 'Users Guru', icon: UserCog, group: 'Administrasi & Akun' },
  { id: 'user_orangtua', label: 'User Orangtua', icon: UserCheck, group: 'Administrasi & Akun' },
];

export default function App() {
  const initialRoleFromUrl = useMemo<'guru' | 'orangtua'>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('role')?.toLowerCase() === 'orangtua' ? 'orangtua' : 'guru';
  }, []);

  const [session, setSession] = useState<AuthSession | null>(null);
  const [lastAuthenticatedUser, setLastAuthenticatedUser] = useState<{
    role: 'guru' | 'orangtua';
    displayName: string;
  } | null>(() => {
    try {
      const raw = localStorage.getItem('sinergi_last_user');
      return raw ? (JSON.parse(raw) as { role: 'guru' | 'orangtua'; displayName: string }) : null;
    } catch {
      return null;
    }
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('sinergi_theme') === 'dark';
  });

  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicPreset, setMusicPreset] = useState<AmbientPreset>('semangat_pagi');
  const [customAudioName, setCustomAudioName] = useState<string | null>(null);
  const [musicMenuOpen, setMusicMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [db, setDb] = useState<SinergiDatabase | null>(null);
  const [loadingDb, setLoadingDb] = useState(true);
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  const [parentTab, setParentTab] = useState<'nilai' | 'hafalan'>('nilai');
  const [copiedOrtuLink, setCopiedOrtuLink] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('sinergi_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('sinergi_theme', 'light');
    }
  }, [isDark]);

  const fetchDatabase = useCallback(async () => {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = (await res.json()) as SinergiDatabase;
        setDb(data);
      }
    } finally {
      setLoadingDb(false);
    }
  }, []);

  useEffect(() => {
    void fetchDatabase();
  }, [fetchDatabase]);

  const handleLoginSuccess = (nextSession: AuthSession) => {
    const remembered = { role: nextSession.role, displayName: nextSession.displayName };
    setLastAuthenticatedUser(remembered);
    localStorage.setItem('sinergi_last_user', JSON.stringify(remembered));
    setSession(nextSession);
    setActiveSection('dashboard');
  };

  const handleLogout = () => {
    ambientAudio.stop();
    setIsMusicPlaying(false);
    setSession(null);
  };

  const toggleMusic = () => {
    if (isMusicPlaying) {
      ambientAudio.stop();
      setIsMusicPlaying(false);
    } else {
      ambientAudio.start();
      setIsMusicPlaying(true);
    }
  };

  const handlePresetChange = (preset: AmbientPreset) => {
    setMusicPreset(preset);
    setCustomAudioName(null);
    ambientAudio.setPreset(preset);
    if (!isMusicPlaying) {
      ambientAudio.start();
      setIsMusicPlaying(true);
    }
  };

  const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    ambientAudio.playCustomAudioFile(file);
    setCustomAudioName(file.name);
    setIsMusicPlaying(true);
    e.target.value = '';
  };

  const handleClearCustomAudio = () => {
    ambientAudio.clearCustomAudio(false);
    setCustomAudioName(null);
    ambientAudio.setPreset(musicPreset);
    if (isMusicPlaying) {
      ambientAudio.stop();
      ambientAudio.start();
    }
  };

  const handleUpdateTeacherProfile = async (nextProfile: TeacherProfile) => {
    await fetch('/api/profile/teacher', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextProfile),
    });
    await fetchDatabase();
  };

  const handleRunSetupDatabase = async () => {
    await fetch('/api/setup-database', { method: 'POST' });
    await fetchDatabase();
  };

  const copyParentPortalLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('role', 'orangtua');
    void navigator.clipboard.writeText(url.toString());
    setCopiedOrtuLink(true);
    setTimeout(() => setCopiedOrtuLink(false), 2000);
  };

  if (!session) {
    return (
      <LoginView
        initialRole={initialRoleFromUrl}
        onLoginSuccess={handleLoginSuccess}
        isDark={isDark}
        onToggleTheme={() => setIsDark((d) => !d)}
        isMusicPlaying={isMusicPlaying}
        onToggleMusic={toggleMusic}
        lastAuthenticatedUser={lastAuthenticatedUser}
        teacherName={db?.teacherProfile?.nama}
      />
    );
  }

  const activeNavLabel =
    session.role === 'orangtua'
      ? parentTab === 'nilai'
        ? 'Nilai Akademik'
        : 'Evaluasi Setor Hafalan'
      : GURU_NAV.find((n) => n.id === activeSection)?.label || 'Dashboard';

  // KPI computations for Guru Dashboard
  const totalSiswa = db?.data_siswa.length ?? 0;
  const totalTugasAktif = db?.tugas.length ?? 0;
  const avgNilaiAll = db?.nilai.length
    ? (db.nilai.reduce((acc, n) => acc + Number(n.Nilai || 0), 0) / db.nilai.length).toFixed(1)
    : '0.0';
  const avgHafalanAll = db?.evaluasi_hafalan.length
    ? (
        db.evaluasi_hafalan.reduce((acc, h) => acc + Number(h.Nilai || 0), 0) /
        db.evaluasi_hafalan.length
      ).toFixed(1)
    : '0.0';

  const renderSidebarLinks = (isMobile = false) => {
    if (session.role === 'orangtua') {
      return (
        <div className="space-y-1">
          <p className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            Menu Orangtua
          </p>
          <button
            type="button"
            onClick={() => {
              setParentTab('nilai');
              if (isMobile) setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              parentTab === 'nilai'
                ? 'bg-emerald-700 text-white'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            <span>Nilai</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setParentTab('hafalan');
              if (isMobile) setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              parentTab === 'hafalan'
                ? 'bg-emerald-700 text-white'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Mic className="w-4 h-4 shrink-0" />
            <span>Evaluasi Setor Hafalan</span>
          </button>
        </div>
      );
    }

    const groups: NavItem['group'][] = ['Utama', 'Akademik & Evaluasi', 'Administrasi & Akun'];
    return (
      <div className="space-y-5">
        {groups.map((grp) => (
          <div key={grp} className="space-y-1">
            <p className="px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              {grp}
            </p>
            {GURU_NAV.filter((item) => item.group === grp).map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveSection(item.id);
                    if (isMobile) setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-700 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="no-print hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="font-display font-bold text-base tracking-tight whitespace-nowrap">
            SINERGI PAIBP
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">{renderSidebarLinks(false)}</nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
            {session.displayName}
          </p>
          <p className="mt-0.5">
            {session.role === 'guru' ? 'Guru PAIBP · Akses Penuh' : 'Orangtua · Lihat Saja'}
          </p>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="no-print fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-white dark:bg-slate-900 h-full flex flex-col border-r border-slate-200 dark:border-slate-800">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="font-display font-bold text-base">SINERGI PAIBP</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3">{renderSidebarLinks(true)}</nav>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar */}
        <header className="no-print sticky top-0 z-30 flex items-center justify-between gap-4 px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Buka menu navigasi"
              className="lg:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400 truncate">
              <span>SINERGI PAIBP</span>
              <span className="mx-2" aria-hidden="true">/</span>
              <span className="text-slate-900 dark:text-slate-100 font-semibold">
                {activeNavLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Instrumen Semangat */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMusicMenuOpen((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                  isMusicPlaying
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {isMusicPlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">
                  {isMusicPlaying ? 'Instrumen Semangat' : 'Musik Off'}
                </span>
              </button>

              {musicMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-3.5 z-50">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-xs font-bold block text-slate-900 dark:text-slate-100">
                        Instrumen Semangat
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Musik Pengiring Energik &amp; Produktif
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={toggleMusic}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold shrink-0 ${
                        isMusicPlaying
                          ? 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300'
                          : 'bg-emerald-700 text-white'
                      }`}
                    >
                      {isMusicPlaying ? 'Hentikan' : 'Putar'}
                    </button>
                  </div>
                  <div className="space-y-1 mb-3">
                    {ambientAudio.getPresets().map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handlePresetChange(preset.id)}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors ${
                          !customAudioName && musicPreset === preset.id
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Music className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{preset.label}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 pl-5">
                          {preset.subtitle}
                        </p>
                      </button>
                    ))}
                  </div>
                  <div className="pt-2.5 pb-2.5 border-t border-slate-100 dark:border-slate-800 mb-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <label className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer">
                        <Upload className="w-3 h-3" />
                        <span>Putar File MP3 Lokal</span>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleCustomAudioUpload}
                          className="hidden"
                        />
                      </label>
                      {customAudioName && (
                        <button
                          type="button"
                          onClick={handleClearCustomAudio}
                          className="text-[10px] text-red-600 dark:text-red-400 hover:underline"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                    {customAudioName && (
                      <p className="text-[10px] text-slate-600 dark:text-slate-300 truncate mt-1">
                        Aktif: {customAudioName}
                      </p>
                    )}
                  </div>
                  <label className="block text-[11px] text-slate-500 mb-1">Volume</label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    defaultValue={0.28}
                    onChange={(e) => ambientAudio.setVolume(Number(e.target.value))}
                    className="w-full accent-emerald-700"
                  />
                </div>
              )}
            </div>

            {/* Light / Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsDark((d) => !d)}
              aria-label="Ganti mode terang atau gelap"
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {session.role === 'guru' && (
              <button
                type="button"
                onClick={() => setActiveSection('pdf_report')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak PDF</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors whitespace-nowrap shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {loadingDb || !db ? (
            <div className="space-y-4">
              <div className="h-32 rounded-xl bg-slate-200/70 dark:bg-slate-800/60 animate-pulse" />
              <div className="h-72 rounded-xl bg-slate-200/70 dark:bg-slate-800/60 animate-pulse" />
            </div>
          ) : session.role === 'orangtua' ? (
            <ParentPortalView
              session={session}
              db={db}
              activeTab={parentTab}
              onTabChange={setParentTab}
              onRefresh={fetchDatabase}
            />
          ) : activeSection === 'dashboard' ? (
            <div className="space-y-6">
              {/* 4-Column KPI Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Total Siswa Terdaftar
                  </p>
                  <p className="font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-1.5">
                    {totalSiswa}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Rata-rata Nilai PAIBP
                  </p>
                  <p className="font-mono text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400 mt-1.5">
                    {avgNilaiAll}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Rata-rata Setor Hafalan
                  </p>
                  <p className="font-mono text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-400 mt-1.5">
                    {avgHafalanAll}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Tugas &amp; Pengumpulan
                  </p>
                  <p className="font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-1.5">
                    {totalTugasAktif}
                  </p>
                </div>
              </div>

              {/* Teacher Profile + Monthly/Yearly Attendance Chart */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 lg:gap-7 items-stretch">
                <div className="xl:col-span-5 flex flex-col">
                  <TeacherProfileCard
                    profile={db.teacherProfile}
                    onUpdateProfile={handleUpdateTeacherProfile}
                  />
                </div>
                <div className="xl:col-span-7 flex flex-col">
                  <DashboardCharts db={db} />
                </div>
              </div>

              {/* Quick Actions Strip: PDF Print + Parent Portal Link + Apps Script Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display text-sm font-bold">
                      Cetak Laporan Rekap Nilai &amp; Hafalan (PDF)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Format A4 resmi lengkap dengan filter kelas, siswa, dan tanda tangan guru.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSection('pdf_report')}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold whitespace-nowrap shrink-0 self-start sm:self-center"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Buka Cetak PDF</span>
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display text-sm font-bold">
                      Tautan Portal Khusus Orangtua
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Orangtua login dengan NISN untuk melihat Nilai, Setor Hafalan &amp; unggah foto anak.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={copyParentPortalLink}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold whitespace-nowrap shrink-0 self-start sm:self-center"
                  >
                    {copiedOrtuLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedOrtuLink ? 'Link Tersalin' : 'Salin Link Ortu'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : activeSection === 'pdf_report' ? (
            <PdfReportView db={db} onBack={() => setActiveSection('dashboard')} />
          ) : activeSection === 'apps_script' ? (
            <AppsScriptExportView
              initializedTabs={db.initializedTabs}
              onRunSetupDatabase={handleRunSetupDatabase}
            />
          ) : (
            <CrudModuleView
              sheet={activeSection}
              db={db}
              authToken={session.token}
              onRefresh={fetchDatabase}
            />
          )}
        </main>
      </div>
    </div>
  );
}
