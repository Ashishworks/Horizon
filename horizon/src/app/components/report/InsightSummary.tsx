// components/report/InsightSummary.tsx

type Insight = {
    text: string;
    confidence: "low" | "medium" | "high";
};

export default function InsightSummary({
    insights = [],
}: {
    insights?: Insight[];
}) {
    if (!insights.length) {
        return (
            <section>
                <h2 className="text-lg font-semibold mb-3">Key Insights</h2>
                <p className="text-sm text-gray-500">
                    No significant insights detected for this period.
                </p>
            </section>
        );
    }

    return (
        <section>
            <h2 className="text-lg font-semibold mb-3">Key Insights</h2>

            <ul className="space-y-2 text-sm">
                {insights.map((i, idx) => (
                    <li key={idx} className="flex justify-between gap-4">
                        <span>• {i.text}</span>
                        <span className="text-sm  capitalize">
                            Impact: {i.confidence}
                        </span>
                    </li>
                ))}
            </ul>
        </section>
    );
}
