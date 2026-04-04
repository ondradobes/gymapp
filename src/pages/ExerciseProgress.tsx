import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { getExerciseById, getExerciseHistory } from '../db/queries';
import { computeExerciseStats, recommendNextWeight, WEIGHT_INCREMENTS } from '../utils/progressLogic';
import type { Exercise, ExerciseStats, WeightRecommendation } from '../types';

import ProgressBadge from '../components/progress/ProgressBadge';
import ExerciseStatsCard from '../components/progress/ExerciseStatsCard';
import WeightRecommendationCard from '../components/progress/WeightRecommendation';
import SessionHistoryTable from '../components/progress/SessionHistoryTable';
import ProgressChart from '../components/ProgressChart';

export default function ExerciseProgress() {
  const { exerciseId: rawId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [stats, setStats] = useState<ExerciseStats | null>(null);
  const [recommendation, setRecommendation] = useState<WeightRecommendation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = rawId ? parseInt(rawId, 10) : NaN;
    if (isNaN(id)) { navigate('/'); return; }

    async function load() {
      const [ex, history] = await Promise.all([
        getExerciseById(id),
        getExerciseHistory(id),
      ]);

      if (!ex) { navigate('/'); return; }

      setExercise(ex);
      const computed = computeExerciseStats(history);
      setStats(computed);
      // Use standard increment by default; could be made configurable per exercise later
      setRecommendation(
        recommendNextWeight(history, 12, WEIGHT_INCREMENTS.standard),
      );
      setLoading(false);
    }

    load();
  }, [rawId, navigate]);

  if (loading || !exercise || !stats) {
    return (
      <div className="min-h-svh bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Chart data — oldest first (already sorted that way in history)
  const chartData = stats.history.map((e) => ({ date: e.date, weight: e.weight }));

  return (
    <div className="min-h-svh bg-[#0f0f0f] flex flex-col">
      {/* Header */}
      <header className="px-5 pt-8 pb-5 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-0.5">Progres cviku</p>
          <h1 className="text-xl font-bold text-white leading-tight truncate">{exercise.name}</h1>
        </div>
        <ProgressBadge status={stats.progressStatus} size="sm" />
      </header>

      <main className="flex-1 px-5 pb-10 flex flex-col gap-5">

        {/* No data empty state */}
        {stats.history.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <svg className="w-7 h-7 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <div>
              <p className="text-zinc-300 font-semibold">Žádná data ještě</p>
              <p className="text-zinc-500 text-sm mt-1">
                Zaloguj první trénink a zde se zobrazí tvůj progres.
              </p>
            </div>
          </div>
        )}

        {stats.history.length > 0 && (
          <>
            {/* Weight recommendation — most important, highest up */}
            {recommendation && (
              <WeightRecommendationCard
                recommendation={recommendation}
                lastEntry={stats.lastEntry}
              />
            )}

            {/* Stats grid */}
            <section>
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Statistiky</p>
              <ExerciseStatsCard stats={stats} />
            </section>

            {/* Chart */}
            {chartData.length >= 2 && (
              <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Vývoj váhy v čase</p>
                <ProgressChart data={chartData} exerciseName={exercise.name} />
              </section>
            )}

            {/* History table */}
            <section>
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">
                Poslední záznamy
              </p>
              <SessionHistoryTable history={stats.history} limit={10} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
