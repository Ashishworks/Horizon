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
        <div className="min-h-screen pdf-export-container bg-muted/30 pt-24 pb-10 ">

            <div className="max-w-7xl mx-auto px-4 space-y-6 ">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Mental Health Report</h1>
                        <p className="text-sm text-muted-foreground">
                            A thoughtful, AI-assisted reflection from what you've been journaling
                        </p>
                    </div>

                    {/* Range Selector */}
                   <div className="flex justify-center mt-4">
    <div className="relative flex w-[360px] rounded-full border bg-muted p-1">
        {/* sliding background with ring */}
        <div
            className="absolute top-1 left-1 h-[calc(100%-8px)] w-[calc(25%-2px)] 
                       rounded-full bg-background shadow-sm
                       ring-1 ring-black/10 dark:ring-white/20 
                       transition-transform duration-300 ease-in-out"
            style={{
                transform: `translateX(${
                    range === "1m" ? "0%" : 
                    range === "3m" ? "100%" : 
                    range === "6m" ? "200%" : "300%"
                })`,
            }}
        />

        {[
            { label: "1 month", value: "1m" },
            { label: "3 months", value: "3m" },
            { label: "6 months", value: "6m" },
            { label: "1 year", value: "1y" },
        ].map((opt) => (
            <button
                key={opt.value}
                onClick={() => setRange(opt.value as ReportRange)}
                className={`relative z-10 flex-1 py-2 text-sm font-medium transition-colors duration-300 ${
                    range === opt.value 
                        ? "text-foreground" 
                        : "text-muted-foreground hover:text-foreground"
                }`}
            >
                {opt.label}
            </button>
        ))}
    </div>
</div>

                </div>

                {/* Actions */}
               <div className="flex justify-center md:justify-end">
    <GeneratePDFButton />
</div>

                {/* Report Preview */}
                <div className="flex justify-center w-full overflow-hidden">
    <div className="w-full max-w-full flex justify-center py-4 md:py-0">
        <ReportSheet range={range} days={days} />
    </div>
</div>

            </div>
        </div>
    );
}
