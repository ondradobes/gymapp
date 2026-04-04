import type { ProgressStatus } from '../../types';

interface Props {
  status: ProgressStatus;
  size?: 'sm' | 'md';
}

const CONFIG: Record<ProgressStatus, { label: string; classes: string; icon: string }> = {
  progress: {
    label: 'Progres',
    icon: '↑',
    classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  same: {
    label: 'Stejné',
    icon: '→',
    classes: 'bg-zinc-700/50 text-zinc-400 border-zinc-600/30',
  },
  stagnation: {
    label: 'Stagnace',
    icon: '⏸',
    classes: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  decline: {
    label: 'Pokles',
    icon: '↓',
    classes: 'bg-red-500/15 text-red-400 border-red-500/30',
  },
  insufficient_data: {
    label: 'Málo dat',
    icon: '·',
    classes: 'bg-zinc-800/50 text-zinc-500 border-zinc-700/30',
  },
};

export default function ProgressBadge({ status, size = 'md' }: Props) {
  const { label, icon, classes } = CONFIG[status];
  const sizeClasses = size === 'sm'
    ? 'text-[10px] px-2 py-0.5 gap-1'
    : 'text-xs px-3 py-1 gap-1.5';

  return (
    <span className={`inline-flex items-center font-semibold rounded-full border ${classes} ${sizeClasses}`}>
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
}
