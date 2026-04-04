import { useRef, useState } from 'react';
import { exportAllData, importAllData, type BackupData } from '../db/queries';

type ImportState = 'idle' | 'preview' | 'importing' | 'done' | 'error';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('cs-CZ', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function BackupSection() {
  const [exporting, setExporting] = useState(false);
  const [importState, setImportState] = useState<ImportState>('idle');
  const [preview, setPreview] = useState<BackupData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Export ──────────────────────────────────────────────────────────────
  async function handleExport() {
    setExporting(true);
    try {
      const data = await exportAllData();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const date = new Date().toISOString().slice(0, 10);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gymlog-zaloha-${date}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  // ── Import — file selected ───────────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as BackupData;
        // Basic validation
        if (
          typeof parsed.version !== 'number' ||
          !Array.isArray(parsed.exercises) ||
          !Array.isArray(parsed.sessions) ||
          !Array.isArray(parsed.sessionEntries)
        ) {
          throw new Error('Soubor není platná záloha GymLog.');
        }
        setPreview(parsed);
        setImportState('preview');
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Neplatný soubor.');
        setImportState('error');
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be picked again
    e.target.value = '';
  }

  // ── Import — confirmed ───────────────────────────────────────────────────
  async function handleImportConfirm() {
    if (!preview) return;
    setImportState('importing');
    try {
      await importAllData(preview);
      setImportState('done');
      setPreview(null);
    } catch {
      setErrorMsg('Import se nezdařil. Zkus to znovu.');
      setImportState('error');
    }
  }

  function reset() {
    setImportState('idle');
    setPreview(null);
    setErrorMsg('');
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-zinc-800/60">
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-0.5">Data</p>
        <p className="text-white font-semibold text-sm">Záloha a obnova</p>
      </div>

      <div className="p-4 flex flex-col gap-3">

        {/* Export */}
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 transition-colors text-left disabled:opacity-60"
        >
          <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <div>
            <p className="text-white text-sm font-medium leading-tight">
              {exporting ? 'Exportuji…' : 'Exportovat zálohu'}
            </p>
            <p className="text-zinc-500 text-xs mt-0.5">Stáhne JSON soubor se všemi daty</p>
          </div>
        </button>

        {/* Import trigger */}
        {importState === 'idle' && (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-medium leading-tight">Importovat zálohu</p>
              <p className="text-zinc-500 text-xs mt-0.5">Nahraje data ze záložního JSON souboru</p>
            </div>
          </button>
        )}

        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Preview / confirm */}
        {importState === 'preview' && preview && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="text-amber-400 font-semibold text-sm mb-1">Potvrdit import</p>
            <p className="text-zinc-400 text-xs mb-3 leading-relaxed">
              Záloha z <span className="text-zinc-200">{formatDate(preview.exportedAt)}</span>
            </p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: 'Cviky', value: preview.exercises.length },
                { label: 'Tréninky', value: preview.sessions.length },
                { label: 'Záznamy', value: preview.sessionEntries.length },
              ].map(({ label, value }) => (
                <div key={label} className="bg-zinc-900 rounded-lg px-3 py-2 text-center">
                  <p className="text-white font-bold text-lg">{value}</p>
                  <p className="text-zinc-500 text-[10px]">{label}</p>
                </div>
              ))}
            </div>
            <p className="text-amber-300/80 text-xs mb-4 leading-relaxed">
              ⚠️ Tato akce <strong>přepíše všechna současná data</strong>. Pokud chceš zachovat aktuální data, nejdřív je exportuj.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleImportConfirm}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-colors"
              >
                Importovat
              </button>
              <button
                onClick={reset}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white text-sm transition-colors"
              >
                Zrušit
              </button>
            </div>
          </div>
        )}

        {/* Importing */}
        {importState === 'importing' && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700">
            <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin shrink-0" />
            <p className="text-zinc-300 text-sm">Importuji data…</p>
          </div>
        )}

        {/* Done */}
        {importState === 'done' && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 text-lg">✓</span>
              <div>
                <p className="text-emerald-400 font-semibold text-sm">Import dokončen</p>
                <p className="text-zinc-500 text-xs">Data byla obnovena. Stránka se aktualizuje.</p>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors ml-3 shrink-0"
            >
              Obnovit →
            </button>
          </div>
        )}

        {/* Error */}
        {importState === 'error' && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-red-400 font-semibold text-sm">Chyba</p>
              <p className="text-zinc-500 text-xs mt-0.5">{errorMsg}</p>
            </div>
            <button onClick={reset} className="text-xs text-zinc-400 hover:text-white ml-3 shrink-0">
              Zkusit znovu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
