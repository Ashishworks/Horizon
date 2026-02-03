// components/report/RiskAssessment.tsx

type RiskProfile = {
    moodVolatility: number;
    sleepRegularity: number;
    stressConsistency: number;
    overall: "stable" | "watch" | "risk";
};

export default function RiskAssessment({
    risk,
}: {
    risk?: RiskProfile;
}) {
    if (!risk) {
        return (
            <section>
                <h2 className="text-lg font-semibold mb-3">
                    Risk & Stability
                </h2>
                <p className="text-sm text-gray-500">
                    Risk assessment unavailable for this period.
                </p>
            </section>
        );
    }

    return (
        <section>
            <h2 className="text-lg font-semibold mb-3">
                Risk & Stability
            </h2>

            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>Mood Volatility: {risk.moodVolatility}%</div>
                <div>Sleep Regularity: {risk.sleepRegularity}%</div>
                <div>Stress Consistency: {risk.stressConsistency}%</div>
                <div className="font-medium">
                    Overall Status:{" "}
                    <span className="uppercase">{risk.overall}</span>
                </div>
            </div>
        </section>
    );
}
