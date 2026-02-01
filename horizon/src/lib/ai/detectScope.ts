export type QuestionScope = "allowed" | "out_of_scope";

export function detectScope(message: string): QuestionScope {
  const text = message.toLowerCase();

  if (
    text.includes("weather") ||
    text.includes("temperature") ||
    text.includes("news") ||
    text.includes("stocks") ||
    text.includes("cricket") ||
    text.includes("football")
  ) {
    return "out_of_scope";
  }

  return "allowed";
}
