"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MutatingDots } from "react-loader-spinner";
import { subDays, format } from "date-fns";

export default function InsightOfTheWeek() {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const generateInsight = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const fromDate = format(subDays(new Date(), 6), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("journals")
        .select(
          "mood, sleep_hours, exercise, screen_work, screen_entertainment, stress_level"
        )
        .eq("user_id", user.id)
        .gte("date", fromDate);

      if (error || !data || data.length < 4) {
        setInsight(null);
        setLoading(false);
        return;
      }

      const avg = (arr: number[]) =>
        arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

      // Sleep vs Mood
      const goodSleep = data.filter((d) => (d.sleep_hours ?? 0) >= 7);
      const poorSleep = data.filter((d) => (d.sleep_hours ?? 0) < 6);

      const sleepMoodDiff =
        avg(goodSleep.map((d) => d.mood ?? 0)) -
        avg(poorSleep.map((d) => d.mood ?? 0));

      // Exercise vs Mood
      const exerciseDays = data.filter(
        (d) => d.exercise && d.exercise.length > 0
      );
      const noExerciseDays = data.filter(
        (d) => !d.exercise || d.exercise.length === 0
      );

      const exerciseMoodDiff =
        avg(exerciseDays.map((d) => d.mood ?? 0)) -
        avg(noExerciseDays.map((d) => d.mood ?? 0));

      // Screen Time vs Stress
      const highScreen = data.filter(
        (d) => (d.screen_work ?? 0) + (d.screen_entertainment ?? 0) >= 6
      );
      const lowScreen = data.filter(
        (d) => (d.screen_work ?? 0) + (d.screen_entertainment ?? 0) < 6
      );

      const screenStressDiff =
        avg(highScreen.map((d) => d.stress_level ?? 0)) -
        avg(lowScreen.map((d) => d.stress_level ?? 0));

      const insights = [
        {
          strength: Math.abs(sleepMoodDiff),
          text:
            sleepMoodDiff > 1
              ? "Your mood is noticeably better on days with good sleep."
              : "Your mood tends to dip on low-sleep days.",
        },
        {
          strength: Math.abs(exerciseMoodDiff),
          text:
            exerciseMoodDiff > 1
              ? "Exercise days show a higher average mood."
              : "Lack of physical activity may be affecting your mood.",
        },
        {
          strength: Math.abs(screenStressDiff),
          text:
            screenStressDiff > 1
              ? "Higher screen time often coincides with increased stress."
              : "Lower screen time appears to help keep stress stable.",
        },
      ];

      insights.sort((a, b) => b.strength - a.strength);

      setInsight(insights[0]?.text ?? null);
      setLoading(false);
    };

    generateInsight();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <MutatingDots visible height="80" width="80" color="#ff0000ff" />
      </div>
    );
  }

  if (!insight) {
    return (
      <p className="text-muted-foreground text-center">
        Not enough data to generate insights yet.
      </p>
    );
  }

  return (
    <div className="flex items-center justify-center h-full px-4 text-center">
      <p className="text-lg font-medium leading-relaxed">💡 {insight}</p>
    </div>
  );
}
