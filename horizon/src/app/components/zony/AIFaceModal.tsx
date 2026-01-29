"use client";

import { useEffect, useState } from "react";
import TimeRangeSelector from "@/app/dashboard/elements/TimeRangeSelector";
import Aiload from "../lottie/Aiload";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";


type AIFaceModalProps = {
    isOpen: boolean;
    isClosing: boolean;
    closeModal: () => void;
};

type Range = 7 | 30 | 90;

export default function AIFaceModal({
    isOpen,
    isClosing,
    closeModal,
}: AIFaceModalProps) {
    const [activeTab, setActiveTab] = useState<"overview" | "chat">("overview");

    const [range, setRange] = useState<Range>(7);               // user selection
    const [activeRange, setActiveRange] = useState<Range | null>(null); // currently shown overview

    const [loading, setLoading] = useState(false);
    const [overviewText, setOverviewText] = useState<string[] | null>(null);
    const [overviewCache, setOverviewCache] = useState<
        Partial<Record<Range, string[]>>
    >({});

    async function loadOverview(selectedRange: Range) {
        // Serve from cache
        if (overviewCache[selectedRange]) {
            setOverviewText(overviewCache[selectedRange]!);
            setActiveRange(selectedRange);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/ai/overview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ timeRange: `${selectedRange}d` }),
            });

            const data = await res.json();



            const explanationArray = data.explanation
                .split("\n")
                .map((line: string) => line.trim())
                .filter(Boolean);
            setOverviewCache((prev) => ({
                ...prev,
                [selectedRange]: explanationArray,
            }));


            setOverviewText(explanationArray);
            setActiveRange(selectedRange);
        } catch {
            setOverviewText(["Unable to load AI overview right now."]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (isOpen) {
            setActiveTab("overview");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const isCurrent = activeRange === range;

    return (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center">
            {/* Backdrop */}
            <div
                onClick={closeModal}
                className={`absolute inset-0 bg-black/30 backdrop-blur-md transition-opacity duration-200 ${isClosing ? "opacity-0" : "opacity-100"
                    }`}
            />

            {/* Modal */}
            <div
                className={`relative z-[9999] w-[95vw] h-[90vh] sm:w-[90vw] sm:h-[85vh] md:w-[85vw] md:h-[80vh]
 rounded-2xl 
bg-card text-card-foreground shadow-2xl border border-border overflow-hidden
transition-all duration-200 ease-out ${isClosing
                        ? "opacity-0 scale-95 translate-y-2"
                        : "opacity-100 scale-100 translate-y-0"
                    }`}
            >
                <div className="h-full p-3 sm:p-4 md:p-6
">
                    {/* Top Bar */}
                    <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4">
                        <div />

                        <div className="flex flex-col items-center">
                            <div className="mt-4">
                                <div className="relative flex w-[260px] sm:w-[300px] md:w-[360px]
 rounded-full border border-border bg-muted p-1 overflow-hidden">
                                    <div
                                        className="absolute top-1 left-1 h-[calc(100%-8px)] w-[calc(50%-4px)]
rounded-full bg-background shadow-sm transition-transform duration-300 ease-in-out"
                                        style={{
                                            transform:
                                                activeTab === "overview"
                                                    ? "translateX(0%)"
                                                    : "translateX(100%)",
                                        }}
                                    />

                                    <button
                                        onClick={() => setActiveTab("overview")}
                                        className={`relative z-10 flex-1 rounded-full px-3 py-2 text-xs sm:text-sm font-medium ${activeTab === "overview"
                                            ? "text-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        AI Overview
                                    </button>

                                    <button
                                        onClick={() => setActiveTab("chat")}
                                        className={`relative z-10 flex-1 rounded-full px-3 py-2 text-xs sm:text-sm font-medium ${activeTab === "chat"
                                            ? "text-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        Chat
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={closeModal}
                                className="h-10 w-10 rounded-full hover:bg-accent flex items-center justify-center text-xl"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Controls ABOVE dashed box */}
                    {activeTab === "overview" && (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-4 sm:mt-6">
                            <TimeRangeSelector value={range} onChange={setRange} />

                            <button
                                onClick={() => loadOverview(range)}
                                disabled={isCurrent || loading}
                                className={`
                  w-full sm:w-auto px-5 py-2 rounded-full text-sm font-medium transition
                  ${isCurrent
                                        ? "bg-muted text-muted-foreground cursor-default"
                                        : "bg-primary text-primary-foreground hover:opacity-90"
                                    }
                `}
                            >
                                {isCurrent
                                    ? "Currently showing"
                                    : loading
                                        ? "Generating…"
                                        : "See AI Overview"}
                            </button>
                        </div>
                    )}

                    {/* Content */}
                    <div className="mt-4 rounded-xl border border-dashed border-border h-[60%] sm:h-[65%] overflow-y-auto flex justify-center items-start pt-6">



                        {activeTab === "overview" ? (
                            <div className="max-w-4xl mx-auto px-6 text-center">

                                {loading ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-3">
                                        <Aiload size={200} />
                                        <p className="text-md text-muted-foreground text-center">
                                            Horizon is reviewing patterns from your last {range} days…
                                        </p>
                                    </div>

                                ) : overviewText ? (
                                    <div className="space-y-4">
                                        {overviewText.map((line, i) => (
                                            <TextGenerateEffect
                                                key={`${activeRange}-${i}`}
                                                words={line}
                                                className="text-base sm:text-lg leading-relaxed text-foreground"
                                            />
                                        ))}
                                    </div>

                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Select a time range to see your AI overview.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="text-base sm:text-lg font-semibold">Chat Mode</p>
                                <p className="text-sm mt-2 text-muted-foreground">
                                    AI chat interface under development
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
