import { ChatContext, ChatMessage } from "./chatTypes";

export function updateChatContext(
  prev: ChatContext = {},
  userMessage: string,
  aiReply: string
): ChatContext {
  const text = userMessage.toLowerCase();
  
  // 1. Get existing messages or empty array
  const previousMessages = prev.messages || [];

  // 2. Explicitly type the new array as ChatMessage[] 
  // to satisfy the literal type requirements for "role"
  const updatedMessages: ChatMessage[] = [
    ...previousMessages,
    { role: "user", content: userMessage },
    { role: "assistant", content: aiReply },
  ];

  // 3. Keep only the last 2 exchanges (4 messages total)
  const trimmedMessages = updatedMessages.slice(-4);

  const next: ChatContext = { 
    ...prev, 
    messages: trimmedMessages 
  };

  /* --- Focus & Metadata Logic --- */
  
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