// "use client";

// import { useEffect, useState } from "react";
// import { createClient } from "@/lib/supabase/client";
// import { MutatingDots } from "react-loader-spinner";
// import { subDays, format } from "date-fns";

// type JournalRow = {
//   mood: number | null;
//   sleep_hours: number | null;
//   exercise: string[] | null;
//   screen_work: number | null;
//   screen_entertainment: number | null;
//   stress_level: number | null;
// };

// export default function InsightOfTheWeek() {
//   const [insight, setInsight] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   const supabase = createClient();

//   useEffect(() => {
//     const avg = (arr: number[]) =>
//       arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

//     const generateInsight = async () => {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();

//       if (!user) {
//         setLoading(false);
//         return;
//       }

//       const fromDate = format(subDays(new Date(), 6), "yyyy-MM-dd");

//       const { data, error } = await supabase
//         .from("journals")
//         .select(
//           "mood, sleep_hours, exercise, screen_work, screen_entertainment, stress_level"
//         )
//         .eq("user_id", user.id)
//         .gte("date", fromDate);

//       if (error || !data || data.length < 4) {
//         setInsight(null);
//         setLoading(false);
//         return;
//       }

//       const rows = data as JournalRow[];

//       /* ---------- Sleep vs Mood ---------- */
//       const goodSleep = rows.filter((d) => (d.sleep_hours ?? 0) >= 7);
//       const poorSleep = rows.filter((d) => (d.sleep_hours ?? 0) < 6);

//       const sleepMoodDiff =
//         (avg(goodSleep.map((d) => d.mood ?? 0)) ?? 0) -
//         (avg(poorSleep.map((d) => d.mood ?? 0)) ?? 0);

//       /* ---------- Exercise vs Mood ---------- */
//       const exerciseDays = rows.filter(
//         (d) => d.exercise && d.exercise.length > 0
//       );
//       const noExerciseDays = rows.filter(
//         (d) => !d.exercise || d.exercise.length === 0
//       );

//       const exerciseMoodDiff =
//         (avg(exerciseDays.map((d) => d.mood ?? 0)) ?? 0) -
//         (avg(noExerciseDays.map((d) => d.mood ?? 0)) ?? 0);

//       /* ---------- Screen Time vs Stress ---------- */
//       const totalScreen = (d: JournalRow) =>
//         (d.screen_work ?? 0) + (d.screen_entertainment ?? 0);

//       const highScreen = rows.filter((d) => totalScreen(d) >= 6);
//       const lowScreen = rows.filter((d) => totalScreen(d) < 6);

//       const screenStressDiff =
//         (avg(highScreen.map((d) => d.stress_level ?? 0)) ?? 0) -
//         (avg(lowScreen.map((d) => d.stress_level ?? 0)) ?? 0);

//       /* ---------- Insight Scoring ---------- */
//       const insights = [
//         {
//           confidence: Math.min(goodSleep.length, poorSleep.length),
//           strength: Math.abs(sleepMoodDiff),
//           text:
//             sleepMoodDiff > 1
//               ? "You tend to feel noticeably better on days when you get enough sleep."
//               : "On lower-sleep days, your mood seems slightly more vulnerable.",
//         },
//         {
//           confidence: Math.min(exerciseDays.length, noExerciseDays.length),
//           strength: Math.abs(exerciseMoodDiff),
//           text:
//             exerciseMoodDiff > 1
//               ? "Days with physical activity usually come with a better mood."
//               : "When exercise drops, your mood often feels a bit flatter.",
//         },
//         {
//           confidence: Math.min(highScreen.length, lowScreen.length),
//           strength: Math.abs(screenStressDiff),
//           text:
//             screenStressDiff > 1
//               ? "Higher screen time often aligns with increased stress."
//               : "Keeping screen time lower seems to help your stress stay balanced.",
//         },
//       ];

//       insights.sort(
//         (a, b) =>
//           b.strength * b.confidence - a.strength * a.confidence
//       );

//       setInsight(insights[0]?.text ?? null);
//       setLoading(false);
//     };

//     generateInsight();
//   }, [supabase]);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-full">
//         <MutatingDots visible height="64" width="64" />
//       </div>
//     );
//   }

//   if (!insight) {
//     return (
//       <p className="text-muted-foreground text-center">
//         Keep journaling — insights start forming after a few consistent days.
//       </p>
//     );
//   }

//   return (
//     <div className="flex items-center justify-center h-full px-4 text-center">
//       <p className="text-lg font-medium leading-relaxed">
//        {insight}
//       </p>
//     </div>
//   );
// }
