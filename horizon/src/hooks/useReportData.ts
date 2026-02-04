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

                const json = await res.json();

                const report: ReportData = {
                    /* -------------------------
                       SNAPSHOT (from API)
                    ------------------------- */
                    snapshot: {
                        averages: {
                            mood: json.averages?.mood ?? null,
                            sleep: json.averages?.sleep_hours ?? null,
                            stress: json.averages?.stress_level ?? null,
                        },
                    },

                    /* -------------------------
                       HABITS + TRENDS
                    ------------------------- */
                    habits: json.habits ?? {},
                    trends: Array.isArray(json.trends) ? json.trends : [],

                    /* -------------------------
                       REQUIRED DEFAULTS (OPTION 1)
                       These WILL be filled by AI later
                    ------------------------- */
                    insights: json.insights ?? [],
                    bestDays: json.bestDays ?? [],
                    worstDays: json.worstDays ?? [],
                    recommendations: json.recommendations ?? [],
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
