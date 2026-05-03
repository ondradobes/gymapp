interface Props {
  sessionCount: number;
  sessionSubLabel: string;
  activeExercises: number;
  totalVolume: number;
  volumeChangePercent: number | null;
  growingCount: number;
  stagnatingCount: number;
  decliningCount: number;
}

function formatVolume(vol: number): string {
  if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(1)}M`;
  if (vol >= 1_000) return `${(vol / 1_000).toFixed(1)}k`;
  return vol.toFixed(0);
}

export default function OverviewStats({
  sessionCount,
  sessionSubLabel,
  activeExercises,
  totalVolume,
  volumeChangePercent,
  growingCount,
  stagnatingCount,
  decliningCount,
}: Props) {
  const hasStatusData = growingCount > 0 || stagnatingCount > 0 || decliningCount > 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Tréninky</p>
        <p className="text-3xl font-bold text-white">{sessionCount}</p>
        <p className="text-xs text-zinc-500 mt-1">{sessionSubLabel}</p>
      </div>

      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Aktivní cviky</p>
        <p className="text-3xl font-bold text-white">{activeExercises}</p>
        <p className="text-xs text-zinc-500 mt-1">se zaznamenanou historií</p>
      </div>

      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Objem</p>
        <p className="text-3xl font-bold text-white whitespace-nowrap">
          {formatVolume(totalVolume)}{' '}
          <span className="text-xl font-semibold">kg</span>
        </p>
        {volumeChangePercent !== null ? (
          <p
            className={`text-xs mt-1 font-medium ${
              volumeChangePercent > 0
                ? 'text-emerald-400'
                : volumeChangePercent < 0
                  ? 'text-red-400'
                  : 'text-zinc-500'
            }`}
          >
            {volumeChangePercent > 0 ? '+' : ''}
            {volumeChangePercent}% vs předchozí období
          </p>
        ) : (
          <p className="text-xs text-zinc-500 mt-1">za vybrané období</p>
        )}
      </div>

      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Status cviků</p>
        {hasStatusData ? (
          <div className="flex flex-col gap-1.5">
            {growingCount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 text-xs">↑ Roste</span>
                <span className="text-emerald-400 text-xs font-bold">{growingCount}</span>
              </div>
            )}
            {stagnatingCount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-amber-400 text-xs">⏸ Stagnuje</span>
                <span className="text-amber-400 text-xs font-bold">{stagnatingCount}</span>
              </div>
            )}
            {decliningCount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-red-400 text-xs">↓ Klesá</span>
                <span className="text-red-400 text-xs font-bold">{decliningCount}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-zinc-600 text-xs">Málo dat pro hodnocení</p>
        )}
      </div>
    </div>
  );
}
