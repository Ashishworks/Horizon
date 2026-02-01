export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatContext = {
  focus?: "general" | "mood" | "sleep" | "stress";
  timeRange?: "7d" | "30d" | "90d";
  lastInsight?: string;
  lastHumanStage?: "greeting" | "feeling" | "support";
};

