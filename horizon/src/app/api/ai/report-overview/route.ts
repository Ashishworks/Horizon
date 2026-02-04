export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { buildUserMentalSummary } from "@/lib/intelligence/buildUserMentalSummary";
import { createClient } from "@/lib/supabase/server";
import type { UserMentalSummary } from "@/lib/intelligence/buildUserMentalSummary";
import { geminiModel } from "@/lib/ai/gemini";
import { redis } from "@/lib/redis"; // ✅ REDIS

type OverviewRequest = {
  timeRange: "7d" | "30d" | "90d";
};

async function generateOverviewExplanationLLM(
  summary: UserMentalSummary
): Promise<string> {
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
- Use words in range of 80-100

DATA (JSON):
${JSON.stringify(summary, null, 2)}

Explain this summary to the user.
Focus on patterns and trends only.
`;

  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();

    if (!auth?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { timeRange = "7d" } = (await req.json()) as OverviewRequest;

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
          "There isn't enough consistent data yet to generate meaningful insights. Keep journaling regularly, and I'll be able to reflect patterns soon.",
      });
    }

    // 🔹 REDIS CACHE (AI explanation only)
    const cacheKey = `ai-report-overview:${auth.user.id}:${timeRange}`;

    let explanation = await redis.get<string>(cacheKey);

    if (!explanation) {
      explanation = await generateOverviewExplanationLLM(summary);

      // cache for 10 minutes
      await redis.set(cacheKey, explanation, {
        ex: 600,
      });
    }

    return NextResponse.json({
      summary,
      explanation,
    });
  } catch (err) {
    console.error("AI REPORT OVERVIEW ERROR:", err);

    return NextResponse.json(
      { error: "Unexpected error", details: String(err) },
      { status: 500 }
    );
  }
}
