import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import {
  getExercises,
  getLastSession,
  createSession,
  saveSessionEntries,
  getProgressForExercise,
} from '../db/queries';
import type { DayOfWeek, Exercise, SessionEntry, SessionWithEntries, ExerciseProgress } from '../types';
import ProgressChart from '../components/ProgressChart';
import ExerciseManager from '../components/ExerciseManager';
import ExerciseLibrarySection from '../components/ExerciseLibrarySection';
import RestTimer from '../components/RestTimer';

const DAY_NAMES: Record<DayOfWeek, { name: string; focus: string }> = {
  monday: { name: 'Pondělí', focus: 'Nohy' },
  wednesday: { name: 'Středa', focus: 'Hruď & Ramena' },
  friday: { name: 'Pátek', focus: 'Záda, Biceps & Triceps' },
};

const VALID_DAYS: DayOfWeek[] = ['monday', 'wednesday', 'friday'];

function isValidDay(day: string): day is DayOfWeek {
  return VALID_DAYS.includes(day as DayOfWeek);
}

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

interface WeightInput {
  exerciseId: number;
  weight: string;
  reps: string;
  sets: string;
  note: string;
}

export default function TrainingDay() {
  const { dayId: rawDayId } = useParams<{ dayId: string }>();
  const navigate = useNavigate();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [lastSession, setLastSession] = useState<SessionWithEntries | null>(null);
  const [inputs, setInputs] = useState<Record<number, WeightInput>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [chartExercise, setChartExercise] = useState<{ id: number; name: string } | null>(null);
  const [chartData, setChartData] = useState<ExerciseProgress[]>([]);
  const [showManager, setShowManager] = useState(false);

  // Derived — safe cast after guard below
  const dayId = rawDayId as DayOfWeek;

  const loadData = useCallback(async () => {
    if (!rawDayId || !isValidDay(rawDayId)) return;
    const [exs, last] = await Promise.all([
      getExercises(rawDayId),
      getLastSession(rawDayId),
    ]);
    setExercises(exs);
    setLastSession(last);

    const initial: Record<number, WeightInput> = {};
    exs.forEach((ex) => {
      const lastEntry = last?.entries.find((e) => e.exerciseId === ex.id);
      initial[ex.id] = {
        exerciseId: ex.id,
        weight: lastEntry?.weight != null ? String(lastEntry.weight) : '',
        reps: lastEntry?.reps != null ? String(lastEntry.reps) : '',
        sets: lastEntry?.sets != null ? String(lastEntry.sets) : '',
        note: '',
      };
    });
    setInputs(initial);
  }, [rawDayId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Guard — after all hooks
  if (!rawDayId || !isValidDay(rawDayId)) {
    navigate('/');
    return null;
  }

  const day = DAY_NAMES[dayId];

  function updateInput(exerciseId: number, field: keyof Omit<WeightInput, 'exerciseId'>, value: string) {
    setInputs((prev) => ({
      ...prev,
      [exerciseId]: { ...prev[exerciseId], [field]: value },
    }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    const session = await createSession(dayId, todayDate());

    const entries: Omit<SessionEntry, 'id'>[] = exercises
      .filter((ex) => !ex.isHidden)
      .map((ex) => {
        const inp = inputs[ex.id];
        return {
          sessionId: session.id,
          exerciseId: ex.id,
          weight: inp?.weight ? parseFloat(inp.weight) : null,
          reps: inp?.reps ? parseInt(inp.reps, 10) : null,
          sets: inp?.sets ? parseInt(inp.sets, 10) : null,
          note: inp?.note ?? '',
        };
      });

    await saveSessionEntries(session.id, entries);
    setSaving(false);
    setSaved(true);
    await loadData();
  }

  async function openChart(exercise: Exercise) {
    if (chartExercise?.id === exercise.id) {
      setChartExercise(null);
      return;
    }
    const data = await getProgressForExercise(exercise.id);
    setChartData(data);
    setChartExercise({ id: exercise.id, name: exercise.name });
  }

  const visibleExercises = exercises.filter((ex) => !ex.isHidden);

  function getLastWeight(exerciseId: number): string | null {
    const entry = lastSession?.entries.find((e) => e.exerciseId === exerciseId);
    if (!entry || entry.weight == null) return null;
    return `${entry.weight} kg`;
  }

  return (
    <div className="min-h-svh bg-[#0f0f0f] flex flex-col">
      {/* Header */}
      <header className="px-5 pt-8 pb-5 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest">{day.name}</p>
          <h1 className="text-xl font-bold text-white leading-tight">{day.focus}</h1>
        </div>
        {lastSession && (
          <span className="ml-auto text-xs text-zinc-500">
            Poslední: {lastSession.session.date}
          </span>
        )}
      </header>

      {/* Exercise list */}
      <main className="flex-1 px-5 pb-10 flex flex-col gap-3">
        {visibleExercises.length === 0 && (
          <div className="text-center py-16 text-zinc-500 text-sm">
            Žádné cviky. Přidej je níže.
          </div>
        )}

        {visibleExercises.map((ex) => {
          const lastWeight = getLastWeight(ex.id);
          const inp = inputs[ex.id] ?? { weight: '', reps: '', sets: '', note: '' };
          const isChartOpen = chartExercise?.id === ex.id;

          return (
            <div key={ex.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              {/* Exercise header */}
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-white text-base">{ex.name}</p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openChart(ex)}
                    className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                      isChartOpen
                        ? 'bg-violet-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    Graf
                  </button>
                  <Link
                    to={`/exercise/${ex.id}/progress`}
                    className="text-xs px-3 py-1 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
                  >
                    Progres
                  </Link>
                </div>
              </div>

              {/* Last session reference */}
              {lastWeight && (
                <p className="text-xs text-violet-400 mb-3 font-medium">
                  Minule: {lastWeight}
                </p>
              )}

              {/* Inputs row */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Váha (kg)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={inp.weight}
                    onChange={(e) => updateInput(ex.id, 'weight', e.target.value)}
                    placeholder={lastWeight ?? '0'}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 placeholder-zinc-600"
                  />
                </div>
                <div className="w-20">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Opak.</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={inp.reps}
                    onChange={(e) => updateInput(ex.id, 'reps', e.target.value)}
                    placeholder="—"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 placeholder-zinc-600"
                  />
                </div>
                <div className="w-20">
                  <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Série</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={inp.sets}
                    onChange={(e) => updateInput(ex.id, 'sets', e.target.value)}
                    placeholder="—"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 placeholder-zinc-600"
                  />
                </div>
              </div>

              {/* Note field */}
              <div className="mt-2">
                <input
                  type="text"
                  value={inp.note}
                  onChange={(e) => updateInput(ex.id, 'note', e.target.value)}
                  placeholder="Poznámka (volitelné)…"
                  className="w-full bg-transparent border-0 border-t border-zinc-800 pt-2 text-zinc-500 text-xs focus:outline-none focus:text-zinc-300 placeholder-zinc-700 transition-colors"
                />
              </div>

              {/* Chart */}
              {isChartOpen && (
                <ProgressChart data={chartData} exerciseName={ex.name} />
              )}
            </div>
          );
        })}

        {/* Save button */}
        {visibleExercises.length > 0 && (
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-[0.98] mt-2 ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-60'
            }`}
          >
            {saving ? 'Ukládám…' : saved ? '✓ Uloženo' : 'Uložit trénink'}
          </button>
        )}

        {/* Exercise manager toggle */}
        <button
          onClick={() => setShowManager((v) => !v)}
          className="w-full py-3 rounded-2xl border border-zinc-800 text-zinc-500 text-sm hover:text-zinc-300 hover:border-zinc-600 transition-colors"
        >
          {showManager ? 'Skrýt správu cviků' : 'Spravovat cviky'}
        </button>

        {showManager && (
          <ExerciseManager
            dayId={dayId}
            exercises={exercises}
            onUpdate={loadData}
          />
        )}

        {/* Exercise inspiration library */}
        <ExerciseLibrarySection dayId={dayId} />
      </main>

      {/* Floating rest timer */}
      <RestTimer />
    </div>
  );
}
