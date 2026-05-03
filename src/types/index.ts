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

// ── Progress tracker types ─────────────────────────────────────────────────

/** One exercise record from a past session, enriched with computed fields. */
export interface ExerciseHistoryEntry {
  sessionId: number;
  date: string;
  weight: number;
  reps: number;
  sets: number;
  /** Epley formula: weight × (1 + reps/30) */
  estimatedOneRM: number;
}

/** How the user is trending compared to previous sessions. */
export type ProgressStatus =
  | 'progress'          // weight or reps improved
  | 'same'              // no meaningful change
  | 'stagnation'        // 3+ sessions with no change
  | 'decline'           // weight or reps dropped
  | 'insufficient_data'; // fewer than 2 sessions

/** Complete computed stats for a single exercise. */
export interface ExerciseStats {
  lastEntry: ExerciseHistoryEntry | null;
  /** Best session by estimated 1RM */
  personalRecord: ExerciseHistoryEntry | null;
  maxWeight: number | null;
  totalSets: number;
  estimated1RM: number | null;
  progressStatus: ProgressStatus;
  /** Chronological, newest last */
  history: ExerciseHistoryEntry[];
}

/** Output of the recommendation engine. */
export interface WeightRecommendation {
  suggestedWeight: number;
  reason: string;
  /** The increment step used (1 / 2.5 / 5 kg) */
  increment: number;
}

// ── Progress overview page types ───────────────────────────────────────────

export type PeriodOption = '7d' | '30d' | '90d' | 'all';

export type TrendStatus = 'growing' | 'stagnating' | 'declining' | 'insufficient_data';

/** Computed data for one exercise within the Progress overview page. */
export interface ExerciseWithStats {
  exercise: Exercise;
  /** Full history, oldest first */
  history: ExerciseHistoryEntry[];
  /** History filtered to the selected period */
  periodHistory: ExerciseHistoryEntry[];
  trend: TrendStatus;
  /** % change in estimated 1RM from first to last entry in period */
  changePercent: number | null;
  /** Total volume (weight × reps × sets) in current period */
  periodVolume: number;
  /** Total volume in the previous same-length period (for comparison) */
  prevPeriodVolume: number;
  lastWeight: number | null;
  lastReps: number | null;
  bestWeight: number | null;
  lastDate: string | null;
  /** Days since last session (null if no history) */
  daysSinceLast: number | null;
}

export interface ProgressInsight {
  type: 'positive' | 'warning' | 'neutral';
  text: string;
}
