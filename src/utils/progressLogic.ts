import type {
  ExerciseHistoryEntry,
  ExerciseStats,
  ProgressStatus,
  WeightRecommendation,
} from '../types';

// ── 1RM calculation ───────────────────────────────────────────────────────

/** Epley formula: weight × (1 + reps / 30) */
export function calcEstimatedOneRM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

// ── Best set selection ────────────────────────────────────────────────────

/** Returns the entry with the highest estimated 1RM across all history. */
export function selectPersonalRecord(
  history: ExerciseHistoryEntry[],
): ExerciseHistoryEntry | null {
  if (history.length === 0) return null;
  return history.reduce((best, entry) =>
    entry.estimatedOneRM > best.estimatedOneRM ? entry : best,
  );
}

/** Returns the entry with the highest raw weight. */
export function selectMaxWeightEntry(
  history: ExerciseHistoryEntry[],
): ExerciseHistoryEntry | null {
  if (history.length === 0) return null;
  return history.reduce((best, entry) =>
    entry.weight > best.weight ? entry : best,
  );
}

// ── Progress status ───────────────────────────────────────────────────────

/**
 * Evaluates how the user is trending.
 * History must be sorted oldest-first.
 *
 * Rules:
 *   stagnation  — last 3 sessions identical (weight ±0, reps ±1)
 *   progress    — last session has higher weight OR same weight + more reps
 *   decline     — weight dropped OR reps dropped by >2
 *   same        — no meaningful change
 */
export function evaluateProgressStatus(
  history: ExerciseHistoryEntry[],
): ProgressStatus {
  if (history.length < 2) return 'insufficient_data';

  const last = history[history.length - 1];
  const prev = history[history.length - 2];

  // Stagnation: 3+ sessions with no meaningful change
  if (history.length >= 3) {
    const recent = history.slice(-3);
    const allSame = recent.every(
      (e) =>
        e.weight === last.weight && Math.abs(e.reps - last.reps) <= 1,
    );
    if (allSame) return 'stagnation';
  }

  if (last.weight > prev.weight) return 'progress';
  if (last.weight === prev.weight && last.reps > prev.reps + 1) return 'progress';
  if (last.weight < prev.weight) return 'decline';
  if (last.reps < prev.reps - 2) return 'decline';

  return 'same';
}

// ── Weight recommendation ─────────────────────────────────────────────────

/**
 * Standard weight increments per exercise category.
 * Default is 2.5 kg (most barbell / machine work).
 */
export const WEIGHT_INCREMENTS = {
  micro: 1,     // dumbbells, cables
  standard: 2.5, // default
  large: 5,     // deadlift, squat
} as const;

/**
 * Recommends the next working weight.
 *
 * Logic:
 *   - reps >= upperRepTarget → increase by increment (user mastered the weight)
 *   - reps dropped >2 vs previous → suggest same or -increment
 *   - otherwise → keep current weight, work on reps
 */
export function recommendNextWeight(
  history: ExerciseHistoryEntry[],
  upperRepTarget = 12,
  increment: number = WEIGHT_INCREMENTS.standard,
): WeightRecommendation {
  if (history.length === 0) {
    return {
      suggestedWeight: 0,
      reason: 'Žádná historia — začni s lehkou váhou',
      increment,
    };
  }

  const last = history[history.length - 1];

  if (last.reps >= upperRepTarget) {
    return {
      suggestedWeight: Math.round((last.weight + increment) * 10) / 10,
      reason: `Zvládl jsi ${last.reps} opak. — přidej váhu`,
      increment,
    };
  }

  if (history.length >= 2) {
    const prev = history[history.length - 2];
    if (last.reps < prev.reps - 2) {
      const lower = Math.max(Math.round((last.weight - increment) * 10) / 10, 0);
      return {
        suggestedWeight: lower,
        reason: 'Reps výrazně klesly — zkus nižší váhu',
        increment,
      };
    }
  }

  return {
    suggestedWeight: last.weight,
    reason: 'Drž váhu, zaměř se na více opakování',
    increment,
  };
}

// ── Aggregate stats ───────────────────────────────────────────────────────

/** Computes all stats for an exercise from its history. */
export function computeExerciseStats(
  history: ExerciseHistoryEntry[],
): ExerciseStats {
  const pr = selectPersonalRecord(history);
  const maxEntry = selectMaxWeightEntry(history);
  const last = history.length > 0 ? history[history.length - 1] : null;
  const totalSets = history.reduce((sum, e) => sum + e.sets, 0);

  return {
    lastEntry: last,
    personalRecord: pr,
    maxWeight: maxEntry?.weight ?? null,
    totalSets,
    estimated1RM: pr ? pr.estimatedOneRM : null,
    progressStatus: evaluateProgressStatus(history),
    history,
  };
}
