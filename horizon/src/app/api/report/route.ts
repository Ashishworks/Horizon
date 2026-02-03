import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const days = Number(searchParams.get("days") || 365);

    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const { data: entries, error } = await supabase
        .from("journals")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", fromDate.toISOString().split("T")[0]);

    if (error || !entries) {
        return NextResponse.json({ error }, { status: 500 });
    }

    const totalDays = entries.length;

    // ✅ trends at top level
    const trends = entries
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((e) => ({
            date: e.date,
            mood: e.mood ?? null,
            sleep: e.sleep_hours ?? null,
            stress: e.stress_level ?? null,
            productivity: e.productivity ?? null,
        }));

    const avg = (key: string) =>
        totalDays === 0
            ? 0
            : entries.reduce((s, e) => s + (e[key] ?? 0), 0) / totalDays;

    const countBy = (key: string) =>
        entries.reduce((acc: any, e: any) => {
            const v = e[key] ?? "Unknown";
            acc[v] = (acc[v] || 0) + 1;
            return acc;
        }, {});

    const exerciseDays = entries.filter(
        (e) => Array.isArray(e.exercise) && e.exercise.length > 0
    ).length;

    return NextResponse.json({
        meta: {
            totalDays,
            from: fromDate.toISOString().split("T")[0],
            to: new Date().toISOString().split("T")[0],
        },

        averages: {
            mood: avg("mood"),
            sleep_hours: avg("sleep_hours"),
            productivity: avg("productivity"),
            stress_level: avg("stress_level"),
            overthinking: avg("overthinking"),
        },

        habits: {
            exercise: {
                yes: exerciseDays,
                no: totalDays - exerciseDays,
            },
        },

        distributions: {
            sleep_quality: countBy("sleep_quality"),
            diet_status: countBy("diet_status"),
            social_time: countBy("social_time"),
            negative_thoughts: countBy("negative_thoughts"),
        },

        trends, // ✅ CORRECT PLACE
    });
}
