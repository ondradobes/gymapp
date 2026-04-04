import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { getAllSessionsWithEntries, getExercises } from '../db/queries';
import type { SessionWithEntries, Exercise, DayOfWeek, SessionEntry } from '../types';
import SessionCard from '../components/SessionCard';

export default function History() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionWithEntries[]>([]);
  const [exerciseMap, setExerciseMap] = useState<Record<number, Exercise>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [all, mon, wed, fri] = await Promise.all([
      getAllSessionsWithEntries(),
      getExercises('monday' as DayOfWeek),
      getExercises('wednesday' as DayOfWeek),
      getExercises('friday' as DayOfWeek),
    ]);
    setSessions(all);

    const map: Record<number, Exercise> = {};
    [...mon, ...wed, ...fri].forEach((ex) => { map[ex.id] = ex; });
    setExerciseMap(map);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleSessionDeleted(sessionId: number) {
    setSessions((prev) => prev.filter((s) => s.session.id !== sessionId));
  }

  function handleEntriesChanged(sessionId: number, entries: SessionEntry[]) {
    setSessions((prev) =>
      prev.map((s) => s.session.id === sessionId ? { ...s, entries } : s),
    );
  }

  return (
    <div className="min-h-svh bg-[#0f0f0f] flex flex-col">
      <header className="px-5 pt-8 pb-5 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-white">Historie tréninků</h1>
      </header>

      <main className="flex-1 px-5 pb-10 flex flex-col gap-4">
        {loading && (
          <div className="text-center py-16 text-zinc-500 text-sm">Načítám…</div>
        )}

        {!loading && sessions.length === 0 && (
          <div className="text-center py-16 text-zinc-500 text-sm">
            Zatím žádné tréninky. Zaloguj první trénink!
          </div>
        )}

        {sessions.map(({ session, entries }) => (
          <SessionCard
            key={session.id}
            session={session}
            entries={entries}
            exerciseMap={exerciseMap}
            onDeleted={handleSessionDeleted}
            onEntriesChanged={handleEntriesChanged}
          />
        ))}
      </main>
    </div>
  );
}
