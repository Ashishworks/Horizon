// src/lib/intelligence/buildUserMentalSummary.ts

export type TimeRange = "7d" | "30d" | "90d";

export type Trend = "up" | "down" | "flat";
export type RiskLevel = "low" | "moderate" | "high";

export type UserMentalSummary = {
  timeRange: TimeRange;

  mood: {
    average: number | null;
    trend: Trend;
    volatility: number | null;
  };

  sleep: {
    averageHours: number | null;
    consistency: number | null;
  };

  stress: {
    average: number | null;
    trend: Trend;
  };

  correlations: {
    sleepMood: number | null;
    exerciseStress: number | null;
  };

  riskLevel: RiskLevel;

  dataQuality: {
    daysPresent: number;
    daysMissing: number;
    sufficient: boolean;
  };
};

// TEMP: raw journal type (we'll refine later)
type JournalEntry = {
  date: string;
  mood?: number;
  stress?: number;
  sleep_hours?: number;
  exercised?: boolean;
};

export function buildUserMentalSummary(
  journals: JournalEntry[],
  timeRange: TimeRange
): UserMentalSummary {
  // ⚠️ Placeholder logic — real computation comes next
  return {
    timeRange,

    mood: {
      average: null,
      trend: "flat",
      volatility: null,
    },

    sleep: {
      averageHours: null,
      consistency: null,
    },

    stress: {
      average: null,
      trend: "flat",
    },

    correlations: {
      sleepMood: null,
      exerciseStress: null,
    },

    riskLevel: "low",

    dataQuality: {
      daysPresent: journals.length,
      daysMissing: 0,
      sufficient: journals.length >= 7,
    },
  };
}
