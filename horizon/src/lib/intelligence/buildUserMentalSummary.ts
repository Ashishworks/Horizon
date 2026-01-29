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

// TEMP journal type
type JournalEntry = {
    date: string;
    mood?: number;
    stress?: number;
    sleep_hours?: number;
    exercised?: boolean;
};

/* -------------------- helpers -------------------- */

function computeAverage(values: number[]): number | null {
    if (values.length === 0) return null;
    const sum = values.reduce((a, b) => a + b, 0);
    return Number((sum / values.length).toFixed(2));
}

function computeTrend(values: number[]): Trend {
    if (values.length < 4) return "flat";

    const mid = Math.floor(values.length / 2);
    const firstAvg = computeAverage(values.slice(0, mid));
    const secondAvg = computeAverage(values.slice(mid));

    if (firstAvg === null || secondAvg === null) return "flat";

    const diff = secondAvg - firstAvg;
    if (diff > 0.3) return "up";
    if (diff < -0.3) return "down";
    return "flat";
}

function computeVolatility(values: number[]): number | null {
    if (values.length < 2) return null;

    const avg = computeAverage(values);
    if (avg === null) return null;

    const variance =
        values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;

    return Number(Math.sqrt(variance).toFixed(2));
}

function computeSleepConsistency(values: number[]): number | null {
    // consistency = inverse of volatility
    const volatility = computeVolatility(values);
    if (volatility === null) return null;

    return Number(Math.max(0, 10 - volatility).toFixed(2));
}

function computeRiskLevel(
    moodTrend: Trend,
    moodVolatility: number | null,
    sleepAvg: number | null,
    stressAvg: number | null
): RiskLevel {
    let score = 0;

    if (moodTrend === "down") score += 2;
    if (moodVolatility !== null && moodVolatility > 2) score += 1;
    if (sleepAvg !== null && sleepAvg < 6) score += 1;
    if (stressAvg !== null && stressAvg > 7) score += 1;

    if (score >= 4) return "high";
    if (score >= 2) return "moderate";
    return "low";
}

function computeCorrelation(x: number[], y: number[]): number | null {
    if (x.length !== y.length || x.length < 3) return null;

    const meanX = computeAverage(x);
    const meanY = computeAverage(y);

    if (meanX === null || meanY === null) return null;

    let numerator = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < x.length; i++) {
        const dx = x[i] - meanX;
        const dy = y[i] - meanY;

        numerator += dx * dy;
        denomX += dx * dx;
        denomY += dy * dy;
    }

    const denominator = Math.sqrt(denomX * denomY);
    if (denominator === 0) return null;

    return Number((numerator / denominator).toFixed(2));
}
/* -------------------- main -------------------- */

export function buildUserMentalSummary(
    journals: JournalEntry[],
    timeRange: TimeRange
): UserMentalSummary {
    const sorted = [...journals].sort((a, b) =>
        a.date.localeCompare(b.date)
    );

    const moodValues = sorted
        .map(j => j.mood)
        .filter((v): v is number => typeof v === "number");

    const sleepValues = sorted
        .map(j => j.sleep_hours)
        .filter((v): v is number => typeof v === "number");

    const stressValues = sorted
        .map(j => j.stress)
        .filter((v): v is number => typeof v === "number");

    const moodAverage = computeAverage(moodValues);
    const moodTrend = computeTrend(moodValues);
    const moodVolatility = computeVolatility(moodValues);

    const sleepAverage = computeAverage(sleepValues);
    const sleepConsistency = computeSleepConsistency(sleepValues);

    const stressAverage = computeAverage(stressValues);
    const stressTrend = computeTrend(stressValues);

    const expectedDays =
        timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;

    const daysPresent = sorted.length;
    const daysMissing = Math.max(0, expectedDays - daysPresent);

    const riskLevel = computeRiskLevel(
        moodTrend,
        moodVolatility,
        sleepAverage,
        stressAverage
    );
    const sleepMoodPairs = sorted.filter(
        j => typeof j.sleep_hours === "number" && typeof j.mood === "number"
    );

    const sleepValuesForCorr = sleepMoodPairs.map(j => j.sleep_hours as number);
    const moodValuesForCorr = sleepMoodPairs.map(j => j.mood as number);

    const sleepMoodCorrelation = computeCorrelation(
        sleepValuesForCorr,
        moodValuesForCorr
    );

    const exerciseStressPairs = sorted.filter(
        j => typeof j.stress === "number" && typeof j.exercised === "boolean"
    );

    const exerciseBinary = exerciseStressPairs.map(j => (j.exercised ? 1 : 0));
    const stressValuesForCorr = exerciseStressPairs.map(j => j.stress as number);

    const exerciseStressCorrelation = computeCorrelation(
        exerciseBinary,
        stressValuesForCorr
    );


    return {
        timeRange,

        mood: {
            average: moodAverage,
            trend: moodTrend,
            volatility: moodVolatility,
        },

        sleep: {
            averageHours: sleepAverage,
            consistency: sleepConsistency,
        },

        stress: {
            average: stressAverage,
            trend: stressTrend,
        },

        correlations: {
            sleepMood: sleepMoodCorrelation,
            exerciseStress: exerciseStressCorrelation,
        },


        riskLevel,

        dataQuality: {
            daysPresent,
            daysMissing,
            sufficient: daysPresent >= Math.floor(expectedDays * 0.6),
        },
    };
}


