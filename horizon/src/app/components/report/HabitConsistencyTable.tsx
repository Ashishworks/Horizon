// components/report/HabitConsistencyTable.tsx

type Habit = {
    name: string;
    consistency: number;
    trend: "up" | "down" | "flat";
};

export default function HabitConsistencyTable({
    habits,
}: {
    habits?: Habit[] | null;
}) {
    if (!Array.isArray(habits) || habits.length === 0) {
        return (
            <section>
                <h2 className="text-lg font-semibold mb-3">
                    Habit Consistency
                </h2>
                <p className="text-sm text-gray-500">
                    Not enough data to evaluate habits for this period.
                </p>
            </section>
        );
    }

    return (
        <section>
            <h2 className="text-lg font-semibold mb-3">
                Habit Consistency
            </h2>

            <table className="w-full text-sm border-collapse">
                <thead>
                    <tr className="border-b">
                        <th className="text-left py-1">Habit</th>
                        <th className="text-left py-1">Consistency</th>
                        <th className="text-left py-1">Trend</th>
                    </tr>
                </thead>
                <tbody>
                    {habits.map((h) => (
                        <tr key={h.name} className="border-b">
                            <td className="py-1">{h.name}</td>
                            <td className="py-1">{h.consistency}%</td>
                            <td className="py-1 uppercase">{h.trend}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
}
