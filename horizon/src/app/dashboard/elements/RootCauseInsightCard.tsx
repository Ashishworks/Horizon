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

export default function RootCauseInsightCard({ entries }: Props) {
  const insight = useMemo(() => {
    if (entries.length < 4) {
      return {
        title: 'Not enough data yet',
        message: 'Add a few more journal entries to uncover patterns.',
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
        title: 'Sleep has the strongest impact',
        message: 'Your mood is noticeably higher on days you sleep 7 hours or more.',
        stats: `+${sleepDiff.toFixed(1)} mood points on average`,
      },
      {
        key: 'Exercise',
        diff: exerciseDiff,
        title: 'Exercise boosts your mood',
        message: 'Days with physical activity tend to feel better emotionally.',
        stats: `+${exerciseDiff.toFixed(1)} mood points on exercise days`,
      },
      {
        key: 'Screen',
        diff: screenDiff,
        title: 'Screen time affects your mood',
        message: 'Lower entertainment screen time is linked with better mood.',
        stats: `+${screenDiff.toFixed(1)} mood points on low-screen days`,
      },
    ];

    const strongest = factors.reduce((a, b) =>
      Math.abs(b.diff) > Math.abs(a.diff) ? b : a
    );

    if (Math.abs(strongest.diff) < 0.5) {
      return {
        title: 'No strong pattern yet',
        message: 'Your habits are fairly balanced during this period.',
        strength: 'Low',
        stats: null,
      };
    }

    return {
      title: strongest.title,
      message: strongest.message,
      strength:
        Math.abs(strongest.diff) >= 1.5
          ? 'Strong'
          : 'Moderate',
      stats: strongest.stats,
    };
  }, [entries]);

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Why your mood changes</h3>

        {insight.strength && (
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              insight.strength === 'Strong'
                ? 'bg-green-500/10 text-green-500'
                : 'bg-yellow-500/10 text-yellow-500'
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
