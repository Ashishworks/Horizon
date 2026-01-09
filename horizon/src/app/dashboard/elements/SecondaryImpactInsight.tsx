'use client';

import { useMemo } from 'react';

interface JournalEntry {
  mood: number;
  sleep_hours?: number;
  exercise?: string[];
  screen_entertainment?: number;
}

interface Props {
  entries: JournalEntry[];
}

export default function SecondaryImpactInsightCard({ entries }: Props) {
  const insight = useMemo(() => {
    if (entries.length < 4) {
      return {
        title: 'Not enough data yet',
        message: 'Add a few more journal entries to see supporting patterns.',
        strength: null,
        stats: null,
      };
    }

    const avg = (arr: number[]) =>
      arr.reduce((a, b) => a + b, 0) / arr.length;

    // ─── Sleep ──────────────────────────────
    const sleepData = entries.filter(e => e.sleep_hours !== undefined);
    const goodSleep = sleepData.filter(e => (e.sleep_hours ?? 0) >= 7);
    const poorSleep = sleepData.filter(e => (e.sleep_hours ?? 0) < 7);

    const sleepDiff =
      goodSleep.length && poorSleep.length
        ? avg(goodSleep.map(e => e.mood)) -
          avg(poorSleep.map(e => e.mood))
        : 0;

    // ─── Exercise ───────────────────────────
    const exerciseDays = entries.filter(
      e => e.exercise && e.exercise.length > 0
    );
    const noExerciseDays = entries.filter(
      e => !e.exercise || e.exercise.length === 0
    );

    const exerciseDiff =
      exerciseDays.length && noExerciseDays.length
        ? avg(exerciseDays.map(e => e.mood)) -
          avg(noExerciseDays.map(e => e.mood))
        : 0;

    // ─── Screen Time ────────────────────────
    const screenData = entries.filter(
      e => e.screen_entertainment !== undefined
    );
    const highScreen = screenData.filter(
      e => (e.screen_entertainment ?? 0) >= 3
    );
    const lowScreen = screenData.filter(
      e => (e.screen_entertainment ?? 0) < 3
    );

    const screenDiff =
      highScreen.length && lowScreen.length
        ? avg(lowScreen.map(e => e.mood)) -
          avg(highScreen.map(e => e.mood))
        : 0;

    const factors = [
      {
        key: 'Sleep',
        diff: sleepDiff,
        title: 'Sleep also plays a role',
        message: 'Your mood is somewhat better on days with sufficient sleep.',
        stats: `~${sleepDiff.toFixed(1)} mood point difference`,
      },
      {
        key: 'Exercise',
        diff: exerciseDiff,
        title: 'Exercise supports your mood',
        message: 'Physical activity has a positive but smaller effect on mood.',
        stats: `~${exerciseDiff.toFixed(1)} mood point difference`,
      },
      {
        key: 'Screen',
        diff: screenDiff,
        title: 'Screen habits have a mild effect',
        message: 'Lower entertainment screen time is mildly associated with better mood.',
        stats: `~${screenDiff.toFixed(1)} mood point difference`,
      },
    ]
      .filter(f => Math.abs(f.diff) >= 0.4) // ignore weak noise
      .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

    // Take the SECOND strongest factor
    const secondary = factors[1];

    if (!secondary) {
      return {
        title: 'No clear secondary factor',
        message: 'One habit stands out more clearly than others right now.',
        strength: 'Low',
        stats: null,
      };
    }

    return {
      title: secondary.title,
      message: secondary.message,
      strength:
        Math.abs(secondary.diff) >= 1.2
          ? 'Moderate'
          : 'Low',
      stats: secondary.stats,
    };
  }, [entries]);

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Secondary influence</h3>

        {insight.strength && (
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              insight.strength === 'Moderate'
                ? 'bg-yellow-500/10 text-yellow-500'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {insight.strength} impact
          </span>
        )}
      </div>

      <p className="text-sm text-foreground mb-2">
        {insight.message}
      </p>

      {insight.stats && (
        <p className="text-xs text-muted-foreground">
          {insight.stats}
        </p>
      )}
    </div>
  );
}
