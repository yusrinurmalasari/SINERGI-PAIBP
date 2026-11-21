import React, { useState } from 'react';
import { Camera, Mail, MapPin, Pencil, ExternalLink, MessageCircle, Video, PlaySquare, X } from 'lucide-react';
import type { TeacherProfile } from '../types/sinergi';

interface TeacherProfileCardProps {
  profile: TeacherProfile;
  onUpdateProfile: (next: TeacherProfile) => Promise<void>;
}

export const TeacherProfileCard: React.FC<TeacherProfileCardProps> = ({
  profile,
  onUpdateProfile,
}) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<TeacherProfile>(profile);
  const [saving, setSaving] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const openModal = () => {
    setForm(profile);
    setEditing(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = String(ev.target?.result || '');
      if (dataUrl) {
        setImgFailed(false);
        await onUpdateProfile({ ...profile, fotoUrl: dataUrl });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onUpdateProfile(form);
    setSaving(false);
    setEditing(false);
  };

  const waHref = profile.whatsapp
    ? `https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`
    : '#';

  return (
    <>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative shrink-0">
                {profile.fotoUrl && !imgFailed ? (
                  <img
                    src={profile.fotoUrl}
                    alt={profile.nama}
                    referrerPolicy="no-referrer"
                    onError={() => setImgFailed(true)}
                    className="w-20 h-20 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-emerald-700 text-white flex items-center justify-center font-display text-2xl font-bold">
                    {profile.nama.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <label
                  htmlFor="teacher-photo-upload"
                  title="Unggah foto guru"
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center cursor-pointer border-2 border-white dark:border-slate-900 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <input
                    id="teacher-photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  Profil Pendidik PAIBP
                </p>
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                  {profile.nama}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums mt-0.5">
                  NIP {profile.nip} · {profile.sekolah}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Profil</span>
            </button>
          </div>

          <div className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <span className="break-all">{profile.email}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <span>{profile.alamat}</span>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2.5">
            Kanal Komunikasi &amp; Media Pembelajaran
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={profile.tiktok || '#'}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors"
            >
              <Video className="w-3.5 h-3.5" />
              <span>TikTok</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
            <a
              href={profile.youtube || '#'}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors"
            >
              <PlaySquare className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              <span>YouTube</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-medium text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-display font-bold text-base">Perbarui Profil Guru PAIBP</h3>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-3.5 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold mb-1">Nama Lengkap &amp; Gelar</label>
                <input
                  required
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">NIP</label>
                  <input
                    value={form.nip}
                    onChange={(e) => setForm({ ...form, nip: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Satuan Pendidikan</label>
                  <input
                    value={form.sekolah}
                    onChange={(e) => setForm({ ...form, sekolah: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Alamat Lengkap</label>
                <textarea
                  rows={2}
                  value={form.alamat}
                  onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Link TikTok</label>
                  <input
                    value={form.tiktok}
                    onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Link YouTube</label>
                  <input
                    value={form.youtube}
                    onChange={(e) => setForm({ ...form, youtube: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">WhatsApp (628xxx)</label>
                  <input
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Profil'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
