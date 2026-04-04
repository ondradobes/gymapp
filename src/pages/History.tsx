import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { getAllSessionsWithEntries, getExercises } from '../db/queries';
import type { SessionWithEntries, Exercise, DayOfWeek } from '../types';

const DAY_NAMES: Record<DayOfWeek, string> = {
  monday: 'Nohy',
  wednesday: 'Hruď & Ramena',
  friday: 'Záda, Biceps & Triceps',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
}

function calcVolume(entries: import('../types').SessionEntry[]): number {
  return entries.reduce((sum, e) => {
    if (e.weight == null || e.reps == null) return sum;
    return sum + e.weight * e.reps * (e.sets ?? 1);
  }, 0);
}

export default function History() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionWithEntries[]>([]);
  const [exerciseMap, setExerciseMap] = useState<Record<number, Exercise>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [all, mon, wed, fri] = await Promise.all([
        getAllSessionsWithEntries(),
        getExercises('monday'),
        getExercises('wednesday'),
        getExercises('friday'),
      ]);
      setSessions(all);

      const map: Record<number, Exercise> = {};
      [...mon, ...wed, ...fri].forEach((ex) => { map[ex.id] = ex; });
      setExerciseMap(map);
      setLoading(false);
    }
    load();
  }, []);

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

        {sessions.map(({ session, entries }) => {
          const filteredEntries = entries.filter((e) => e.weight != null);
          const totalVolume = calcVolume(filteredEntries);
          return (
            <div key={session.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
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
                <button
                  onClick={() => navigate(`/day/${session.trainingDayId}`)}
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors px-2 py-1"
                >
                  Logovat →
                </button>
              </div>

              {/* Exercise rows */}
              {filteredEntries.length === 0 ? (
                <p className="px-4 py-3 text-xs text-zinc-600">Žádná data</p>
              ) : (
                <ul className="divide-y divide-zinc-800/40">
                  {filteredEntries.map((entry) => {
                    const ex = exerciseMap[entry.exerciseId];
                    if (!ex) return null;
                    return (
                      <li key={entry.id} className="flex items-center justify-between px-4 py-3 text-sm group">
                        <Link
                          to={`/exercise/${ex.id}/progress`}
                          className="text-zinc-300 hover:text-violet-400 transition-colors truncate flex-1 min-w-0 mr-3"
                        >
                          {ex.name}
                        </Link>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-zinc-200 font-medium tabular-nums">
                            {entry.weight} kg
                            {entry.sets != null && entry.reps != null && (
                              <span className="text-zinc-500 font-normal ml-1.5">
                                {entry.sets}×{entry.reps}
                              </span>
                            )}
                          </span>
                          <Link
                            to={`/exercise/${ex.id}/progress`}
                            className="text-[10px] text-zinc-600 hover:text-violet-400 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            Graf →
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}
