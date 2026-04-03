import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ExerciseProgress } from '../types';

interface Props {
  data: ExerciseProgress[];
  exerciseName: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()}.${d.getMonth() + 1}.`;
}

export default function ProgressChart({ data, exerciseName }: Props) {
  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center h-32 text-zinc-500 text-sm">
        {data.length === 0
          ? 'Žádná data pro zobrazení grafu'
          : 'Potřeba alespoň 2 záznamy pro graf'}
      </div>
    );
  }

  const chartData = data.map((p) => ({ ...p, date: formatDate(p.date) }));

  return (
    <div className="mt-4">
      <p className="text-xs text-zinc-500 mb-3 uppercase tracking-widest">
        Progres — {exerciseName}
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#71717a', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#71717a', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              background: '#18181b',
              border: '1px solid #3f3f46',
              borderRadius: 8,
              fontSize: 13,
              color: '#f4f4f5',
            }}
            formatter={(value) => [`${value ?? ''} kg`, 'Váha']}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#7c3aed"
            strokeWidth={2.5}
            dot={{ fill: '#7c3aed', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#a78bfa' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
