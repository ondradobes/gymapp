import { getDb } from './schema';
import type { DayOfWeek, Exercise, Session, SessionEntry, SessionWithEntries, ExerciseHistoryEntry } from '../types';
import { calcEstimatedOneRM } from '../utils/progressLogic';

// ── Backup types ───────────────────────────────────────────────────────────

export interface BackupData {
  version: number;
  exportedAt: string;
  exercises: Exercise[];
  sessions: Session[];
  sessionEntries: SessionEntry[];
}

// ── Exercises ──────────────────────────────────────────────────────────────

export async function getExercises(dayId: DayOfWeek): Promise<Exercise[]> {
  const db = await getDb();
  const all = await db.getAllFromIndex('exercises', 'by-day', dayId);
  return all.sort((a, b) => a.order - b.order);
}

export async function addExercise(
  dayId: DayOfWeek,
  name: string,
): Promise<Exercise> {
  const db = await getDb();
  const existing = await getExercises(dayId);
  const order = existing.length > 0 ? Math.max(...existing.map((e) => e.order)) + 1 : 0;
  const exercise: Omit<Exercise, 'id'> = {
    trainingDayId: dayId,
    name: name.trim(),
    order,
    isHidden: false,
  };
  const id = await db.add('exercises', exercise as Exercise);
  return { ...exercise, id } as Exercise;
}

export async function updateExercise(exercise: Exercise): Promise<void> {
  const db = await getDb();
  await db.put('exercises', exercise);
}

export async function toggleExerciseVisibility(exerciseId: number): Promise<void> {
  const db = await getDb();
  const exercise = await db.get('exercises', exerciseId);
  if (!exercise) return;
  await db.put('exercises', { ...exercise, isHidden: !exercise.isHidden });
}

// ── Sessions ───────────────────────────────────────────────────────────────

export async function getSessionsByDay(dayId: DayOfWeek): Promise<Session[]> {
  const db = await getDb();
  const sessions = await db.getAllFromIndex('sessions', 'by-day', dayId);
  return sessions.sort((a, b) => {
    const dateDiff = b.date.localeCompare(a.date);
    if (dateDiff !== 0) return dateDiff;
    return b.id - a.id; // same date → most recently created session first
  });
}

export async function getLastSession(dayId: DayOfWeek): Promise<SessionWithEntries | null> {
  const sessions = await getSessionsByDay(dayId);
  if (sessions.length === 0) return null;
  const session = sessions[0];
  const entries = await getEntriesForSession(session.id);
  return { session, entries };
}

export async function getLastSessionDate(dayId: DayOfWeek): Promise<string | null> {
  const sessions = await getSessionsByDay(dayId);
  return sessions.length > 0 ? sessions[0].date : null;
}

export async function getSessionCount(dayId: DayOfWeek): Promise<number> {
  const sessions = await getSessionsByDay(dayId);
  return sessions.length;
}

export async function createSession(dayId: DayOfWeek, date: string): Promise<Session> {
  const db = await getDb();
  const session: Omit<Session, 'id'> = { trainingDayId: dayId, date };
  const id = await db.add('sessions', session as Session);
  return { ...session, id } as Session;
}

/**
 * Upsert: if a session already exists for (dayId, date), reuse it and replace
 * its entries. Otherwise create a new session. This ensures one record per day
 * so the user can freely re-save during the same training day.
 */
export async function saveTrainingDay(
  dayId: DayOfWeek,
  date: string,
  entries: Array<Omit<SessionEntry, 'id' | 'sessionId'>>,
): Promise<Session> {
  const db = await getDb();

  // Find existing session for this day+date
  const existing = await getSessionsByDay(dayId);
  const todaySession = existing.find((s) => s.date === date);

  let session: Session;
  if (todaySession) {
    session = todaySession;
  } else {
    const id = await db.add('sessions', { trainingDayId: dayId, date } as Session);
    session = { id: id as number, trainingDayId: dayId, date };
  }

  // Replace all entries atomically: delete old ones, insert new ones
  const oldEntries = await db.getAllFromIndex('sessionEntries', 'by-session', session.id);
  const tx = db.transaction('sessionEntries', 'readwrite');
  await Promise.all([
    ...oldEntries.map((e) => tx.store.delete(e.id)),
    ...entries.map((e) => tx.store.add({ ...e, sessionId: session.id } as SessionEntry)),
  ]);
  await tx.done;

  return session;
}

// ── Session Entries ────────────────────────────────────────────────────────

export async function getEntriesForSession(sessionId: number): Promise<SessionEntry[]> {
  const db = await getDb();
  return db.getAllFromIndex('sessionEntries', 'by-session', sessionId);
}

export async function saveSessionEntries(
  sessionId: number,
  entries: Omit<SessionEntry, 'id'>[],
): Promise<void> {
  const db = await getDb();
  const tx = db.transaction('sessionEntries', 'readwrite');
  await Promise.all(entries.map((entry) => tx.store.add({ ...entry, sessionId } as SessionEntry)));
  await tx.done;
}

