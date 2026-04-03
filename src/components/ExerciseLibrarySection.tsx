import { useState } from 'react';
import { EXERCISE_LIBRARY, type LibraryExercise } from '../data/exerciseLibrary';
import type { DayOfWeek } from '../types';
import ExerciseDetailModal from './ExerciseDetailModal';

interface Props {
  dayId: DayOfWeek;
}

export default function ExerciseLibrarySection({ dayId }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<LibraryExercise | null>(null);

  const exercises = EXERCISE_LIBRARY[dayId] ?? [];

  return (
    <>
      {/* Section toggle */}
      <div className="mt-2">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between py-3.5 px-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:border-zinc-600 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-zinc-300 text-sm font-medium">Inspirace — databáze cviků</span>
          </div>
          <svg
            className={`w-4 h-4 text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {exercises.map((ex) => (
              <button
                key={ex.id}
                onClick={() => setSelected(ex)}
                className="text-left bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 hover:border-violet-700 active:scale-[0.97] transition-all"
              >
                <p className="text-[10px] text-violet-400 uppercase tracking-widest font-semibold mb-1.5 leading-tight line-clamp-2">
                  {ex.primaryMuscle.split('·')[0].trim()}
                </p>
                <p className="text-white text-sm font-semibold leading-snug mb-1">
                  {ex.name}
                </p>
                <p className="text-zinc-600 text-[10px]">{ex.englishName}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <ExerciseDetailModal exercise={selected} onClose={() => setSelected(null)} />
    </>
  );
}
