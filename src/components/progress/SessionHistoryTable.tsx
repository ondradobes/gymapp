import type { ExerciseHistoryEntry } from '../../types';

interface Props {
  history: ExerciseHistoryEntry[];
  /** How many recent sessions to show */
  limit?: number;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' });
}

function trend(current: ExerciseHistoryEntry, previous: ExerciseHistoryEntry | undefined): 'up' | 'down' | 'same' | null {
  if (!previous) return null;
  if (current.estimatedOneRM > previous.estimatedOneRM + 0.5) return 'up';
  if (current.estimatedOneRM < previous.estimatedOneRM - 0.5) return 'down';
  return 'same';
}

const TREND_ICON: Record<'up' | 'down' | 'same', { icon: string; color: string }> = {
  up:   { icon: '↑', color: 'text-emerald-400' },
  down: { icon: '↓', color: 'text-red-400' },
  same: { icon: '→', color: 'text-zinc-500' },
};

export default function SessionHistoryTable({ history, limit = 10 }: Props) {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500 text-sm">
        Žádné záznamy zatím
      </div>
    );
  }

  // Show the most recent `limit` entries, newest first for display
  const recent = [...history].reverse().slice(0, limit);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-4 py-2.5 border-b border-zinc-800">
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Datum</span>
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest text-right">Váha</span>
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest text-right">Reps</span>
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest text-right">1RM</span>
      </div>

      {/* Rows */}
      {recent.map((entry, i) => {
        // Compare with the chronologically previous entry (which is next in reversed array)
        const prevInHistory = history[history.length - 1 - i - 1];
        const t = trend(entry, prevInHistory);

        return (
          <div
            key={`${entry.sessionId}-${i}`}
            className={`grid grid-cols-[1fr_auto_auto_auto] gap-2 px-4 py-3 text-sm border-b border-zinc-800/50 last:border-0 ${
              i === 0 ? 'bg-zinc-800/30' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-zinc-300">{formatDate(entry.date)}</span>
              {i === 0 && (
                <span className="text-[9px] text-violet-400 font-semibold uppercase tracking-widest">
                  poslední
                </span>
              )}
            </div>
            <span className="text-white font-medium text-right tabular-nums">
              {entry.weight} kg
            </span>
            <span className="text-zinc-400 text-right tabular-nums">
              {entry.reps}× {entry.sets > 1 ? `(${entry.sets} s.)` : ''}
            </span>
            <div className="flex items-center justify-end gap-1">
              <span className="text-zinc-500 tabular-nums text-xs">{entry.estimatedOneRM}</span>
              {t && (
                <span className={`text-xs font-bold ${TREND_ICON[t].color}`}>
                  {TREND_ICON[t].icon}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
