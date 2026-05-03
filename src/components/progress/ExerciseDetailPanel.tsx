import { Link } from 'react-router';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ExerciseWithStats } from '../../types';

interface Props {
  data: ExerciseWithStats;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()}.${d.getMonth() + 1}.`;
}

export default function ExerciseDetailPanel({ data }: Props) {
  const { exercise, periodHistory, history } = data;

  // Use period history for chart if it has enough points, else fall back to all history
  const sourceHistory = periodHistory.length >= 2 ? periodHistory : history;

  // Deduplicate by date — keep the entry with the highest estimated 1RM per day
  const byDate = new Map<string, (typeof sourceHistory)[0]>();
  sourceHistory.forEach((e) => {
    const existing = byDate.get(e.date);
    if (!existing || e.estimatedOneRM > existing.estimatedOneRM) {
      byDate.set(e.date, e);
    }
  });
  const chartData = Array.from(byDate.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({ date: formatDate(e.date), weight: e.weight }));

  const { changePercent } = data;

  const lastEntry = history[history.length - 1] ?? null;
  const bestEntry = history.reduce<(typeof history)[0] | null>(
    (best, e) => (!best || e.weight > best.weight ? e : best),
    null,
  );

  // Unique sessions among the last 3 history entries for a stable average
  const recentSessions = history.slice(-3);
  const recentAvg =
    recentSessions.length >= 2
      ? Math.round(
          (recentSessions.reduce((s, e) => s + e.weight, 0) / recentSessions.length) * 10,
        ) / 10
      : null;

  return (
    <div className="px-4 pb-4 pt-3">
      {/* Chart */}
      {chartData.length >= 2 ? (
        <div className="mb-4">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">
            Váha v čase
          </p>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#71717a', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#71717a', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  background: '#18181b',
                  border: '1px solid #3f3f46',
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#f4f4f5',
                }}
                formatter={(v) => [`${v} kg`, 'Váha']}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#7c3aed"
                strokeWidth={2}
                dot={{ fill: '#7c3aed', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#a78bfa' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-zinc-600 text-xs text-center py-4">
          Nedostatek dat pro graf ve zvoleném období
        </p>
      )}

      {/* Key stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Poslední</p>
          <p className="text-white font-bold text-sm">
            {lastEntry != null ? `${lastEntry.weight} kg` : '—'}
          </p>
          {lastEntry && (
            <p className="text-zinc-500 text-[10px] mt-0.5">
              {lastEntry.reps} op · {lastEntry.sets} sérií
            </p>
          )}
        </div>

        <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Maximum</p>
          <p className="text-white font-bold text-sm">
            {bestEntry != null ? `${bestEntry.weight} kg` : '—'}
          </p>
        </div>

        <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Za období</p>
          <p
            className={`font-bold text-sm ${
              changePercent !== null && changePercent > 0
                ? 'text-emerald-400'
                : changePercent !== null && changePercent < 0
                  ? 'text-red-400'
                  : 'text-zinc-400'
            }`}
          >
            {changePercent !== null
              ? `${changePercent > 0 ? '+' : ''}${changePercent}%`
              : '—'}
          </p>
        </div>
      </div>

      {recentAvg !== null && (
        <p className="text-xs text-zinc-500 mb-3">
          Průměr posledních 3 tréninků:{' '}
          <span className="text-zinc-300 font-medium">{recentAvg} kg</span>
        </p>
      )}

      <Link
        to={`/exercise/${exercise.id}/progress`}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-sm font-medium hover:bg-zinc-700 transition-colors active:bg-zinc-700"
      >
        Zobrazit plný detail
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
