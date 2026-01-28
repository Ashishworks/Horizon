import { NextResponse } from "next/server";
import { buildUserMentalSummary } from "@/lib/intelligence/buildUserMentalSummary";
import { createClient } from "@/lib/supabase/server";
import type { UserMentalSummary } from "@/lib/intelligence/buildUserMentalSummary";

type OverviewRequest = {
    timeRange: "7d" | "30d" | "90d";
};
function generateOverviewExplanation(
    summary: UserMentalSummary
): string {
    const lines: string[] = [];

    if (summary.mood.average !== null) {
        lines.push(
            `Your average mood over this period was ${summary.mood.average}, with a ${summary.mood.trend} trend.`
        );
    }

    if (summary.sleep.averageHours !== null) {
        lines.push(
            `You slept an average of ${summary.sleep.averageHours} hours per night.`
        );
    }

    if (summary.stress.average !== null) {
        lines.push(
            `Your stress levels were generally ${summary.stress.trend} during this time.`
        );
    }

    if (summary.correlations.sleepMood !== null) {
        lines.push(
            `There appears to be a relationship between your sleep and mood.`
        );
    }

    lines.push(`Overall, your current risk level is ${summary.riskLevel}.`);

    return lines.join(" ");
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: auth } = await supabase.auth.getUser();

        if (!auth || !auth.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = (await req.json()) as OverviewRequest;
        const timeRange = body.timeRange ?? "7d";

        const { data: journals, error } = await supabase
            .from("journals")
            .select("*")
            .eq("user_id", auth.user.id)
            .order("date", { ascending: true });

        if (error || !journals) {
            return NextResponse.json(
                { error: "Failed to load journals" },
                { status: 500 }
            );
        }

        const summary = buildUserMentalSummary(journals, timeRange);

        // Guardrail: insufficient data
        if (!summary.dataQuality.sufficient) {
            return NextResponse.json({
                summary,
                explanation:
                    "There isn’t enough consistent data yet to generate meaningful insights. Keep journaling regularly, and I’ll be able to reflect patterns soon.",
            });
        }

        // 🔹 LLM explanation layer (placeholder for now)
        const explanation = generateOverviewExplanation(summary);

        return NextResponse.json({
            summary,
            explanation,
        });
    } catch (err) {
        return NextResponse.json(
            { error: "Unexpected error" },
            { status: 500 }
        );
    }
}
