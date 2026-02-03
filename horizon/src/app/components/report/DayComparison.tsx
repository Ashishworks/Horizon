// components/report/DayComparison.tsx

type DaySummary = {
    date: string;
    mood: number;
    sleepHours: number;
    notes: string[];
};

function DayCard({ day }: { day: DaySummary }) {
    return (
        <div className="border p-3 text-sm">
            <p className="font-medium">{day.date}</p>
            <p>Mood: {day.mood}</p>
            <p>Sleep: {day.sleepHours}h</p>

            {Array.isArray(day.notes) && day.notes.length > 0 && (
                <ul className="mt-1 list-disc ml-4">
                    {day.notes.map((n, i) => (
                        <li key={i}>{n}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function DayComparison({
    best,
    worst,
}: {
    best?: DaySummary[] | null;
    worst?: DaySummary[] | null;
}) {
    const safeBest = Array.isArray(best) ? best : [];
    const safeWorst = Array.isArray(worst) ? worst : [];

    if (safeBest.length === 0 && safeWorst.length === 0) {
        return (
            <section>
                <h2 className="text-lg font-semibold mb-3">
                    Best vs Worst Days
                </h2>
                <p className="text-sm text-gray-500">
                    Not enough data to identify best or worst days.
                </p>
            </section>
        );
    }

    return (
        <section>
            <h2 className="text-lg font-semibold mb-3">
                Best vs Worst Days
            </h2>

            <div className="grid grid-cols-2 gap-6">
                <div>
                    <h3 className="font-medium mb-2">Best Days</h3>
                    <div className="space-y-2">
                        {safeBest.map((d, i) => (
                            <DayCard key={i} day={d} />
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="font-medium mb-2">Worst Days</h3>
                    <div className="space-y-2">
                        {safeWorst.map((d, i) => (
                            <DayCard key={i} day={d} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
