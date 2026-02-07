import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { geminiModel } from "@/lib/ai/gemini";
import { updateChatContext } from "@/lib/ai/updateChatContext";
import { ChatContext } from "@/lib/ai/chatTypes";
import { detectChatIntent } from "@/lib/ai/detectChatIntent";
import { buildChatMentalSummary } from "@/lib/intelligence/buildChatMentalSummary";

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
    screenTimeHours: clamp((row.screen_work ?? 0) + (row.screen_entertainment ?? 0), 0, 24),
    exercise: Array.isArray(row.exercise) && row.exercise.length > 0,
    dietScore: row.diet_status === "Good" ? 1 : row.diet_status === "Bad" ? 0 : 0.5,
    socialScore: row.social_time === "Decent" ? 1 : row.social_time === "Zero" ? 0 : 0.5,
  };
}

export async function POST(req: Request) {
  try {
    const { message, context } = await req.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ reply: "Please sign in to continue.", nextContext: context });
    }

    const intent = await detectChatIntent(message);
    if (intent === "out_of_scope") {
      return NextResponse.json({
        reply: "I can't help with that — but I'm here to talk about how you're feeling.",
        nextContext: context,
      });
    }

    // Date range for mental data
    const endDate = new Date().toISOString().slice(0, 10);
    const startDate = new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const { data: rows } = await supabase
      .from("journals")
      .select(`date, mood, stress_level, sleep_hours, productivity, overthinking, screen_work, screen_entertainment, exercise, diet_status, social_time`)
      .eq("user_id", user.id)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });

    const normalizedJournals = (rows ?? []).map(normalizeJournal);
    const summary = buildChatMentalSummary(normalizedJournals, { startDate, endDate });

    /* --- History Extraction --- */
    const history = (context as ChatContext)?.messages || [];
    const historyString = history
      .map((m) => `${m.role === "user" ? "User" : "Horizon"}: ${m.content}`)
      .join("\n");

    const prompt = `
You are Zony, a calm and empathetic conversational AI.

Behavior:
- Respond naturally and concisely.
- Use previous conversation history to stay in context.

Data Usage:
- Use the mental data below ONLY if the user asks about their habits or feelings.
- If data is missing for specific days, be honest.

Conversation History:
${historyString || "No previous history."}

User Mental Data:
${JSON.stringify(summary, null, 2)}

Current User Message:
"${message}"
`;

    const res = await geminiModel.generateContent(prompt);
    const reply = res.response.text();

    const nextContext = updateChatContext(context as ChatContext, message, reply);

    return NextResponse.json({ reply, nextContext });
  } catch (err) {
    console.error("CHAT ROUTE ERROR:", err);
    return NextResponse.json({ error: "Chat route crashed" }, { status: 500 });
  }
}