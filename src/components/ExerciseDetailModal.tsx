import { useEffect, useState } from 'react';
import type { LibraryExercise } from '../data/exerciseLibrary';

interface Props {
  exercise: LibraryExercise | null;
  onClose: () => void;
}

export default function ExerciseDetailModal({ exercise, onClose }: Props) {
  const [imgError, setImgError] = useState(false);

  // Reset error state when exercise changes
  useEffect(() => {
    setImgError(false);
  }, [exercise?.id]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (exercise) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [exercise]);

  if (!exercise) return null;

  const hasImage = exercise.imageUrl && !imgError;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-zinc-950 rounded-t-3xl border-t border-zinc-800 max-h-[90svh] flex flex-col">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-zinc-700" />
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 pb-8">
          {/* Image area */}
          <div className="relative w-full bg-zinc-900 overflow-hidden flex items-center justify-center min-h-48">
            {hasImage ? (
              <img
                src={exercise.imageUrl!}
                alt={exercise.englishName}
                className="w-full max-h-72 object-contain bg-zinc-900"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 py-12 text-zinc-600">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">Obrázek nedostupný</span>
              </div>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-5 pt-5">
            <p className="text-xs text-violet-400 font-semibold uppercase tracking-widest mb-1">
              {exercise.primaryMuscle}
            </p>
            <h2 className="text-2xl font-bold text-white mb-1">{exercise.name}</h2>
            <p className="text-xs text-zinc-600 mb-4">{exercise.englishName}</p>

            <p className="text-zinc-300 text-sm leading-relaxed mb-5">
              {exercise.description}
            </p>

            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">
                Tipy pro správnou techniku
              </p>
              <ul className="flex flex-col gap-2.5">
                {exercise.tips.map((tip, i) => (
                  <li key={i} className="flex gap-3 text-sm text-zinc-300">
                    <span className="text-violet-500 font-bold shrink-0 mt-0.5">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
