export type DayOfWeek = 'monday' | 'wednesday' | 'friday';

export interface TrainingDay {
  id: DayOfWeek;
  name: string;
  focus: string;
}

export interface Exercise {
  id: number;
  trainingDayId: DayOfWeek;
  name: string;
  order: number;
  isHidden: boolean;
}

export interface Session {
  id: number;
  trainingDayId: DayOfWeek;
  date: string; // ISO date string YYYY-MM-DD
}

export interface SessionEntry {
  id: number;
  sessionId: number;
  exerciseId: number;
  weight: number | null;
  reps: number | null;
  sets: number | null;
  note: string;
}

export interface SessionWithEntries {
  session: Session;
  entries: SessionEntry[];
}

export interface ExerciseProgress {
  date: string;
  weight: number;
}
