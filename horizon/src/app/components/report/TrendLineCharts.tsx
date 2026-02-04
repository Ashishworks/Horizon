"use client";

import { ResponsiveLine } from "@nivo/line";

const METRICS = [
    { key: "mood", label: "Mood", yLabel: "Mood Score" },
    { key: "sleep", label: "Sleep Hours", yLabel: "Hours" },
    { key: "stress", label: "Stress", yLabel: "Stress Level" },
    { key: "productivity", label: "Productivity", yLabel: "Productivity Score" },
];

export default function TrendLineCharts({
    trends,
}: {
    trends?: any[];
}) {
    if (!Array.isArray(trends) || trends.length === 0) {
        return <p className="text-sm text-gray-500">No trend data available.</p>;
    }

    const renderChart = (key: string, label: string, yLabel: string) => {
        const data = [
            {
                id: label,
                data: trends
                    .filter((t) => t[key] !== null && t[key] !== undefined)
                    .map((t) => ({ x: t.date, y: t[key] })),
            },
        ];

        if (data[0].data.length < 2) return null;

        return (
            <div key={key} className="mb-12">
                <h4 className="text-md font-semibold mb-2 text-black">
                    {label}
                </h4>

                <div className="h-[350px]">
                    <ResponsiveLine
                        data={data}
                        colors={["#000000"]}
                        margin={{ top: 20, right: 30, bottom: 100, left: 50 }}
                        xScale={{ type: "point" }}
                        yScale={{ type: "linear", min: "auto", max: "auto" }}
                        axisBottom={{
                            tickRotation: -45,
                            legend: "Date",
                            /* 2. Push the "Date" legend further down (from 40 to 60 or 70) */
                            legendOffset: 65,
                            legendPosition: "middle",
                        }}
                        axisLeft={{
                            legend: yLabel,
                            legendOffset: -40,
                            legendPosition: "middle",
                        }}
                        theme={{
                            axis: {
                                domain: {
                                    line: {
                                        stroke: "#000000",
                                        strokeWidth: 1,
                                    },
                                },
                                ticks: {
                                    line: {
                                        stroke: "#000000",
                                        strokeWidth: 1,
                                    },
                                    text: {
                                        fill: "#000000",
                                        fontSize: 11,
                                    },
                                },
                                legend: {
                                    text: {
                                        fill: "#000000",
                                        fontSize: 12,
                                    },
                                },
                            },
                            grid: {
                                line: {
                                    stroke: "#e5e7eb", // light gray grid (safe)
                                    strokeWidth: 1,
                                },
                            },
                        }}
                        enablePoints={false}
                        enableArea={false}
                        animate={false}
                        useMesh={false}
                    />
                </div>
            </div>
        );
    };

    return (
        <section className="mt-12">
            <h3 className="text-lg font-semibold mb-6 text-black">
                Mental Health Trends
            </h3>

            {METRICS.map((m) =>
                renderChart(m.key, m.label, m.yLabel)
            )}
        </section>
    );
}
