"use client";

import { useEffect, useState } from "react";

export default function AIOverviewSection({ days }: { days: number }) {
  const [text, setText] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);

      try {
        const res = await fetch("/api/ai/report-overview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timeRange: `${days}d` }),
        });

        const data = await res.json();

        if (!isMounted) return;

        if (!data?.explanation) {
          setText(["AI overview could not be generated."]);
          return;
        }

        const lines = data.explanation
          .split("\n")
          .map((l: string) => l.trim())
          .filter(Boolean);

        setText(lines);
      } catch {
        if (isMounted) {
          setText(["AI overview could not be generated."]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [days]);

  return (
    <section>
      <h2 className="text-xl font-bold mb-4">
        AI Mental Health Overview <span className="text-sm font-normal">(Horizon's comment)</span>
      </h2>

      {loading ? (
        <p className="text-sm text-gray-500">Generating AI insights…</p>
      ) : (
        <div className="space-y-3 text-sm leading-relaxed text-gray-800">
          {text?.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}
    </section>
  );
}
