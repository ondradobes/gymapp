import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
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

        {sessions.map(({ session, entries }) => (
          <div key={session.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest">
                  {DAY_NAMES[session.trainingDayId]}
                </p>
                <p className="text-white font-semibold text-base mt-0.5">
                  {formatDate(session.date)}
                </p>
              </div>
              <button
                onClick={() => navigate(`/day/${session.trainingDayId}`)}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                Otevřít →
              </button>
            </div>

            <ul className="flex flex-col gap-1.5">
              {entries
                .filter((e) => e.weight != null)
                .map((entry) => {
                  const ex = exerciseMap[entry.exerciseId];
                  if (!ex) return null;
                  return (
                    <li key={entry.id} className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">{ex.name}</span>
                      <span className="text-zinc-200 font-medium tabular-nums">
                        {entry.weight} kg
                        {entry.sets && entry.reps && (
                          <span className="text-zinc-500 font-normal ml-2">
                            {entry.sets}×{entry.reps}
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </main>
    </div>
  );
}
