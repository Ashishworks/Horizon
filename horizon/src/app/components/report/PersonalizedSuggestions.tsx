// components/report/PersonalizedSuggestions.tsx

export default function PersonalizedSuggestions({
    suggestions,
}: {
    suggestions?: string[] | null;
}) {
    if (!Array.isArray(suggestions) || suggestions.length === 0) {
        return (
            <section>
                <h2 className="text-lg font-semibold mb-3">
                    Suggested Focus
                </h2>
                <p className="text-sm text-gray-500">
                    No personalized suggestions available for this period.
                </p>
            </section>
        );
    }

    return (
        <section>
            <h2 className="text-lg font-semibold mb-3">
                Suggested Focus
            </h2>

            <ul className="list-disc ml-5 text-sm space-y-1">
                {suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                ))}
            </ul>
        </section>
    );
}
