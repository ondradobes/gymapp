import type { ExerciseStats } from '../../types';

interface StatItemProps {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}

function StatItem({ label, value, sub, highlight }: StatItemProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-xl font-bold leading-tight ${highlight ? 'text-violet-400' : 'text-white'}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
  );
}

interface Props {
  stats: ExerciseStats;
}

export default function ExerciseStatsCard({ stats }: Props) {
  const { lastEntry, personalRecord, maxWeight, totalSets, estimated1RM } = stats;

  const lastLabel = lastEntry
    ? `${lastEntry.weight} kg × ${lastEntry.reps}`
    : '—';
  const lastSub = lastEntry ? lastEntry.date : undefined;

  const prLabel = personalRecord
    ? `${personalRecord.weight} kg × ${personalRecord.reps}`
    : '—';
  const prSub = personalRecord ? `est. 1RM: ${personalRecord.estimatedOneRM} kg` : undefined;

  const oneRMLabel = estimated1RM ? `${estimated1RM} kg` : '—';
  const maxWeightLabel = maxWeight ? `${maxWeight} kg` : '—';

  return (
    <div className="grid grid-cols-2 gap-2.5">
      <StatItem
        label="Poslední trénink"
        value={lastLabel}
        sub={lastSub}
      />
      <StatItem
        label="Osobní rekord (1RM)"
        value={prLabel}
        sub={prSub}
        highlight
      />
      <StatItem
        label="Max váha"
        value={maxWeightLabel}
      />
      <StatItem
        label="Est. 1RM"
        value={oneRMLabel}
        sub="Epley formula"
      />
      <StatItem
        label="Celkem sérií"
        value={String(totalSets)}
        sub="přes všechny tréninky"
      />
      <StatItem
        label="Počet tréninků"
        value={String(stats.history.length)}
      />
    </div>
  );
}
