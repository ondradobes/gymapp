import type {
  ExerciseHistoryEntry,
  ExerciseStats,
  ExerciseWithStats,
  Exercise,
  ProgressStatus,
  ProgressInsight,
  TrendStatus,
  WeightRecommendation,
  SummaryChartDataPoint,
  SummaryChartSeries,
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
  if (last.weight === prev.weight && last.reps > prev.reps) return 'progress';
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

// ── Period-based progress utilities ──────────────────────────────────────────

/** Returns entries within the last `periodDays` days. null = all time. */
export function filterByPeriod(
  history: ExerciseHistoryEntry[],
  periodDays: number | null,
): ExerciseHistoryEntry[] {
  if (periodDays === null) return history;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - periodDays);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return history.filter((e) => e.date >= cutoffStr);
}

/**
 * Returns entries from the period immediately before the current period.
 * Used to compute volume change vs. the previous same-length window.
 */
export function filterPrevPeriod(
  history: ExerciseHistoryEntry[],
  periodDays: number | null,
): ExerciseHistoryEntry[] {
  if (periodDays === null) return [];
  const today = new Date();
  const currentCutoff = new Date(today);
  currentCutoff.setDate(currentCutoff.getDate() - periodDays);
  const prevCutoff = new Date(today);
  prevCutoff.setDate(prevCutoff.getDate() - periodDays * 2);
  const currentCutoffStr = currentCutoff.toISOString().slice(0, 10);
  const prevCutoffStr = prevCutoff.toISOString().slice(0, 10);
  return history.filter((e) => e.date >= prevCutoffStr && e.date < currentCutoffStr);
}

/** Volume of a single history entry: weight × reps × sets */
export function calcEntryVolume(entry: ExerciseHistoryEntry): number {
  return entry.weight * entry.reps * (entry.sets ?? 1);
}

/** Sum of volumes across an array of history entries */
export function calcTotalVolume(history: ExerciseHistoryEntry[]): number {
  return history.reduce((sum, e) => sum + calcEntryVolume(e), 0);
}

/**
 * Trend based on 3% threshold of estimated 1RM (first vs last in period).
 * > +3% → growing, < -3% → declining, else → stagnating.
 */
export function evaluateTrend(periodHistory: ExerciseHistoryEntry[]): TrendStatus {
  if (periodHistory.length < 2) return 'insufficient_data';
  const first = periodHistory[0];
  const last = periodHistory[periodHistory.length - 1];
  if (first.estimatedOneRM <= 0) return 'insufficient_data';
  const change = (last.estimatedOneRM - first.estimatedOneRM) / first.estimatedOneRM;
  if (change > 0.03) return 'growing';
  if (change < -0.03) return 'declining';
  return 'stagnating';
}

/** % change in estimated 1RM from first to last entry in period. */
export function calcChangePercent(periodHistory: ExerciseHistoryEntry[]): number | null {
  if (periodHistory.length < 2) return null;
  const first = periodHistory[0];
  const last = periodHistory[periodHistory.length - 1];
  if (first.estimatedOneRM <= 0) return null;
  return Math.round(((last.estimatedOneRM - first.estimatedOneRM) / first.estimatedOneRM) * 100);
}

/** Builds the full ExerciseWithStats object for one exercise given a period. */
export function buildExerciseWithStats(
  exercise: Exercise,
  history: ExerciseHistoryEntry[],
  periodDays: number | null,
  today: string,
): ExerciseWithStats {
  const periodHistory = filterByPeriod(history, periodDays);
  const prevPeriodHistory = filterPrevPeriod(history, periodDays);

  const last = history.length > 0 ? history[history.length - 1] : null;
  const bestEntry = history.reduce<ExerciseHistoryEntry | null>(
    (best, e) => (!best || e.weight > best.weight ? e : best),
    null,
  );

  const daysSinceLast = last
    ? Math.round(
        (new Date(today).getTime() - new Date(last.date).getTime()) / 86_400_000,
      )
    : null;

  return {
    exercise,
    history,
    periodHistory,
    trend: evaluateTrend(periodHistory),
    changePercent: calcChangePercent(periodHistory),
    periodVolume: calcTotalVolume(periodHistory),
    prevPeriodVolume: calcTotalVolume(prevPeriodHistory),
    lastWeight: last?.weight ?? null,
    lastReps: last?.reps ?? null,
    bestWeight: bestEntry?.weight ?? null,
    lastDate: last?.date ?? null,
    daysSinceLast,
  };
}

