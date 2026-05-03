import type { PeriodOption } from '../../types';

interface Props {
  value: PeriodOption;
  onChange: (p: PeriodOption) => void;
}

const OPTIONS: { value: PeriodOption; label: string }[] = [
  { value: '7d', label: '7 dní' },
  { value: '30d', label: '30 dní' },
  { value: '90d', label: '90 dní' },
  { value: 'all', label: 'Vše' },
];

export default function PeriodSelector({ value, onChange }: Props) {
  return (
    <div className="flex gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            value === opt.value
              ? 'bg-violet-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
