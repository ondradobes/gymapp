import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import type { PeriodOption, ExerciseWithStats } from '../types';
import { getAllExercisesWithHistory, getAllSessionDates } from '../db/queries';
import { buildExerciseWithStats, generateInsights } from '../utils/progressLogic';
import PeriodSelector from '../components/progress/PeriodSelector';
import OverviewStats from '../components/progress/OverviewStats';
import ExerciseProgressRow from '../components/progress/ExerciseProgressRow';
import InsightsSection from '../components/progress/InsightsSection';
import ExerciseSummaryChart from '../components/progress/ExerciseSummaryChart';

function periodToDays(p: PeriodOption): number | null {
  if (p === '7d') return 7;
  if (p === '30d') return 30;
  if (p === '90d') return 90;
  return null;
}

const TREND_ORDER = { declining: 0, stagnating: 1, growing: 2, insufficient_data: 3 } as const;

export default function Progress() {
  const [period, setPeriod] = useState<PeriodOption>('30d');
  const [rawData, setRawData] = useState<
    Array<{ exercise: ExerciseWithStats['exercise']; history: ExerciseWithStats['history'] }>
  >([]);
  const [allSessionDates, setAllSessionDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [data, dates] = await Promise.all([
        getAllExercisesWithHistory(),
        getAllSessionDates(),
      ]);
      setRawData(data);
      setAllSessionDates(dates);
      setLoading(false);
    }
    load();
  }, []);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const periodDays = periodToDays(period);

  const exercisesWithStats: ExerciseWithStats[] = useMemo(
    () =>
      rawData.map(({ exercise, history }) =>
        buildExerciseWithStats(exercise, history, periodDays, today),
      ),
    [rawData, periodDays, today],
  );

  const periodSessionCount = useMemo(() => {
    if (periodDays === null) return allSessionDates.length;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - periodDays);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return allSessionDates.filter((d) => d >= cutoffStr).length;
  }, [allSessionDates, periodDays]);

  const sessionSubLabel =
    periodDays === null ? 'celkem odcvičeno' : 'odcvičeno za období';

  const totalCurrentVolume = exercisesWithStats.reduce((s, e) => s + e.periodVolume, 0);
  const totalPrevVolume = exercisesWithStats.reduce((s, e) => s + e.prevPeriodVolume, 0);
  const volumeChangePercent =
    periodDays !== null && totalPrevVolume > 0
      ? Math.round(((totalCurrentVolume - totalPrevVolume) / totalPrevVolume) * 100)
      : null;

  const growingCount = exercisesWithStats.filter((e) => e.trend === 'growing').length;
  const stagnatingCount = exercisesWithStats.filter((e) => e.trend === 'stagnating').length;
  const decliningCount = exercisesWithStats.filter((e) => e.trend === 'declining').length;

  const insights = useMemo(() => generateInsights(exercisesWithStats), [exercisesWithStats]);

  // Declining first, then stagnating, growing, insufficient_data
  const sortedExercises = useMemo(
    () => [...exercisesWithStats].sort((a, b) => TREND_ORDER[a.trend] - TREND_ORDER[b.trend]),
    [exercisesWithStats],
  );

  return (
    <div className="min-h-svh bg-[#0f0f0f] flex flex-col">
      <header className="px-5 pt-10 pb-6 flex items-center gap-3">
        <Link
          to="/"
          className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Progress</h1>
          <p className="text-zinc-400 text-sm">Sleduj svůj pokrok v čase</p>
        </div>
      </header>

      <main className="flex-1 px-5 pb-10 flex flex-col gap-5">
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <p className="text-zinc-500 text-sm">Načítám data…</p>
          </div>
        ) : rawData.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <PeriodSelector value={period} onChange={setPeriod} />

            <OverviewStats
              sessionCount={periodSessionCount}
              sessionSubLabel={sessionSubLabel}
              activeExercises={exercisesWithStats.length}
              totalVolume={totalCurrentVolume}
              volumeChangePercent={volumeChangePercent}
              growingCount={growingCount}
              stagnatingCount={stagnatingCount}
              decliningCount={decliningCount}
            />

            <ExerciseSummaryChart exercises={exercisesWithStats} />

            {insights.length > 0 && <InsightsSection insights={insights} />}

            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3">
                Přehled cviků
              </p>
              <div className="flex flex-col gap-2">
                {sortedExercises.map((data) => (
                  <ExerciseProgressRow key={data.exercise.id} data={data} />
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
      <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-zinc-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
          />
        </svg>
      </div>
      <h2 className="text-white font-semibold text-lg mb-2">Zatím žádná data</h2>
      <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
        Zatím tu není dost dat pro vyhodnocení progresu. Odcvič několik tréninků a tady uvidíš,
        jak se postupně zlepšuješ.
      </p>
      <Link
        to="/"
        className="mt-6 px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-500 transition-colors active:bg-violet-700"
      >
        Jít na trénink
      </Link>
    </div>
  );
}
