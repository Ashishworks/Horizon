"use client";

import { useState } from "react";
import ReportSheet from "../components/report/ReportSheet";
import GeneratePDFButton from "../components/report/GeneratePDFButton";

export type ReportRange = "1m" | "3m" | "6m" | "1y";

export const RANGE_TO_DAYS: Record<ReportRange, number> = {
    "1m": 30,
    "3m": 90,
    "6m": 180,
    "1y": 365,
};

export default function ReportPage() {
    const [range, setRange] = useState<ReportRange>("1y");
    const days = RANGE_TO_DAYS[range];

    return (
        <div className="min-h-screen bg-muted/30 pt-24 pb-10">

            <div className="max-w-7xl mx-auto px-4 space-y-6 ">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Mental Health Report</h1>
                        <p className="text-sm text-muted-foreground">
                            AI-generated summary based on your journal entries
                        </p>
                    </div>

                    {/* Range Selector */}
                    <div className="flex flex-wrap gap-2">
                        {[
                            { label: "1 month", value: "1m" },
                            { label: "3 months", value: "3m" },
                            { label: "6 months", value: "6m" },
                            { label: "1 year", value: "1y" },
                        ].map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setRange(opt.value as ReportRange)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition ${range === opt.value
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-background border border-border hover:bg-accent"
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                {/* <div className="flex justify-end">
                    <GeneratePDFButton />
                </div> */}

                {/* Report Preview */}
                <div className="flex justify-center overflow-x-auto">
                    <ReportSheet range={range} days={days} />
                </div>

            </div>
        </div>
    );
}
