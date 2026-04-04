import type { ExerciseHistoryEntry, WeightRecommendation as WeightRecommendationType } from '../../types';

interface Props {
  recommendation: WeightRecommendationType;
  lastEntry: ExerciseHistoryEntry | null;
}

export default function WeightRecommendation({ recommendation, lastEntry }: Props) {
  const { suggestedWeight, reason } = recommendation;

  if (!lastEntry) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Doporučení</p>
        <p className="text-zinc-400 text-sm">Zatím žádná data. Zaloguj první trénink.</p>
      </div>
    );
  }

  const changed = suggestedWeight !== lastEntry.weight;
  const increased = suggestedWeight > lastEntry.weight;

  return (
    <div className={`rounded-2xl p-4 border ${
      increased
        ? 'bg-emerald-500/10 border-emerald-500/30'
        : changed
        ? 'bg-amber-500/10 border-amber-500/30'
        : 'bg-zinc-900 border-zinc-800'
    }`}>
      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3">Doporučení na příště</p>

      <div className="flex items-end gap-3 mb-3">
        {/* Last workout reference */}
        <div>
          <p className="text-xs text-zinc-500 mb-0.5">Minule</p>
          <p className="text-zinc-400 font-semibold">
            {lastEntry.weight} kg × {lastEntry.reps}
          </p>
        </div>

        <svg className="w-4 h-4 text-zinc-600 mb-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>

        {/* Recommendation */}
        <div>
          <p className="text-xs text-zinc-500 mb-0.5">Zkus</p>
          <p className={`text-xl font-bold ${increased ? 'text-emerald-400' : changed ? 'text-amber-400' : 'text-white'}`}>
            {suggestedWeight > 0 ? `${suggestedWeight} kg` : '—'}
          </p>
        </div>
      </div>

      <p className="text-xs text-zinc-400 leading-relaxed">{reason}</p>
    </div>
  );
}
