export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { buildUserMentalSummary } from "@/lib/intelligence/buildUserMentalSummary";
import { createClient } from "@/lib/supabase/server";
import type { UserMentalSummary } from "@/lib/intelligence/buildUserMentalSummary";
import { geminiModel } from "@/lib/ai/gemini";



type OverviewRequest = {
    timeRange: "7d" | "30d" | "90d";
};
async function generateOverviewExplanationLLM(
    summary: UserMentalSummary
): Promise<string> {
    console.log("GEMINI KEY EXISTS:", !!process.env.GEMINI_API_KEY);

    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing");
    }

    const prompt = `
You are a mental health reflection assistant.

STRICT RULES:
- Use ONLY the data provided below.
- Do NOT compute new numbers.
- Do NOT guess missing data.
- Do NOT diagnose or give medical advice.
- If a field is null, do NOT mention it.
- Use calm, supportive, non-clinical language.
- Keep it concise (4-6 sentences).

DATA (JSON):
${JSON.stringify(summary, null, 2)}

Explain this summary to the user.
Focus on patterns and trends only.
use words in range of 90-120 
`;

    const result = await geminiModel.generateContent(prompt);
    return result.response.text();
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


        const explanation = await generateOverviewExplanationLLM(summary);


        return NextResponse.json({
            summary,
            explanation,
        });
    } catch (err) {
        console.error("AI OVERVIEW ERROR:", err);
        return NextResponse.json(
            {
                error: "Unexpected error",
                details: String(err),
            },
            { status: 500 }
        );
    }
}
