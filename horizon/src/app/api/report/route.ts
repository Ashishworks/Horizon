import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const rawDays = Number(searchParams.get("days"));
    const days = Number.isFinite(rawDays) && rawDays > 0 ? rawDays : 365;

    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    const from = fromDate.toISOString().slice(0, 10);

    const { data: entries, error } = await supabase
        .from("journals")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", from);

    if (error || !entries) {
        return NextResponse.json({ error }, { status: 500 });
    }

    const totalDays = entries.length;

    /* -----------------------------
       SORTED ENTRIES
    ----------------------------- */
    const sorted = [...entries].sort((a, b) =>
        a.date.localeCompare(b.date)
    );

    /* -----------------------------
       TRENDS
    ----------------------------- */
    const trends = sorted.map((e) => ({
        date: e.date,
        mood: e.mood ?? null,
        sleep: e.sleep_hours ?? null,
        stress: e.stress_level ?? null,
        productivity: e.productivity ?? null,
    }));

    /* -----------------------------
       AVERAGES (SAFE)
    ----------------------------- */
    const avg = (key: string) => {
        const valid = sorted.filter((e) => typeof e[key] === "number");
        if (valid.length === 0) return null;
        return (
            valid.reduce((s, e) => s + e[key], 0) / valid.length
        );
    };

    /* -----------------------------
       HABITS
    ----------------------------- */
    const exerciseDays = sorted.filter(
        (e) => Array.isArray(e.exercise) && e.exercise.length > 0
    ).length;

    /* -----------------------------
       BEST & WORST DAYS (MOOD)
    ----------------------------- */

    /* -----------------------------
       HABITS (WITH TREND LOGIC)
    ----------------------------- */
    const habitConsistency = [];

    if (totalDays > 0) {
        // 1. Calculate overall consistency
        const exerciseDays = sorted.filter(
            (e) => Array.isArray(e.exercise) && e.exercise.length > 0
        ).length;
        const exerciseConsistency = Math.round((exerciseDays / totalDays) * 100);

        // 2. Calculate Trend (Split data into two halves)
        const midpoint = Math.floor(sorted.length / 2);
        const firstHalf = sorted.slice(0, midpoint);
        const secondHalf = sorted.slice(midpoint);

        const getConsistency = (days: any[]) => {
            if (days.length === 0) return 0;
            const count = days.filter(e => Array.isArray(e.exercise) && e.exercise.length > 0).length;
            return (count / days.length) * 100;
        };

        const firstHalfAvg = getConsistency(firstHalf);
        const secondHalfAvg = getConsistency(secondHalf);

        // Define trend based on the difference
        let trend: "up" | "down" | "flat" = "flat";
        const diff = secondHalfAvg - firstHalfAvg;

        if (diff > 5) trend = "up";
        else if (diff < -5) trend = "down";

        habitConsistency.push({
            name: "Exercise",
            consistency: exerciseConsistency,
            trend: trend,
        });
    }

    const toDaySummary = (e: any) => {
        const notes: string[] = [];

        if (typeof e.sleep_hours === "number" && e.sleep_hours < 6) {
            notes.push("Low sleep");
        }

        if (typeof e.stress_level === "number" && e.stress_level > 6) {
            notes.push("High stress");
        }

        if (typeof e.productivity === "number" && e.productivity >= 7) {
            notes.push("High productivity");
        }

        if (typeof e.overthinking === "number" && e.overthinking > 6) {
            notes.push("High overthinking");
        }

        return {
            date: e.date,
            mood: e.mood,
            sleepHours: e.sleep_hours ?? 0,
            notes,
        };
    };

    const moodDays = sorted.filter(
        (e) => typeof e.mood === "number"
    );

    const bestDays = [...moodDays]
        .sort((a, b) => b.mood - a.mood)
        .slice(0, 3)
        .map(toDaySummary);

    const worstDays = [...moodDays]
        .sort((a, b) => a.mood - b.mood)
        .slice(0, 3)
        .map(toDaySummary);


    /* -----------------------------
       RISK CALCULATION (REAL)
    ----------------------------- */
    const moodValues = moodDays.map((d) => d.mood);
    const moodVolatility =
        moodValues.length > 1
            ? Math.min(
                100,
                Math.round(
                    moodValues.reduce(
                        (s, v, i, arr) =>
                            i === 0 ? 0 : s + Math.abs(v - arr[i - 1]),
                        0
                    ) /
                    (moodValues.length - 1) *
                    20
                )
            )
            : 0;

    const sleepValues = sorted
        .filter((e) => typeof e.sleep_hours === "number")
        .map((e) => e.sleep_hours);

    const sleepRegularity =
        sleepValues.length > 1
            ? Math.max(
                0,
                100 -
                Math.round(
                    sleepValues.reduce(
                        (s, v, i, arr) =>
                            i === 0
                                ? 0
                                : s + Math.abs(v - arr[i - 1]),
                        0
                    ) *
                    10
                )
            )
            : 100;

    let overall: "stable" | "moderate" | "high" = "stable";
    if (moodVolatility > 60) overall = "high";
    else if (moodVolatility > 35) overall = "moderate";

    /* -----------------------------
       INSIGHTS (REAL, SIMPLE)
    ----------------------------- */
    const insights = [];
            // 1. Add Mood Insight
