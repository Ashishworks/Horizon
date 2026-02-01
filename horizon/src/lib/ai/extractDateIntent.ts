export type DateIntent =
  | { type: "single_day"; date: string }
  | { type: "range"; start: string; end: string }
  | { type: "none" };

export async function extractDateIntent(
  message: string
): Promise<DateIntent> {
  // for now keep it simple (LLM version later)
  const text = message.toLowerCase();

  const today = new Date();
  const toISO = (d: Date) => d.toISOString().slice(0, 10);

  if (text.includes("yesterday")) {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    return { type: "single_day", date: toISO(d) };
  }

  if (text.includes("last week")) {
    const end = new Date(today);
    end.setDate(end.getDate() - 1);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);

    return {
      type: "range",
      start: toISO(start),
      end: toISO(end),
    };
  }

  return { type: "none" };
}
