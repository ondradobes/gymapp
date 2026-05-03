import type { ProgressInsight } from '../../types';

interface Props {
  insights: ProgressInsight[];
}

const BORDER: Record<ProgressInsight['type'], string> = {
  positive: 'border-l-emerald-500',
  warning: 'border-l-amber-500',
  neutral: 'border-l-zinc-600',
};

const ICON: Record<ProgressInsight['type'], string> = {
  positive: '✦',
  warning: '⚠',
  neutral: '→',
};

const ICON_COLOR: Record<ProgressInsight['type'], string> = {
  positive: 'text-emerald-400',
  warning: 'text-amber-400',
  neutral: 'text-zinc-500',
};

export default function InsightsSection({ insights }: Props) {
  if (insights.length === 0) return null;

  return (
    <div>
      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3">
        Insights & doporučení
      </p>
      <div className="flex flex-col gap-2">
        {insights.map((insight, i) => (
          <div
            key={i}
            className={`rounded-xl bg-zinc-900 border border-zinc-800 border-l-2 ${BORDER[insight.type]} px-4 py-3`}
          >
            <div className="flex items-start gap-2.5">
              <span className={`shrink-0 text-xs mt-0.5 ${ICON_COLOR[insight.type]}`}>
                {ICON[insight.type]}
              </span>
              <p className="text-sm text-zinc-300 leading-relaxed">{insight.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