/** Generates up to 6 actionable insights from all exercises. */
export function generateInsights(exercises: ExerciseWithStats[]): ProgressInsight[] {
  const insights: ProgressInsight[] = [];
  const withData = exercises.filter((e) => e.periodHistory.length >= 2);

  if (exercises.every((e) => e.history.length === 0)) {
    return [
      {
        type: 'neutral',
        text: 'Zatím tu nejsou žádná data. Odcvič pár tréninků a tady uvidíš svůj pokrok.',
      },
    ];
  }

  // Track which exercises already got a dedicated insight to avoid duplicates
  const mentionedIds = new Set<number>();

  // Fastest growing exercise
  const growing = withData
    .filter((e) => e.trend === 'growing' && e.changePercent !== null)
    .sort((a, b) => (b.changePercent ?? 0) - (a.changePercent ?? 0));
  if (growing.length > 0) {
    const top = growing[0];
    const pct = top.changePercent != null ? ` +${top.changePercent} %` : '';
    insights.push({
      type: 'positive',
      text: `Největší pokrok máš u cviku „${top.exercise.name}":${pct} za vybrané období. Skvělá práce!`,
    });
    mentionedIds.add(top.exercise.id);
  }

  // Stagnating exercises
  const stagnating = withData.filter((e) => e.trend === 'stagnating');
  if (stagnating.length === 1) {
    insights.push({
      type: 'warning',
      text: `„${stagnating[0].exercise.name}" stagnuje. Zkus přidat opakování, váhu nebo upravit regeneraci.`,
    });
    mentionedIds.add(stagnating[0].exercise.id);
  } else if (stagnating.length > 1) {
    const names = stagnating
      .slice(0, 2)
      .map((e) => `„${e.exercise.name}"`)
      .join(' a ');
    const extra = stagnating.length > 2 ? ` (a další ${stagnating.length - 2})` : '';
    insights.push({
      type: 'warning',
      text: `${names}${extra} stagnují. Zkus nový stimul — přidej váhu nebo opakování.`,
    });
    stagnating.forEach((e) => mentionedIds.add(e.exercise.id));
  }

  // Declining exercises (max 2)
  withData
    .filter((e) => e.trend === 'declining')
    .slice(0, 2)
    .forEach((e) => {
      insights.push({
        type: 'warning',
        text: `U cviku „${e.exercise.name}" výkon klesá. Zkontroluj regeneraci, techniku nebo celkový objem.`,
      });
      mentionedIds.add(e.exercise.id);
    });

  // Exercises not trained for ≥ 14 days — skip any already mentioned above
  exercises
    .filter(
      (e) =>
        e.history.length > 0 &&
        e.daysSinceLast !== null &&
        e.daysSinceLast >= 14 &&
        !mentionedIds.has(e.exercise.id),
    )
    .sort((a, b) => (b.daysSinceLast ?? 0) - (a.daysSinceLast ?? 0))
    .slice(0, 2)
    .forEach((e) => {
      insights.push({
        type: 'neutral',
        text: `„${e.exercise.name}" jsi necvičil ${e.daysSinceLast} dní. Možná stojí za to ho znovu zařadit.`,
      });
    });

  // Fallback when there's data but no specific insight fired
  if (insights.length === 0 && exercises.some((e) => e.history.length > 0)) {
    insights.push({
      type: 'neutral',
      text: 'Přidej více tréninků a konkrétní doporučení se začnou zobrazovat.',
    });
  }

  return insights.slice(0, 6);
}

// ── Summary chart helpers ─────────────────────────────────────────────────

const CHART_PALETTE = [
  '#a78bfa', // violet-400
  '#34d399', // emerald-400
  '#60a5fa', // blue-400
  '#f87171', // red-400
  '#fbbf24', // amber-400
  '#e879f9', // fuchsia-400
  '#2dd4bf', // teal-400
  '#fb923c', // orange-400
  '#818cf8', // indigo-400
  '#4ade80', // green-400
] as const;

/**
 * Selects the top N exercises to show in the summary chart.
 * Priority: most records → most recent session → highest period volume.
 */
export function selectTopExercises(
  exercises: ExerciseWithStats[],
  n: number,
): ExerciseWithStats[] {
  return [...exercises]
    .filter((e) => e.periodHistory.length >= 2)
    .sort((a, b) => {
      const byRecords = b.periodHistory.length - a.periodHistory.length;
      if (byRecords !== 0) return byRecords;
      const dateA = a.lastDate ?? '';
      const dateB = b.lastDate ?? '';
      const byDate = dateB.localeCompare(dateA);
      if (byDate !== 0) return byDate;
      return b.periodVolume - a.periodVolume;
    })
    .slice(0, n);
}

/**
 * Builds a unified date-keyed dataset for the multi-line Recharts chart.
 * Each point has `ex_${id}: estimatedOneRM` for each exercise.
 * Returns { dataset, series }.
 */
export function buildChartDataset(exercises: ExerciseWithStats[]): {
  dataset: SummaryChartDataPoint[];
  series: SummaryChartSeries[];
} {
  const series: SummaryChartSeries[] = exercises.map((e) => ({
    exerciseId: e.exercise.id,
    name: e.exercise.name,
    color: CHART_PALETTE[e.exercise.id % CHART_PALETTE.length],
    dataKey: `ex_${e.exercise.id}`,
  }));

  // Collect all unique dates across all exercises
  const allDates = [
    ...new Set(exercises.flatMap((e) => e.periodHistory.map((h) => h.date))),
  ].sort();

  const dataset: SummaryChartDataPoint[] = allDates.map((date) => {
    const point: SummaryChartDataPoint = { date };
    for (const e of exercises) {
      // Use the best (highest) e1RM on that date
      const entries = e.periodHistory.filter((h) => h.date === date);
      if (entries.length > 0) {
        const best = entries.reduce((b, h) =>
          h.estimatedOneRM > b.estimatedOneRM ? h : b,
        );
        point[`ex_${e.exercise.id}`] = best.estimatedOneRM;
        // Store raw data for tooltip
        point[`ex_${e.exercise.id}_weight`] = best.weight;
        point[`ex_${e.exercise.id}_reps`] = best.reps;
        point[`ex_${e.exercise.id}_sets`] = best.sets;
      }
    }
    return point;
  });

  return { dataset, series };
}

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