export async function getProgressForExercise(
  exerciseId: number,
): Promise<Array<{ date: string; weight: number }>> {
  const db = await getDb();
  const entries = await db.getAllFromIndex('sessionEntries', 'by-exercise', exerciseId);
  const sessionIds = [...new Set(entries.map((e) => e.sessionId))];

  const sessions = await Promise.all(sessionIds.map((id) => db.get('sessions', id)));

  return entries
    .filter((e) => e.weight !== null)
    .map((entry) => {
      const session = sessions.find((s) => s?.id === entry.sessionId);
      return { date: session?.date ?? '', weight: entry.weight as number };
    })
    .filter((p) => p.date !== '')
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getExerciseById(exerciseId: number): Promise<Exercise | undefined> {
  const db = await getDb();
  return db.get('exercises', exerciseId);
}

/**
 * Returns the full history for one exercise, sorted chronologically (oldest first).
 * Skips entries without weight or reps data.
 */
export async function getExerciseHistory(exerciseId: number): Promise<ExerciseHistoryEntry[]> {
  const db = await getDb();
  const entries = await db.getAllFromIndex('sessionEntries', 'by-exercise', exerciseId);

  const sessionIds = [...new Set(entries.map((e) => e.sessionId))];
  const sessions = await Promise.all(sessionIds.map((id) => db.get('sessions', id)));
  const sessionMap = new Map<number, Session>();
  sessions.forEach((s) => { if (s) sessionMap.set(s.id, s); });

  const result: ExerciseHistoryEntry[] = entries
    .filter((e) => e.weight != null && e.reps != null && e.weight > 0 && e.reps > 0)
    .map((e) => {
      const session = sessionMap.get(e.sessionId);
      const weight = e.weight as number;
      const reps = e.reps as number;
      return {
        sessionId: e.sessionId,
        date: session?.date ?? '',
        weight,
        reps,
        sets: e.sets ?? 1,
        estimatedOneRM: calcEstimatedOneRM(weight, reps),
      };
    })
    .filter((e) => e.date !== '')
    .sort((a, b) => a.date.localeCompare(b.date)); // oldest first

  return result;
}

export async function updateSessionEntry(entry: SessionEntry): Promise<void> {
  const db = await getDb();
  await db.put('sessionEntries', entry);
}

export async function deleteSessionEntry(entryId: number): Promise<void> {
  const db = await getDb();
  await db.delete('sessionEntries', entryId);
}

export async function deleteSession(sessionId: number): Promise<void> {
  const db = await getDb();
  // Delete all entries first, then the session
  const entries = await db.getAllFromIndex('sessionEntries', 'by-session', sessionId);
  const tx = db.transaction(['sessionEntries', 'sessions'], 'readwrite');
  await Promise.all(entries.map((e) => tx.objectStore('sessionEntries').delete(e.id)));
  await tx.objectStore('sessions').delete(sessionId);
  await tx.done;
}

// ── Backup / Restore ───────────────────────────────────────────────────────

export async function exportAllData(): Promise<BackupData> {
  const db = await getDb();
  const [exercises, sessions, sessionEntries] = await Promise.all([
    db.getAll('exercises'),
    db.getAll('sessions'),
    db.getAll('sessionEntries'),
  ]);
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    exercises,
    sessions,
    sessionEntries,
  };
}

export async function importAllData(backup: BackupData): Promise<void> {
  const db = await getDb();
  // Clear and write in a single transaction — if write fails, clear is also rolled back
  const tx = db.transaction(['exercises', 'sessions', 'sessionEntries'], 'readwrite');
  const exStore = tx.objectStore('exercises');
  const sessStore = tx.objectStore('sessions');
  const entryStore = tx.objectStore('sessionEntries');

  // Queue all operations without any await in between so the transaction
  // cannot auto-commit between the clears and the puts.
  // IDB processes requests in order, so clears execute before puts.
  await Promise.all([
    exStore.clear(),
    sessStore.clear(),
    entryStore.clear(),
    ...backup.exercises.map((e) => exStore.put(e)),
    ...backup.sessions.map((s) => sessStore.put(s)),
    ...backup.sessionEntries.map((e) => entryStore.put(e)),
  ]);

  await tx.done;
}

/** Returns all exercises (across all days) that have at least one history entry. */
export async function getAllExercisesWithHistory(): Promise<
  Array<{ exercise: Exercise; history: ExerciseHistoryEntry[] }>
> {
  const db = await getDb();
  const allExercises = await db.getAll('exercises');
  const results = await Promise.all(
    allExercises.map(async (exercise) => ({
      exercise,
      history: await getExerciseHistory(exercise.id),
    })),
  );
  return results.filter((r) => r.history.length > 0);
}

export async function getTotalSessionCount(): Promise<number> {
  const db = await getDb();
  return db.count('sessions');
}

/** Returns ISO date strings (YYYY-MM-DD) for every session ever recorded. */
export async function getAllSessionDates(): Promise<string[]> {
  const db = await getDb();
  const sessions = await db.getAll('sessions');
  return sessions.map((s) => s.date);
}

export async function getAllSessionsWithEntries(): Promise<SessionWithEntries[]> {
  const db = await getDb();
  const sessions = await db.getAll('sessions');
  sessions.sort((a, b) => b.date.localeCompare(a.date));

  return Promise.all(
    sessions.map(async (session) => ({
      session,
      entries: await getEntriesForSession(session.id),
    })),
  );
}
