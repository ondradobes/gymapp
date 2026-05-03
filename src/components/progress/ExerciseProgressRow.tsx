import { useState } from 'react';
import type { ExerciseWithStats, ProgressStatus, TrendStatus } from '../../types';
import ProgressBadge from './ProgressBadge';
import ExerciseDetailPanel from './ExerciseDetailPanel';

interface Props {
  data: ExerciseWithStats;
}

// Map TrendStatus → ProgressStatus for ProgressBadge reuse
const TREND_TO_STATUS: Record<TrendStatus, ProgressStatus> = {
  growing: 'progress',
  stagnating: 'stagnation',
  declining: 'decline',
  insufficient_data: 'insufficient_data',
};

const TREND_DOT: Record<TrendStatus, string> = {
  growing: 'bg-emerald-400',
  declining: 'bg-red-400',
  stagnating: 'bg-amber-400',
  insufficient_data: 'bg-zinc-600',
};

export default function ExerciseProgressRow({ data }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { exercise, lastWeight, bestWeight, changePercent, trend, lastDate } = data;

  const status = TREND_TO_STATUS[trend];

  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full px-4 py-4 flex items-center gap-3 hover:bg-zinc-800/50 transition-colors active:bg-zinc-800 text-left"
      >
        {/* Trend dot */}
        <div className={`w-2 h-2 rounded-full shrink-0 ${TREND_DOT[trend]}`} />

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <p className="text-zinc-100 font-semibold text-sm truncate">{exercise.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {lastWeight != null && (
              <span className="text-zinc-400 text-xs">{lastWeight} kg</span>
            )}
            {bestWeight != null && bestWeight !== lastWeight && (
              <>
                <span className="text-zinc-700 text-xs">·</span>
                <span className="text-zinc-600 text-xs">max {bestWeight} kg</span>
              </>
            )}
            {lastDate && (
              <>
                <span className="text-zinc-700 text-xs">·</span>
                <span className="text-zinc-600 text-xs">
                  {new Date(lastDate).toLocaleDateString('cs-CZ', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Change % + badge */}
        <div className="shrink-0 text-right">
          {changePercent !== null && (
            <span
              className={`text-sm font-bold ${
                changePercent > 0
                  ? 'text-emerald-400'
                  : changePercent < 0
                    ? 'text-red-400'
                    : 'text-zinc-500'
              }`}
            >
              {changePercent > 0 ? '+' : ''}
              {changePercent}%
            </span>
          )}
          <div className="mt-1">
            <ProgressBadge status={status} size="sm" />
          </div>
        </div>

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-zinc-600 shrink-0 transition-transform duration-200 ${
            expanded ? 'rotate-90' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-zinc-800">
          <ExerciseDetailPanel data={data} />
        </div>
      )}
    </div>
  );
}
