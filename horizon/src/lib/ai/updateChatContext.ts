import { ChatContext } from "./chatTypes";

export function updateChatContext(
  prev: ChatContext = {},
  userMessage: string,
  aiReply: string
): ChatContext {
  const text = userMessage.toLowerCase();
  const next: ChatContext = { ...prev };

  // focus detection
  if (text.includes("sleep")) next.focus = "sleep";
  else if (text.includes("stress")) next.focus = "stress";
  else if (text.includes("mood") || text.includes("feel"))
    next.focus = "mood";
  else next.focus ??= "general";

  // time range switching
  if (text.includes("week")) next.timeRange = "7d";
  if (text.includes("month")) next.timeRange = "30d";
  if (text.includes("90")) next.timeRange = "90d";

  // store only a short insight
  next.lastInsight = aiReply.slice(0, 140);

  return next;
}
