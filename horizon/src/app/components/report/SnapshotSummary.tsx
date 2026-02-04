// components/report/SnapshotSummary.tsx

import { SnapshotStats } from "@/types/report";

export default function SnapshotSummary({
    stats,
}: {
    stats: SnapshotStats;
}) {
    const { mood, sleep, stress, productivity } = stats.averages;

    if (
        mood === null &&
        sleep === null &&
        stress === null &&
        productivity === null
    ) {
        return (
            <section>
                <h3 className="text-lg font-semibold mb-4">
                    Snapshot Summary
                </h3>
                <p className="text-sm text-gray-500">
                    Not enough data to generate snapshot summary.
                </p>
            </section>
        );
    }

    return (
        <section>
            <h3 className="text-lg font-semibold mb-4">
                Snapshot Summary
            </h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
                {mood !== null && <div>Avg Mood: {mood.toFixed(1)}</div>}
                {sleep !== null && <div>Avg Sleep: {sleep.toFixed(1)}h</div>}
                {stress !== null && <div>Avg Stress: {stress.toFixed(1)}</div>}
                {productivity !== null && (
                    <div>Avg Productivity: {productivity.toFixed(1)}</div>
                )}
            </div>
        </section>
    );
}
