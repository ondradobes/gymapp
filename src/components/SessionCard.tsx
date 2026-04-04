import { useState } from 'react';
import { Link } from 'react-router';
import { updateSessionEntry, deleteSessionEntry, deleteSession } from '../db/queries';
import type { SessionEntry, Exercise, Session, DayOfWeek } from '../types';

const DAY_NAMES: Record<DayOfWeek, string> = {
  monday: 'Nohy',
  wednesday: 'Hruď & Ramena',
  friday: 'Záda, Biceps & Triceps',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
}

function calcVolume(entries: SessionEntry[]): number {
  return entries.reduce((sum, e) => {
    if (e.weight == null || e.reps == null) return sum;
    return sum + e.weight * e.reps * (e.sets ?? 1);
  }, 0);
}

interface EditState {
  weight: string;
  reps: string;
  sets: string;
}

interface EntryRowProps {
  entry: SessionEntry;
  exercise: Exercise | undefined;
  onUpdated: (updated: SessionEntry) => void;
  onDeleted: (entryId: number) => void;
}

function EntryRow({ entry, exercise, onUpdated, onDeleted }: EntryRowProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState<EditState>({
    weight: entry.weight != null ? String(entry.weight) : '',
    reps: entry.reps != null ? String(entry.reps) : '',
    sets: entry.sets != null ? String(entry.sets) : '',
  });

  async function handleSave() {
    setSaving(true);
    const updated: SessionEntry = {
      ...entry,
      weight: form.weight ? parseFloat(form.weight) : null,
      reps: form.reps ? parseInt(form.reps, 10) : null,
      sets: form.sets ? parseInt(form.sets, 10) : null,
    };
    await updateSessionEntry(updated);
    onUpdated(updated);
    setEditing(false);
    setSaving(false);
  }

  async function handleDelete() {
    await deleteSessionEntry(entry.id);
    onDeleted(entry.id);
  }

  if (!exercise) return null;

  if (editing) {
    return (
      <li className="px-4 py-3 bg-zinc-800/50">
        <p className="text-xs text-zinc-400 font-medium mb-2">{exercise.name}</p>
        <div className="flex gap-2 mb-3">
          <div className="flex-1">
            <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Váha (kg)</label>
            <input
              type="number"
              inputMode="decimal"
              value={form.weight}
              onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
              className="w-full bg-zinc-700 border border-zinc-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
            />
          </div>
          <div className="w-20">
            <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Opak.</label>
            <input
              type="number"
              inputMode="numeric"
              value={form.reps}
              onChange={(e) => setForm((f) => ({ ...f, reps: e.target.value }))}
              className="w-full bg-zinc-700 border border-zinc-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
            />
          </div>
          <div className="w-20">
            <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Série</label>
            <input
              type="number"
              inputMode="numeric"
              value={form.sets}
              onChange={(e) => setForm((f) => ({ ...f, sets: e.target.value }))}
              className="w-full bg-zinc-700 border border-zinc-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {saving ? 'Ukládám…' : 'Uložit'}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="px-4 py-2 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-sm transition-colors"
          >
            Zrušit
          </button>
          {confirmDelete ? (
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors"
            >
              Smazat?
            </button>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="px-3 py-2 rounded-xl bg-zinc-700 hover:bg-red-900/50 text-zinc-400 hover:text-red-400 transition-colors"
              title="Smazat záznam"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between px-4 py-3 text-sm group">
      <Link
        to={`/exercise/${exercise.id}/progress`}
        className="text-zinc-300 hover:text-violet-400 transition-colors truncate flex-1 min-w-0 mr-2"
      >
        {exercise.name}
      </Link>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-zinc-200 font-medium tabular-nums">
          {entry.weight} kg
          {entry.sets != null && entry.reps != null && (
            <span className="text-zinc-500 font-normal ml-1.5">
              {entry.sets}×{entry.reps}
            </span>
          )}
        </span>
        <button
          onClick={() => setEditing(true)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100"
          title="Upravit"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      </div>
    </li>
  );
}

interface Props {
  session: Session;
  entries: SessionEntry[];
  exerciseMap: Record<number, Exercise>;
  onDeleted: (sessionId: number) => void;
  onEntriesChanged: (sessionId: number, entries: SessionEntry[]) => void;
}

export default function SessionCard({ session, entries, exerciseMap, onDeleted, onEntriesChanged }: Props) {
  const [confirmDeleteSession, setConfirmDeleteSession] = useState(false);
  const [localEntries, setLocalEntries] = useState(entries);

  const filteredEntries = localEntries.filter((e) => e.weight != null);
  const totalVolume = calcVolume(filteredEntries);

  function handleEntryUpdated(updated: SessionEntry) {
    const next = localEntries.map((e) => (e.id === updated.id ? updated : e));
    setLocalEntries(next);
    onEntriesChanged(session.id, next);
  }

  function handleEntryDeleted(entryId: number) {
    const next = localEntries.filter((e) => e.id !== entryId);
    setLocalEntries(next);
    onEntriesChanged(session.id, next);
  }

  async function handleDeleteSession() {
    await deleteSession(session.id);
    onDeleted(session.id);
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      {/* Session header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-zinc-800/60">
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
            {DAY_NAMES[session.trainingDayId]}
          </p>
          <p className="text-white font-semibold text-base mt-0.5">
            {formatDate(session.date)}
          </p>
          {totalVolume > 0 && (
            <p className="text-xs text-zinc-600 mt-0.5">
              Objem: <span className="text-zinc-500 font-medium">{totalVolume.toLocaleString('cs-CZ')} kg</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Delete session */}
          {confirmDeleteSession ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-400">Smazat celý trénink?</span>
              <button
                onClick={handleDeleteSession}
                className="text-xs px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors"
              >
                Ano
              </button>
              <button
                onClick={() => setConfirmDeleteSession(false)}
                className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                Ne
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDeleteSession(true)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-700 hover:text-red-400 hover:bg-red-900/20 transition-colors"
              title="Smazat trénink"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Exercise rows */}
      {filteredEntries.length === 0 ? (
        <p className="px-4 py-3 text-xs text-zinc-600">Žádná data</p>
      ) : (
        <ul className="divide-y divide-zinc-800/40">
          {filteredEntries.map((entry) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              exercise={exerciseMap[entry.exerciseId]}
              onUpdated={handleEntryUpdated}
              onDeleted={handleEntryDeleted}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
