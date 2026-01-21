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

export default function GentleSuggestionCard({ entries }: Props) {
  const suggestion = useMemo(() => {
    if (entries.length < 4) {
      return {
        title: 'Small steps go a long way',
        message: 'Keep journaling, suggestions will appear as patterns emerge.',
        tone: null,
      };
    }

    const avg = (arr: number[]) =>
      arr.reduce((a, b) => a + b, 0) / arr.length;

    // ─── Sleep ───
    const sleepData = entries.filter(e => e.sleep_hours !== undefined);
    const goodSleep = sleepData.filter(e => (e.sleep_hours ?? 0) >= 7);
    const poorSleep = sleepData.filter(e => (e.sleep_hours ?? 0) < 7);

    const sleepDiff =
      goodSleep.length && poorSleep.length
        ? avg(goodSleep.map(e => e.mood)) -
          avg(poorSleep.map(e => e.mood))
        : 0;

    // ─── Exercise ───
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

    // ─── Screen ───
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

    const suggestions = [
      {
        key: 'Sleep',
        diff: sleepDiff,
        title: 'Consider prioritizing rest',
        message:
          'On days with enough sleep, your mood tends to be noticeably better. A slightly earlier bedtime might help.',
      },
      {
        key: 'Exercise',
        diff: exerciseDiff,
        title: 'Light movement could help',
        message:
          'Even small amounts of physical activity seem to support your mood. A short walk might be enough.',
      },
      {
        key: 'Screen',
        diff: screenDiff,
        title: 'A screen break may help',
        message:
          'Lower entertainment screen time is often linked with better mood for you. Try a brief digital break.',
      },
    ];

    const strongest = suggestions.reduce((a, b) =>
      Math.abs(b.diff) > Math.abs(a.diff) ? b : a
    );

    if (Math.abs(strongest.diff) < 0.5) {
      return {
        title: 'You seem fairly balanced',
        message:
          'No strong habit stands out right now. Maintaining your current routine could be beneficial.',
        tone: 'Neutral',
      };
    }

    return {
      title: strongest.title,
      message: strongest.message,
      tone: 'Gentle',
    };
  }, [entries]);

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">A gentle suggestion</h3>

        {suggestion.tone && (
          <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 font-medium">
            {suggestion.tone}
          </span>
        )}
      </div>

      <p className="text-sm text-foreground">
        {suggestion.message}
      </p>
    </div>
  );
}
