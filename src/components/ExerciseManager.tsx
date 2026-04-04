import { useState } from 'react';
import { addExercise, toggleExerciseVisibility } from '../db/queries';
import type { DayOfWeek, Exercise } from '../types';

interface Props {
  dayId: DayOfWeek;
  exercises: Exercise[];
  onUpdate: () => void;
}

export default function ExerciseManager({ dayId, exercises, onUpdate }: Props) {
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<number | null>(null);

  async function handleAdd() {
    const name = newName.trim();
    if (!name || saving) return;
    setSaving(true);
    await addExercise(dayId, name);
    setNewName('');
    setAdding(false);
    setSaving(false);
    onUpdate();
  }

  async function handleToggle(exerciseId: number) {
    if (toggling !== null) return;
    setToggling(exerciseId);
    await toggleExerciseVisibility(exerciseId);
    setToggling(null);
    onUpdate();
  }


  return (
    <div className="mt-6 border-t border-zinc-800 pt-5">
      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Správa cviků</p>

      <ul className="flex flex-col gap-2 mb-4">
        {exercises.map((ex) => (
          <li key={ex.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-800">
            <span className={`text-sm font-medium ${ex.isHidden ? 'text-zinc-600 line-through' : 'text-zinc-200'}`}>
              {ex.name}
            </span>
            <button
              onClick={() => handleToggle(ex.id)}
              className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                ex.isHidden
                  ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {ex.isHidden ? 'Zobrazit' : 'Skrýt'}
            </button>
          </li>
        ))}
      </ul>

      {adding ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false); }}
            placeholder="Název cviku"
            autoFocus
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
          />
          <button
            onClick={handleAdd}
            disabled={saving}
            className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60"
          >
            {saving ? '…' : 'Přidat'}
          </button>
          <button
            onClick={() => { setAdding(false); setNewName(''); }}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-sm px-3 py-2.5 rounded-xl transition-colors"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-zinc-700 text-zinc-400 hover:border-violet-500 hover:text-violet-400 transition-colors text-sm"
        >
          <span className="text-lg leading-none">+</span> Přidat cvik
        </button>
      )}
    </div>
  );
}
