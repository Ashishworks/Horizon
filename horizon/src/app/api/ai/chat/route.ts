import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { geminiModel } from "@/lib/ai/gemini";
import { updateChatContext } from "@/lib/ai/updateChatContext";
import { ChatContext } from "@/lib/ai/chatTypes";
import { detectChatIntent } from "@/lib/ai/detectChatIntent";
import { buildChatMentalSummary } from "@/lib/intelligence/buildChatMentalSummary";

/* -------------------- helpers -------------------- */

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function normalizeJournal(row: any) {
  return {
    date: row.date,

    mood: clamp(row.mood ?? 5, 1, 10),
    stress: clamp(row.stress_level ?? 5, 1, 10),
    sleepHours: clamp(row.sleep_hours ?? 6, 0, 12),
    productivity: clamp(row.productivity ?? 5, 1, 10),
    overthinking: clamp(row.overthinking ?? 5, 1, 10),

    screenTimeHours: clamp(
      (row.screen_work ?? 0) + (row.screen_entertainment ?? 0),
      0,
      24
    ),

    exercise: Array.isArray(row.exercise) && row.exercise.length > 0,

    dietScore:
      row.diet_status === "Good"
        ? 1
        : row.diet_status === "Bad"
          ? 0
          : 0.5,

    socialScore:
      row.social_time === "Decent"
        ? 1
        : row.social_time === "Zero"
          ? 0
          : 0.5,
  };
}

/* -------------------- route -------------------- */

export async function POST(req: Request) {
  try {
    const { message, context } = await req.json();

    /* 1️⃣ Supabase client */
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        reply: "Please sign in to continue.",
        nextContext: context,
      });
    }

    /* 2️⃣ Out-of-scope guard */
    const intent = await detectChatIntent(message);
    if (intent === "out_of_scope") {
      return NextResponse.json({
        reply:
          "I can’t help with that — but I’m here to talk about how you’re feeling.",
        nextContext: context,
      });
    }

    /* 3️⃣ Date window (last 14 days) */
    const endDate = new Date().toISOString().slice(0, 10);
    const startDate = new Date(
      Date.now() - 13 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .slice(0, 10);

    /* 4️⃣ Fetch journals (schema-aligned) */
    const { data: rows, error } = await supabase
      .from("journals")
      .select(`
        date,
        mood,
        stress_level,
        sleep_hours,
        productivity,
        overthinking,
        screen_work,
        screen_entertainment,
        exercise,
        diet_status,
        social_time
      `)
      .eq("user_id", user.id)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });

    if (error) {
      console.error("JOURNAL FETCH ERROR:", error);
    }


    /* 5️⃣ Normalize journals (CRITICAL STEP) */
    const normalizedJournals = (rows ?? []).map(normalizeJournal);

    /* 6️⃣ Build chat mental summary */
    const summary = buildChatMentalSummary(normalizedJournals, {
      startDate,
      endDate,
    });

    console.log("CHAT SUMMARY:", summary);

    /* 7️⃣ LLM prompt (normal bot + data-aware) */
    const prompt = `
You are Horizon, a calm and empathetic conversational AI.

Behavior:
- Chat naturally like a normal assistant.
- Respond to greetings, emotions, and casual messages.
- You may talk even if no data is available.

Data usage:
- You have access to the user's mental-health data below.
- Use it ONLY if the user asks about mood, sleep, stress, or patterns.
- If data is partial, explain gently.
- If data for a specific day or range does not exist, say so honestly.
- If there is no data at all, continue chatting normally.

Boundaries:
- Do NOT answer questions about weather, news, or external facts.
- Gently redirect out-of-scope questions back to feelings.
- Do NOT give medical advice or diagnoses.

User message:
"${message}"

User mental data:
${JSON.stringify(summary, null, 2)}
`;

    const res = await geminiModel.generateContent(prompt);
    const reply = res.response.text();

    /* 8️⃣ Update context */
    const nextContext = updateChatContext(
      context as ChatContext,
      message,
      reply
    );

    return NextResponse.json({
      reply,
      nextContext,
      debug: summary, // 🔥 REMOVE later
    });
  } catch (err) {
    console.error("CHAT ROUTE ERROR:", err);
    return NextResponse.json(
      { error: "Chat route crashed" },
      { status: 500 }
    );
  }
}
