// components/report/DayComparison.tsx
import { Sun, CloudRain, Moon } from "lucide-react";

type DaySummary = {
  date: string;
  mood: number;
  sleepHours: number;
  notes: string[];
};

function DayCard({
  day,
  type,
}: {
  day: DaySummary;
  type: "best" | "worst";
}) {
  return (
    <div
      className="relative p-4 rounded-xl border transition-all"
      style={{
        borderColor: "#000000",
        backgroundColor: "#ffffff",
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <p
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: "#6b7280" }} // gray
          >
            {new Date(day.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>

          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-2xl font-bold"
              style={{ color: "#000000" }}
            >
              {day.mood}/10
            </span>
            <span
              className="text-xs font-medium"
              style={{ color: "#6b7280" }}
            >
              Mood Score
            </span>
          </div>
        </div>

        {/* Icon (monochrome) */}
        {type === "best" ? (
          <Sun className="w-5 h-5" color="#000000" />
        ) : (
          <CloudRain className="w-5 h-5" color="#000000" />
        )}
      </div>

      {/* Sleep */}
      <div
        className="flex items-center gap-2 text-sm mb-3 py-1 px-2 rounded-md w-fit border"
        style={{
          borderColor: "#000000",
          backgroundColor: "#ffffff",
          color: "#000000",
        }}
      >
        <Moon className="w-4 h-4" color="#000000" />
        <span className="font-semibold">{day.sleepHours}h</span>
        <span
          className="text-xs whitespace-nowrap"
          style={{ color: "#6b7280" }}
        >
          of sleep
        </span>
      </div>

      {/* Notes */}
      {day.notes.length > 0 && (
        <div
          className="space-y-1.5 pt-3 mt-3"
          style={{ borderTop: "1px solid #000000" }}
        >
          {day.notes.map((n, i) => (
            <div key={i} className="flex items-start gap-2">
              <div
                className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0"
                style={{ backgroundColor: "#000000" }}
              />
              <p
                className="text-xs leading-relaxed italic"
                style={{ color: "#000000" }}
              >
                "{n}"
              </p>
            </div>
          ))}
        </div>
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
      <section
        className="py-6 border-t border-b"
        style={{ borderColor: "#000000" }}
      >
        <h2
          className="text-xl font-bold mb-4"
          style={{ color: "#000000" }}
        >
          Peak vs. Low Performance
        </h2>

        <div
          className="rounded-lg p-8 text-center border border-dashed"
          style={{
            backgroundColor: "#ffffff",
            borderColor: "#000000",
          }}
        >
          <p
            className="text-sm italic"
            style={{ color: "#6b7280" }}
          >
            Not enough journal entries found to identify trends. Keep logging!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="flex flex-col mb-6">
        <h2
          className="text-xl font-bold tracking-tight"
          style={{ color: "#000000" }}
        >
          Comparison: Best vs. Worst Days
        </h2>
        <p
          className="text-sm mt-1"
          style={{ color: "#6b7280" }}
        >
          A side-by-side view of variables affecting your highest and lowest mood
          scores.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Best */}
        <div>
          <h3
            className="text-sm font-bold mb-4 uppercase tracking-widest"
            style={{ color: "#000000" }}
          >
            Highest Points
          </h3>

          <div className="space-y-4">
            {safeBest.length > 0 ? (
              safeBest.map((d, i) => (
                <DayCard key={i} day={d} type="best" />
              ))
            ) : (
              <p
                className="text-xs italic"
                style={{ color: "#6b7280" }}
              >
                No peak data available.
              </p>
            )}
          </div>
        </div>

        {/* Worst */}
        <div>
          <h3
            className="text-sm font-bold mb-4 uppercase tracking-widest"
            style={{ color: "#000000" }}
          >
            Lowest Points
          </h3>

          <div className="space-y-4">
            {safeWorst.length > 0 ? (
              safeWorst.map((d, i) => (
                <DayCard key={i} day={d} type="worst" />
              ))
            ) : (
              <p
                className="text-xs italic"
                style={{ color: "#6b7280" }}
              >
                No low point data available.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
