import { geminiModel } from "@/lib/ai/gemini";

export type ChatIntent = "human" | "reflection" | "out_of_scope";

export async function detectChatIntent(
    message: string
): Promise<ChatIntent> {
    const prompt = `
Classify the user's message into exactly ONE category.

Categories:

human:
- greetings (hi, hiiii, helloooo, yo, hey)
- emotional expressions
- vague feelings
- conversational openers

reflection:
- questions about patterns, reasons, trends
- mentions of time (last week, usually, lately)
- questions that need personal data

out_of_scope:
- weather
- news
- stocks
- medical diagnosis
- advice or instructions
- general knowledge

Message:
"${message}"

Answer ONLY with:
human
reflection
or
out_of_scope
`;

    const res = await geminiModel.generateContent(prompt);
    const text = res.response.text().trim().toLowerCase();

    if (text.includes("human")) return "human";
    if (text.includes("reflection")) return "reflection";
    return "out_of_scope";
}
