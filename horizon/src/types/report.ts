// src/types/report.ts

export type SnapshotStats = {
    averages: {
        mood: number | null;
        sleep: number | null;
        stress: number | null;
    };
};

export type Insight = {
    text: string;
    confidence: "low" | "medium" | "high";
};

export type RiskProfile = {
    moodVolatility: number;
    sleepRegularity: number;
    stressConsistency: number;
    overall: "stable" | "watch" | "risk";
};

export type HabitConsistency = {
    name: string;
    consistency: number;
    trend: "up" | "down" | "flat";
};

export type DaySummary = {
    date: string;
    mood: number;
    sleepHours: number;
    notes: string[];
};

export type ReportData = {
    snapshot: SnapshotStats;   // ✅ ADD THIS

    insights: Insight[];
    risk: RiskProfile;
    habits: HabitConsistency[];
    bestDays: DaySummary[];
    worstDays: DaySummary[];
    trends: any;
    recommendations: string[];
};
