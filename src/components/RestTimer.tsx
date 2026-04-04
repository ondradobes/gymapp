import { useState, useEffect, useRef, useCallback } from 'react';

const PRESETS = [60, 90, 120, 180] as const;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function RestTimer() {
  const [isOpen, setIsOpen] = useState(false);
  const [duration, setDuration] = useState(90);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setRemaining(null);
  }, []);

  const start = useCallback((secs: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRemaining(secs);
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(intervalRef.current!);
          setRunning(false);
          // Vibrate if supported
          if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const progress = remaining !== null ? remaining / duration : 1;
  const isDone = remaining === 0;
  const isActive = running || isDone;

  // Floating button (always visible, compact)
  return (
    <>
      {/* Floating timer button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={`fixed bottom-6 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl transition-all active:scale-95 ${
          isActive
            ? isDone
              ? 'bg-emerald-600 text-white'
              : 'bg-violet-600 text-white'
            : 'bg-zinc-800 border border-zinc-700 text-zinc-300'
        }`}
      >
        {/* Timer icon */}
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm font-bold tabular-nums">
          {remaining !== null ? formatTime(remaining) : 'Pauza'}
        </span>
      </button>

      {/* Expanded panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-5 z-50 w-64 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-4">
          {/* Close */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Pauza</p>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Circular progress + time display */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
                {/* Track */}
                <circle cx="56" cy="56" r="48" fill="none" stroke="#27272a" strokeWidth="8" />
                {/* Progress */}
                <circle
                  cx="56" cy="56" r="48" fill="none"
                  stroke={isDone ? '#10b981' : '#7c3aed'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 48}`}
                  strokeDashoffset={`${2 * Math.PI * 48 * (1 - progress)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold tabular-nums ${isDone ? 'text-emerald-400' : 'text-white'}`}>
                  {remaining !== null ? formatTime(remaining) : formatTime(duration)}
                </span>
              </div>
            </div>
            {isDone && (
              <p className="text-emerald-400 text-xs font-semibold mt-2 animate-pulse">Čas jít!</p>
            )}
          </div>

          {/* Preset buttons */}
          <div className="grid grid-cols-4 gap-1.5 mb-3">
            {PRESETS.map((s) => (
              <button
                key={s}
                onClick={() => { setDuration(s); start(s); }}
                className={`py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  duration === s && running
                    ? 'bg-violet-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                {s < 60 ? `${s}s` : `${s / 60}m`}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <button
              onClick={() => (running ? stop() : start(duration))}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                running
                  ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                  : 'bg-violet-600 text-white hover:bg-violet-500'
              }`}
            >
              {running ? 'Pauza' : remaining !== null ? 'Pokračovat' : 'Start'}
            </button>
            {remaining !== null && (
              <button
                onClick={stop}
                className="px-3 py-2.5 rounded-xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors text-sm"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
