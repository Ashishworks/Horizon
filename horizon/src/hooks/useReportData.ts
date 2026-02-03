"use client";

import { useEffect, useState } from "react";
import { ReportData } from "@/types/report";

export function useReportData(days: number) {
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        async function fetchReport() {
            setLoading(true);
            setError(null);

            try {
                const res = await fetch(`/api/report?days=${days}`, {
                    signal: controller.signal,
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch report");
                }

                const json: any = await res.json();

                const report: ReportData = {
                    snapshot: {
                        averages: {
                            mood: json.averages?.mood ?? null,
                            sleep: json.averages?.sleep ?? null,
                            stress: json.averages?.stress ?? null,
                        },
                    },

                    insights: Array.isArray(json.insights) ? json.insights : [],
                    habits: Array.isArray(json.habits) ? json.habits : [],
                    bestDays: Array.isArray(json.bestDays) ? json.bestDays : [],
                    worstDays: Array.isArray(json.worstDays) ? json.worstDays : [],
                    recommendations: Array.isArray(json.recommendations)
                        ? json.recommendations
                        : [],
                    trends: json.trends ?? {},
                    risk: json.risk ?? {
                        moodVolatility: 0,
                        sleepRegularity: 0,
                        stressConsistency: 0,
                        overall: "stable",
                    },
                };

                setData(report);
            } catch (err: any) {
                if (err.name === "AbortError") return;
                setError("Unable to generate report");
                setData(null);
            } finally {
                setLoading(false);
            }
        }

        fetchReport();
        return () => controller.abort();
    }, [days]);

    return { data, loading, error };
}
