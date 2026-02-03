import { ResponsiveLine } from "@nivo/line";

const METRIC_COLORS: Record<string, string> = {
    Mood: "#000000",          // blue
    "Sleep Hours": "#16a34a", // green
    Stress: "#dc2626",        // red
    Productivity: "#7c3aed", // purple
};

export default function TrendLineCharts({
    trends,
}: {
    trends?: any[];
}) {
    if (!Array.isArray(trends) || trends.length === 0) {
        return (
            <p className="text-sm text-gray-500">
                No trend data available.
            </p>
        );
    }

    const buildSeries = (key: string, label: string) => ({
        id: label,
        color: METRIC_COLORS[label],
        data: trends
            .filter((t) => t[key] !== null && t[key] !== undefined)
            .map((t) => ({
                x: t.date,
                y: t[key],
            })),
    });

    const data = [
        buildSeries("mood", "Mood"),
        buildSeries("sleep", "Sleep Hours"),
        buildSeries("stress", "Stress"),
        buildSeries("productivity", "Productivity"),
    ].filter((s) => s.data.length > 0);

    if (data.length === 0) {
        return (
            <p className="text-sm text-gray-500">
                Not enough data to render trends.
            </p>
        );
    }

    return (
        <section className="mt-12">
            <h3 className="text-lg font-semibold mb-4">
                Mental Health Trends
            </h3>

            <div className="h-[350px]">
                <ResponsiveLine
                    data={data}
                    colors={(d) => d.color as string}
                    margin={{ top: 20, right: 30, bottom: 60, left: 50 }}
                    xScale={{ type: "point" }}
                    yScale={{ type: "linear", min: "auto", max: "auto" }}
                    axisBottom={{
                        tickRotation: -45,
                        legend: "Date",
                        legendOffset: 50,
                        legendPosition: "middle",
                    }}
                    axisLeft={{
                        legend: "Score / Hours",
                        legendOffset: -40,
                        legendPosition: "middle",
                    }}
                    enablePoints={false}
                    enableArea={false}
                    animate={false}
                    useMesh={false}
                    legends={[
                        {
                            anchor: "bottom",
                            direction: "row",
                            justify: false,
                            translateY: 70,
                            itemWidth: 110,
                            itemHeight: 18,
                            symbolSize: 12,
                            symbolShape: "circle",
                        },
                    ]}
                />
            </div>
        </section>
    );
}
