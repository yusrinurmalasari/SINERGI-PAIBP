import React, { useEffect, useMemo, useState } from 'react';
import { MessageCircle, Send, X, CheckCircle2, AlertCircle, ExternalLink, Users } from 'lucide-react';
import type { SinergiDatabase, WhatsAppLogRecord } from '../types/sinergi';

export interface WhatsAppTargetContext {
  mode: 'single' | 'bulk';
  modul: 'Nilai' | 'Evaluasi Setor Hafalan' | 'Ringkasan Perkembangan';
  nisn?: string;
  recordId?: string;
}

interface WhatsAppNotifyModalProps {
  open: boolean;
  context: WhatsAppTargetContext | null;
  db: SinergiDatabase;
  authToken?: string;
  onClose: () => void;
  onSent: () => Promise<void>;
}

interface BulkResultItem {
  nisn: string;
  namaSiswa: string;
  kontakOrtu: string;
  statusKirim: string;
  waUrl?: string;
  detail: string;
}

export const WhatsAppNotifyModal: React.FC<WhatsAppNotifyModalProps> = ({
  open,
  context,
  db,
  authToken,
  onClose,
  onSent,
}) => {
  const [customNote, setCustomNote] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [targetInfo, setTargetInfo] = useState<{
    namaSiswa: string;
    kelas: string;
    kontakOrtu: string;
    normalizedPhone: string | null;
  } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedKelas, setSelectedKelas] = useState('ALL');
  const [sendResult, setSendResult] = useState<{
    ok: boolean;
    message: string;
    statusKirim?: string;
    modeKirim?: string;
    waUrl?: string;
  } | null>(null);
  const [bulkResults, setBulkResults] = useState<BulkResultItem[] | null>(null);
  const [gatewayConfigured, setGatewayConfigured] = useState<boolean>(false);
  const [gatewayProvider, setGatewayProvider] = useState<string>('fonnte');

  const kelasList = useMemo(
    () => Array.from(new Set(db.data_siswa.map((s) => s.Kelas))).sort(),
    [db.data_siswa]
  );

  useEffect(() => {
    if (!open || !context) return;
    setSendResult(null);
    setBulkResults(null);
    setCustomNote('');

    const headers: Record<string, string> = {};
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    void fetch('/api/notifications/whatsapp/status', { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.success) {
          setGatewayConfigured(Boolean(data.configured));
          setGatewayProvider(String(data.provider || 'fonnte'));
        }
      })
      .catch(() => {});
  }, [open, context, authToken]);

  useEffect(() => {
    if (!open || !context || context.mode !== 'single' || !context.nisn) return;
    const timer = window.setTimeout(async () => {
      setLoadingPreview(true);
      try {
        const res = await fetch('/api/notifications/whatsapp/preview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify({
            nisn: context.nisn,
            modul: context.modul,
            recordId: context.recordId,
            customNote,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setPreviewText(data.message);
          setTargetInfo({
            namaSiswa: data.namaSiswa,
            kelas: data.kelas,
            kontakOrtu: data.kontakOrtu,
            normalizedPhone: data.normalizedPhone,
          });
        }
      } finally {
        setLoadingPreview(false);
      }
    }, 150);
    return () => window.clearTimeout(timer);
  }, [open, context, customNote, authToken]);

  if (!open || !context) return null;

  const handleSendSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!context.nisn) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch('/api/notifications/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          nisn: context.nisn,
          modul: context.modul,
          recordId: context.recordId,
          customNote,
        }),
      });
      const data = await res.json();
      setSendResult({
        ok: Boolean(data.success),
        message: data.message || 'Proses selesai.',
        statusKirim: data.statusKirim,
        modeKirim: data.modeKirim,
        waUrl: data.waUrl,
      });
      await onSent();
    } catch {
      setSendResult({ ok: false, message: 'Gagal terhubung ke endpoint notifikasi WhatsApp.' });
    } finally {
      setSending(false);
    }
  };

  const handleSendBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setBulkResults(null);
    setSendResult(null);
    try {
      const res = await fetch('/api/notifications/whatsapp/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          kelas: selectedKelas,
          modul: context.modul,
          customNote,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBulkResults(data.results || []);
        await onSent();
      } else {
        setSendResult({ ok: false, message: data.message || 'Gagal mengirim notifikasi massal.' });
      }
    } catch {
      setSendResult({ ok: false, message: 'Gagal terhubung ke endpoint pengiriman massal.' });
    } finally {
      setSending(false);
    }
  };

  const targetStudentsCount = db.data_siswa.filter(
    (s) => selectedKelas === 'ALL' || s.Kelas === selectedKelas
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <MessageCircle className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <div>
              <h3 className="font-display font-bold text-base">
                {context.mode === 'single'
                  ? `Kirim Notifikasi WhatsApp (${context.modul})`
                  : `Kirim Ringkasan Perkembangan Massal (${context.modul})`}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {gatewayConfigured
                  ? `Gateway API aktif (${gatewayProvider}) · Terhubung ke KontakOrtu di Data_Siswa`
                  : 'Mode WhatsApp Web Fallback · Atur WHATSAPP_API_URL & WHATSAPP_API_TOKEN di Secrets untuk kirim otomatis penuh'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {context.mode === 'single' ? (
          <form onSubmit={handleSendSingle} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {targetInfo && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 block">Siswa</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {targetInfo.namaSiswa} ({targetInfo.kelas})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">KontakOrtu (Data_Siswa)</span>
                  <span className="font-mono font-semibold tabular-nums">
                    {targetInfo.kontakOrtu || 'Belum diisi'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Format Tujuan WA</span>
                  <span className="font-mono font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                    {targetInfo.normalizedPhone || 'Nomor tidak valid'}
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1">
                Catatan Tambahan Guru (Opsional)
              </label>
              <input
                type="text"
                maxLength={300}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Contoh: Mohon bimbingan murajaah di rumah setiap ba'da Maghrib."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold">Pratinjau Ringkasan Perkembangan Siswa</label>
                {loadingPreview && <span className="text-[11px] text-slate-400">Memuat pratinjau...</span>}
              </div>
              <pre className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-sans whitespace-pre-wrap leading-relaxed text-slate-800 dark:text-slate-200 max-h-56 overflow-y-auto">
                {previewText || 'Mempersiapkan ringkasan perkembangan siswa...'}
              </pre>
            </div>

            {sendResult && (
              <div
                className={`p-3.5 rounded-lg border text-xs space-y-2 ${
                  sendResult.ok
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  {sendResult.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>
                    {sendResult.statusKirim ? `${sendResult.statusKirim} — ` : ''}
                    {sendResult.message}
                  </span>
                </div>
                {sendResult.waUrl && (
                  <a
                    href={sendResult.waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
                  >
                    <span>Buka Pesan di WhatsApp Web</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700"
              >
                Tutup
              </button>
              <button
                type="submit"
                disabled={sending || !targetInfo?.normalizedPhone}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sending ? 'Mengirim...' : 'Kirim Notifikasi WhatsApp'}</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSendBulk} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Filter Kelas Tujuan</label>
                <select
                  value={selectedKelas}
                  onChange={(e) => setSelectedKelas(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                >
                  <option value="ALL">Semua Kelas ({db.data_siswa.length} siswa)</option>
                  {kelasList.map((k) => (
                    <option key={k} value={k}>
                      Kelas {k} ({db.data_siswa.filter((s) => s.Kelas === k).length} siswa)
                    </option>
                  ))}
                </select>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-xs">
                <Users className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>
                  Akan memproses <strong className="font-mono tabular-nums">{targetStudentsCount}</strong> orangtua sesuai nomor <span className="font-mono">KontakOrtu</span> di tab <span className="font-mono">Data_Siswa</span>.
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Catatan Pengantar Guru (Opsional)
              </label>
              <input
                type="text"
                maxLength={300}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Contoh: Berikut ringkasan capaian PAIBP ananda pekan ini."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>

            {sendResult && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
                {sendResult.message}
              </div>
            )}

            {bulkResults && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                      <th className="py-2 px-3">Siswa</th>
                      <th className="py-2 px-3">Kontak Ortu</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3 text-right">Tautan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {bulkResults.map((item) => (
                      <tr key={item.nisn}>
                        <td className="py-2 px-3 font-medium">{item.namaSiswa}</td>
                        <td className="py-2 px-3 font-mono tabular-nums">{item.kontakOrtu}</td>
                        <td className="py-2 px-3">{item.statusKirim}</td>
                        <td className="py-2 px-3 text-right">
                          {item.waUrl ? (
                            <a
                              href={item.waUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
                            >
                              <span>Buka WA</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700"
              >
                Tutup
              </button>
              <button
                type="submit"
                disabled={sending || targetStudentsCount === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sending ? 'Mengirim ke Orangtua...' : 'Kirim Ringkasan ke Semua Orangtua'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

interface WhatsAppHistoryPanelProps {
  logs: WhatsAppLogRecord[];
}

export const WhatsAppHistoryPanel: React.FC<WhatsAppHistoryPanelProps> = ({ logs }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="font-display text-sm font-bold">Riwayat Pengiriman Notifikasi WhatsApp</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Catatan pengiriman ringkasan Nilai &amp; Evaluasi Setor Hafalan ke KontakOrtu
          </p>
        </div>
        <span className="text-xs font-mono tabular-nums text-slate-500">
          {logs.length} log
        </span>
      </div>

      <div className="overflow-x-auto max-h-64">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              <th className="py-2.5 px-4">Waktu</th>
              <th className="py-2.5 px-4">Siswa</th>
              <th className="py-2.5 px-4">Kontak Ortu</th>
              <th className="py-2.5 px-4">Modul</th>
              <th className="py-2.5 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-500">
                  Belum ada notifikasi WhatsApp yang dikirim.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.IDLog} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2 px-4 font-mono tabular-nums whitespace-nowrap">
                    {new Date(log.TanggalKirim).toLocaleString('id-ID')}
                  </td>
                  <td className="py-2 px-4 font-medium">{log.NamaSiswa}</td>
                  <td className="py-2 px-4 font-mono tabular-nums">{log.KontakOrtu}</td>
                  <td className="py-2 px-4">{log.Modul}</td>
                  <td className="py-2 px-4">
                    <span
                      className={`font-medium ${
                        log.StatusKirim === 'Terkirim via API'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : log.StatusKirim === 'Gagal'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {log.StatusKirim}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
