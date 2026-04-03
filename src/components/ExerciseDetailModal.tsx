import { useEffect, useState } from 'react';
import type { LibraryExercise } from '../data/exerciseLibrary';

interface WikiSummary {
  imageUrl: string | null;
  loaded: boolean;
}

async function fetchWikiImage(slug: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(slug)}`,
      { headers: { Accept: 'application/json' } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { thumbnail?: { source?: string } };
    return data.thumbnail?.source ?? null;
  } catch {
    return null;
  }
}

interface Props {
  exercise: LibraryExercise | null;
  onClose: () => void;
}

export default function ExerciseDetailModal({ exercise, onClose }: Props) {
  const [wiki, setWiki] = useState<WikiSummary>({ imageUrl: null, loaded: false });

  useEffect(() => {
    if (!exercise) return;
    setWiki({ imageUrl: null, loaded: false });
    fetchWikiImage(exercise.wikiSlug).then((url) => {
      setWiki({ imageUrl: url, loaded: true });
    });
  }, [exercise?.wikiSlug]);

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
        <div className="overflow-y-auto flex-1 pb-safe">
          {/* Image */}
          <div className="relative w-full bg-zinc-900 min-h-48 flex items-center justify-center overflow-hidden">
            {!wiki.loaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {wiki.loaded && wiki.imageUrl && (
              <img
                src={wiki.imageUrl}
                alt={exercise.englishName}
                className="w-full max-h-72 object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            {wiki.loaded && !wiki.imageUrl && (
              <div className="flex flex-col items-center gap-2 py-10 text-zinc-600">
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
          <div className="px-5 pt-5 pb-8">
            {/* Header */}
            <p className="text-xs text-violet-400 font-semibold uppercase tracking-widest mb-1">
              {exercise.primaryMuscle}
            </p>
            <h2 className="text-2xl font-bold text-white mb-1">{exercise.name}</h2>
            <p className="text-xs text-zinc-600 mb-4">{exercise.englishName}</p>

            {/* Description */}
            <p className="text-zinc-300 text-sm leading-relaxed mb-5">
              {exercise.description}
            </p>

            {/* Tips */}
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
