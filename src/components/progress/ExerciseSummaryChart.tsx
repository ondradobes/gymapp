import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ExerciseWithStats, SummaryChartDataPoint, SummaryChartSeries } from '../../types';
import { selectTopExercises, buildChartDataset } from '../../utils/progressLogic';

interface Props {
  exercises: ExerciseWithStats[];
}

type ScaleMode = 'log' | 'linear';

const LOG_TICKS = [2.5, 5, 10, 25, 50, 75, 100, 150, 200];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' });
}

interface TooltipPayloadItem {
  dataKey: string;
  color: string;
  value: number;
  payload: SummaryChartDataPoint;
}

interface CustomTooltipProps {
  active?: boolean;
  label?: string;
  payload?: TooltipPayloadItem[];
  series: SummaryChartSeries[];
}

function CustomTooltip({ active, label, payload, series }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0 || !label) return null;

  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-700 p-3 shadow-xl text-xs min-w-[160px]">
      <p className="text-zinc-400 mb-2 font-medium">
        {formatDate(label)}
      </p>
      {payload.map((item) => {
        const s = series.find((s) => s.dataKey === item.dataKey);
        if (!s) return null;
        const weight = item.payload[`${item.dataKey}_weight`] as number | undefined;
        const reps = item.payload[`${item.dataKey}_reps`] as number | undefined;
        const sets = item.payload[`${item.dataKey}_sets`] as number | undefined;
        return (
          <div key={item.dataKey} className="flex flex-col gap-0.5 mb-1.5 last:mb-0">
            <span style={{ color: s.color }} className="font-semibold truncate max-w-[180px]">
              {s.name}
            </span>
            <div className="flex items-center gap-2 text-zinc-300">
              {weight != null && (
                <span>{weight} kg</span>
              )}
              {reps != null && sets != null && (
                <span className="text-zinc-500">
                  {reps} × {sets} série
                </span>
              )}
              <span className="text-zinc-600">e1RM: {item.value.toFixed(1)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ExerciseSummaryChart({ exercises }: Props) {
  const [scaleMode, setScaleMode] = useState<ScaleMode>('log');
  const [showAll, setShowAll] = useState(false);
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());

  const eligibleCount = useMemo(
    () => exercises.filter((e) => e.periodHistory.length >= 2).length,
    [exercises],
  );

  const selectedExercises = useMemo(
    () => (showAll ? exercises.filter((e) => e.periodHistory.length >= 2) : selectTopExercises(exercises, 6)),
    [exercises, showAll],
  );

  const { dataset, series } = useMemo(
    () => buildChartDataset(selectedExercises),
    [selectedExercises],
  );

  const logTicks = useMemo(() => {
    if (scaleMode !== 'log' || dataset.length === 0) return undefined;
    const vals = series.flatMap((s) =>
      dataset.map((d) => d[s.dataKey] as number | undefined).filter((v): v is number => v != null),
    );
    if (vals.length === 0) return undefined;
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    return LOG_TICKS.filter((t) => t >= min * 0.8 && t <= max * 1.2);
  }, [scaleMode, dataset, series]);

  const toggleLine = (dataKey: string) => {
    setHiddenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(dataKey)) next.delete(dataKey);
      else next.add(dataKey);
      return next;
    });
  };

  if (eligibleCount < 2) {
    return (
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3">
          Souhrnný graf cviků
        </p>
        <p className="text-zinc-600 text-xs text-center py-6 leading-relaxed">
          Pro souhrnný graf zatím není dost dat. Zaznamenej alespoň dva tréninky u více cviků.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3">
        Souhrnný graf cviků
      </p>

      {/* Controls row */}
      <div className="flex items-center justify-between mb-4 gap-2">
        {/* Scale toggle */}
        <div className="flex rounded-xl bg-zinc-800 p-0.5 gap-0.5">
          <button
            onClick={() => setScaleMode('log')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              scaleMode === 'log'
                ? 'bg-violet-600 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Chytré
          </button>
          <button
            onClick={() => setScaleMode('linear')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              scaleMode === 'linear'
                ? 'bg-violet-600 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Reálné
          </button>
        </div>

        {/* Top 6 / Vše toggle */}
        {eligibleCount > 6 && (
          <button
            onClick={() => setShowAll((p) => !p)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {showAll ? 'Top 6' : `Vše (${eligibleCount})`}
          </button>
        )}
      </div>

      {/* Scale explanation */}
      <p className="text-[10px] text-zinc-600 mb-3 leading-relaxed">
        {scaleMode === 'log'
          ? 'Chytré měřítko: stejná vzdálenost = stejný % nárůst. Cviky s různou váhou jsou snadno porovnatelné.'
          : 'Reálné měřítko: osa Y v kg. Těžké cviky dominují grafu.'}
      </p>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={dataset} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fill: '#71717a', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            scale={scaleMode}
            domain={scaleMode === 'log' ? ['auto', 'auto'] : ['auto', 'auto']}
            ticks={scaleMode === 'log' ? logTicks : undefined}
            tickFormatter={(v: number) => `${v}`}
            tick={{ fill: '#71717a', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            allowDataOverflow={scaleMode === 'log'}
          />
          <Tooltip
            content={<CustomTooltip series={series} />}
            cursor={{ stroke: '#3f3f46', strokeWidth: 1 }}
          />
          {series.map((s) => (
            <Line
              key={s.dataKey}
              dataKey={s.dataKey}
              name={s.name}
              stroke={s.color}
              strokeWidth={hiddenKeys.has(s.dataKey) ? 0 : 2}
              dot={false}
              activeDot={hiddenKeys.has(s.dataKey) ? false : { r: 4, strokeWidth: 0 }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-2 mt-3">
        {series.map((s) => (
          <button
            key={s.dataKey}
            onClick={() => toggleLine(s.dataKey)}
            className={`flex items-center gap-1.5 transition-opacity ${
              hiddenKeys.has(s.dataKey) ? 'opacity-30' : 'opacity-100'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-[11px] text-zinc-400 max-w-[120px] truncate">
              {s.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
