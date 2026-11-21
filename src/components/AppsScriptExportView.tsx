import React, { useState } from 'react';
import { Copy, Check, Download, Database, CheckCircle2 } from 'lucide-react';
import {
  GAS_CODE_GS,
  GAS_INDEX_HTML,
  GAS_JAVASCRIPT_HTML,
  GAS_CSS_HTML,
} from '../gas/gasTemplates';

interface AppsScriptExportViewProps {
  initializedTabs: string[];
  onRunSetupDatabase: () => Promise<void>;
}

const FILES = [
  { id: 'Code.gs', label: 'Code.gs', desc: 'Backend Apps Script, setupDatabase(), Routing & CRUD', content: GAS_CODE_GS },
  { id: 'Index.html', label: 'Index.html', desc: 'Kerangka UI Bootstrap 5, Sidebar, Portal Guru & Orangtua', content: GAS_INDEX_HTML },
  { id: 'JavaScript.html', label: 'JavaScript.html', desc: 'Komunikasi google.script.run, Chart.js, Instrumen Semangat & PDF', content: GAS_JAVASCRIPT_HTML },
  { id: 'CSS.html', label: 'CSS.html', desc: 'Styling responsif, Mode Terang/Gelap & CSS Print PDF', content: GAS_CSS_HTML },
] as const;

export const AppsScriptExportView: React.FC<AppsScriptExportViewProps> = ({
  initializedTabs,
  onRunSetupDatabase,
}) => {
  const [activeFile, setActiveFile] = useState<(typeof FILES)[number]['id']>('Code.gs');
  const [copied, setCopied] = useState(false);
  const [settingUp, setSettingUp] = useState(false);
  const [setupMessage, setSetupMessage] = useState<string | null>(null);

  const currentFile = FILES.find((f) => f.id === activeFile) || FILES[0];

  const handleCopy = () => {
    void navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.label;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSetupDb = async () => {
    setSettingUp(true);
    await onRunSetupDatabase();
    setSettingUp(false);
    setSetupMessage('Seluruh tab database SINERGI-PAIBP berhasil diverifikasi.');
    setTimeout(() => setSetupMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* OOTB Database Verification Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-display text-lg font-bold">
              Struktur Google Sheets (SINERGI-PAIBP) &amp; Kode Apps Script Lengkap
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Salin atau unduh keempat file di bawah ini ke editor script.google.com, lalu jalankan fungsi setupDatabase().
            </p>
          </div>
          <button
            type="button"
            onClick={handleSetupDb}
            disabled={settingUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <Database className="w-4 h-4" />
            <span>{settingUp ? 'Memeriksa Tab...' : 'Jalankan Simulasi setupDatabase()'}</span>
          </button>
        </div>

        {setupMessage && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{setupMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3.5 text-xs">
          {initializedTabs.map((tab) => (
            <div
              key={tab}
              className="px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-slate-700 dark:text-slate-300 flex items-center gap-2"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{tab}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Code Viewer */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex flex-wrap items-center gap-1">
            {FILES.map((file) => (
              <button
                key={file.id}
                type="button"
                onClick={() => setActiveFile(file.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors whitespace-nowrap ${
                  activeFile === file.id
                    ? 'bg-emerald-700 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                }`}
              >
                {file.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin Kode'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh {currentFile.label}</span>
            </button>
          </div>
        </div>

        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          {currentFile.desc}
        </div>

        <pre className="p-4 text-xs font-mono leading-relaxed overflow-x-auto max-h-[520px] bg-slate-950 text-slate-100">
          <code>{currentFile.content}</code>
        </pre>
      </div>
    </div>
  );
};