const avgMood = avg("mood");
if (avgMood !== null && avgMood > 7) {
    insights.push({
        text: "Your overall mood is trending high. This correlates with your current routines.",
        confidence: "medium",
    });
}

// 2. Add Volatility Insight
if (moodVolatility > 40) {
    insights.push({
        text: "Significant mood fluctuations detected. Consider identifying external triggers.",
        confidence: "high",
    });
}

// 3. Add Overthinking Insight
const avgOverthinking = avg("overthinking");
if (avgOverthinking !== null && avgOverthinking > 6) {
    insights.push({
        text: "High levels of overthinking are being reported frequently.",
        confidence: "medium",
    });
}

    const avgSleep = avg("sleep_hours");

    if (avgSleep !== null && avgSleep < 6) {
        insights.push({
            text: "Your average sleep duration is low. Poor sleep may be affecting mood and focus.",
            confidence: "high",
        });
    }


    const avgStress = avg("stress_level");

    if (avgStress !== null && avgStress > 6) {
        insights.push({
            text: "Stress levels have been consistently high during this period.",
            confidence: "medium",
        });
    }

    /* -----------------------------
    RECOMMENDATIONS (DYNAMIC)
----------------------------- */
    const recommendations: string[] = [];

    if (avgSleep !== null && avgSleep < 7) {
        recommendations.push("Prioritize a consistent sleep schedule to improve cognitive function.");
    }

    if (moodVolatility > 50) {
        recommendations.push("Consider tracking triggers for mood shifts to identify patterns.");
    }

    if (avgStress !== null && avgStress > 7) {
        recommendations.push("Incorporate short mindfulness or breathing exercises during high-stress windows.");
    }

    // Logic based on habit consistency
    const exercise = habitConsistency.find(h => h.name === "Exercise");
    if (exercise && exercise.consistency < 40) {
        recommendations.push("Increasing physical activity frequency may help stabilize your mood.");
    }

    // Fallback if everything is looking great
    if (recommendations.length === 0) {
        recommendations.push("Maintain your current routines; consistency is key to your recent stability.");
    }
    /* -----------------------------
       RESPONSE
    ----------------------------- */
    return NextResponse.json({
        meta: {
            totalDays,
            from,
            to: new Date().toISOString().slice(0, 10),
        },

        averages: {
            mood: avg("mood"),
            sleep_hours: avg("sleep_hours"),
            productivity: avg("productivity"),
            stress_level: avg("stress_level"),
            overthinking: avg("overthinking"),
        },

        habits: habitConsistency,

        trends,
        bestDays,
        worstDays,

        risk: {
            moodVolatility,
            sleepRegularity,
            stressConsistency: 100 - moodVolatility,
            overall,
        },

        insights,
        recommendations,
    });
}
