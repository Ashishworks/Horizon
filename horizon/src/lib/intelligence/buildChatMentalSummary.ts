import {
  buildUserMentalSummary,
  UserMentalSummary,
} from "./buildUserMentalSummary";

type JournalEntry = {
  date: string;
  mood?: number;
  stress?: number;
  sleep_hours?: number;
  exercised?: boolean;
};

export type ChatMentalSummary = UserMentalSummary & {
  meta: {
    dateRange: {
      start: string;
      end: string;
    };
    daysPresent: number;
    daysRequested: number | null;
    coverage: "none" | "partial" | "full";
    missingDates?: string[];
  };
};

/**
 * Chat adapter over buildUserMentalSummary
 * - Uses SAME metrics & math
 * - Adds coverage + date context
 */
export function buildChatMentalSummary(
  journals: JournalEntry[],
  options: {
    startDate: string;
    endDate: string;
  }
): ChatMentalSummary {
  const { startDate, endDate } = options;

  // 1️⃣ Reuse existing summary logic
  const baseSummary = buildUserMentalSummary(
    journals,
    "30d" // dummy range, we override semantics below
  );

  // 2️⃣ Date math
  const start = new Date(startDate);
  const end = new Date(endDate);

  const daysRequested =
    Math.floor(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

  const daysPresent = journals.length;

  let coverage: "none" | "partial" | "full" = "none";
  if (daysPresent === 0) coverage = "none";
  else if (daysPresent < daysRequested) coverage = "partial";
  else coverage = "full";

  // 3️⃣ Missing dates (optional but powerful)
  const presentDates = new Set(journals.map((j) => j.date));
  const missingDates: string[] = [];

  for (let i = 0; i < daysRequested; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    if (!presentDates.has(iso)) {
      missingDates.push(iso);
    }
  }

  // 4️⃣ Return enriched summary
  return {
    ...baseSummary,

    meta: {
      dateRange: {
        start: startDate,
        end: endDate,
      },
      daysPresent,
      daysRequested,
      coverage,
      missingDates:
        coverage === "partial" ? missingDates : undefined,
    },
  };
}
