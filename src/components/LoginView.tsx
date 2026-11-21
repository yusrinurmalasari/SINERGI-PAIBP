import React, { useState } from 'react';
import { BookOpen, Copy, Check, Lock, User, Moon, Sun, Volume2, VolumeX, ArrowRight } from 'lucide-react';
import type { AuthSession } from '../types/sinergi';

interface LoginViewProps {
  initialRole: 'guru' | 'orangtua';
  onLoginSuccess: (session: AuthSession) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  lastAuthenticatedUser?: {
    role: 'guru' | 'orangtua';
    displayName: string;
  } | null;
  teacherName?: string;
}

export const LoginView: React.FC<LoginViewProps> = ({
  initialRole,
  onLoginSuccess,
  isDark,
  onToggleTheme,
  isMusicPlaying,
  onToggleMusic,
  lastAuthenticatedUser,
  teacherName,
}) => {
  const [role, setRole] = useState<'guru' | 'orangtua'>(initialRole);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedRole, setCopiedRole] = useState<'guru' | 'orangtua' | null>(null);
  const [imgError, setImgError] = useState(false);

  const handleRoleSwitch = (nextRole: 'guru' | 'orangtua') => {
    setRole(nextRole);
    setError(null);
    setUsername('');
    setPassword('');
    const url = new URL(window.location.href);
    url.searchParams.set('role', nextRole);
    window.history.replaceState({}, '', url.toString());
  };

  const handleCopyLink = (targetRole: 'guru' | 'orangtua') => {
    const url = new URL(window.location.href);
    url.searchParams.set('role', targetRole);
    void navigator.clipboard.writeText(url.toString());
    setCopiedRole(targetRole);
    setTimeout(() => setCopiedRole(null), 2000);
  };

  const fillDemo = () => {
    if (role === 'guru') {
      setUsername('yusri');
      setPassword('123');
    } else {
      setUsername('0123456789');
      setPassword('123');
    }
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Gagal masuk. Periksa kembali kredensial Anda.');
        setLoading(false);
        return;
      }
      onLoginSuccess(data.session);
    } catch {
      setError('Tidak dapat terhubung ke server SINERGI PAIBP.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Minimal Top Utility Bar */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">SINERGI PAIBP</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleMusic}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
              isMusicPlaying
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {isMusicPlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{isMusicPlaying ? 'Instrumen Semangat Aktif' : 'Putar Instrumen Semangat'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Ganti tema terang atau gelap"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main 2-Column Split */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 items-stretch bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          {/* Left Architectural Panel */}
          <div className="lg:col-span-6 relative min-h-[260px] lg:min-h-[540px] bg-slate-900">
            {!imgError ? (
              <img
                src="/src/assets/images/sinergi_banner_1795255655017.jpg"
                alt="Lingkungan belajar Pendidikan Agama Islam yang tenang"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-emerald-400/50" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-slate-950/20 flex flex-col justify-end p-8 text-white">
              <p className="text-sm sm:text-base font-semibold tracking-wide text-emerald-300 hover:text-emerald-100 transition-colors duration-300 leading-relaxed mb-2.5">
                {lastAuthenticatedUser && lastAuthenticatedUser.role === role
                  ? role === 'guru'
                    ? `Selamat datang kembali, ${lastAuthenticatedUser.displayName}! Saatnya mengelola administrasi kelas hari ini.`
                    : `Selamat datang kembali, Wali dari ${lastAuthenticatedUser.displayName}! Mari pantau capaian belajar ananda hari ini.`
                  : role === 'guru'
                    ? `Selamat datang kembali, ${teacherName || 'Ibu guru'}! Saatnya mengelola administrasi kelas hari ini.`
                    : 'Selamat datang kembali, Bapak/Ibu Orangtua! Mari pantau nilai dan setoran hafalan ananda hari ini.'}
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight mb-3 text-balance">
                Sistem Informasi dan Evaluasi Terintegrasi PAIBP
              </h1>
              <p className="text-sm text-slate-200 leading-relaxed max-w-md">
                Platform administrasi guru Pendidikan Agama Islam &amp; Budi Pekerti serta pemantauan transparan nilai dan setoran hafalan bagi orangtua siswa.
              </p>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="mb-6">
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-100">
                  {role === 'guru' ? 'Masuk Portal Guru PAIBP' : 'Masuk Portal Orangtua / Wali'}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {role === 'guru'
                    ? 'Akses penuh manajemen siswa, absensi, nilai, jurnal, tugas, dan laporan PDF.'
                    : 'Pantau capaian nilai, evaluasi setor hafalan, dan perbarui foto profil ananda.'}
                </p>
              </div>

              {/* Segmented Role Control */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mb-6">
                <button
                  type="button"
                  onClick={() => handleRoleSwitch('guru')}
                  className={`py-2 px-3 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                    role === 'guru'
                      ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Akses Guru PAIBP
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSwitch('orangtua')}
                  className={`py-2 px-3 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                    role === 'orangtua'
                      ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Akses Orangtua (NISN)
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {role === 'guru' ? 'Username Guru' : 'Username (NISN Siswa)'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={role === 'guru' ? 'Contoh: yusri' : 'Contoh: 0123456789'}
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password"
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={fillDemo}
                    className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    Isi akun contoh ({role === 'guru' ? 'yusri' : 'NISN 0123456789'})
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition-colors disabled:opacity-60"
                >
                  <span>{loading ? 'Memverifikasi...' : `Masuk sebagai ${role === 'guru' ? 'Guru' : 'Orangtua'}`}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Separate Shareable Portal Links */}
            <div className="mt-8 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Link Akses Terpisah untuk Dibagikan
              </p>
              <div className="flex items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400">
                <span className="truncate font-mono">?role=guru (Portal Administrasi Guru)</span>
                <button
                  type="button"
                  onClick={() => handleCopyLink('guru')}
                  className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium hover:underline whitespace-nowrap shrink-0"
                >
                  {copiedRole === 'guru' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRole === 'guru' ? 'Tersalin' : 'Salin Link'}</span>
                </button>
              </div>
              <div className="flex items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400">
                <span className="truncate font-mono">?role=orangtua (Portal Khusus Orangtua)</span>
                <button
                  type="button"
                  onClick={() => handleCopyLink('orangtua')}
                  className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium hover:underline whitespace-nowrap shrink-0"
                >
                  {copiedRole === 'orangtua' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRole === 'orangtua' ? 'Tersalin' : 'Salin Link'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
