'use client';

import { useMemo } from 'react';
import { subDays, format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';

type RiskLevel = 'Low' | 'Medium' | 'High' | null;

export default function RiskLevelBadge({ entries }: { entries: any[] }) {
  const risk: RiskLevel = useMemo(() => {
    if (!entries || entries.length === 0) return null;

    let score = 0;

    /* -------- Last 7 days mental signals -------- */
    const fromDate = format(subDays(new Date(), 6), 'yyyy-MM-dd');

    const recent = entries.filter(e => e.date >= fromDate);

    if (recent.length > 0) {
      const avgMood =
        recent.reduce((s, e) => s + (e.mood ?? 0), 0) / recent.length;

      const avgStress =
        recent.reduce((s, e) => s + (e.stress_level ?? 0), 0) / recent.length;

      const avgSleep =
        recent.reduce((s, e) => s + (e.sleep_hours ?? 0), 0) / recent.length;

      const hasNegativeThoughts = recent.some(
        (e) => e.negative_thoughts === 'Yes'
      );

      if (avgMood < 4) score += 2;
      if (avgStress > 7) score += 2;
      if (hasNegativeThoughts) score += 2;
      if (avgSleep < 6) score += 1;
    }

    /* -------- Weekly consistency -------- */
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const end = endOfWeek(new Date(), { weekStartsOn: 1 });

    const weekCount = entries.filter((e) => {
      const d = parseISO(e.date);
      return isWithinInterval(d, { start, end });
    }).length;

    if (weekCount < 3) score += 1;

    /* -------- Final risk -------- */
    if (score >= 5) return 'High';
    if (score >= 3) return 'Medium';
    return 'Low';
  }, [entries]);

  /* -------- No data -------- */
  if (!risk) {
    return (
      <p className="text-muted-foreground text-center">
        Not enough data
      </p>
    );
  }

  const config = {
    Low: {
      label: 'Low Risk',
      desc: 'Stable mental patterns',
      styles: `
        border-green-500/40
        text-green-600 dark:text-green-300
        bg-green-500/10
        dark:shadow-[0_0_25px_rgba(34,197,94,0.25)]
      `,
    },
    Medium: {
      label: 'Medium Risk',
      desc: 'Some warning signals detected',
      styles: `
        border-yellow-500/40
        text-yellow-600 dark:text-yellow-300
        bg-yellow-500/10
        dark:shadow-[0_0_25px_rgba(250,204,21,0.25)]
      `,
    },
    High: {
      label: 'High Risk',
      desc: 'Sustained stress or low mood',
      styles: `
        border-red-500/40
        text-red-600 dark:text-red-300
        bg-red-500/10
        dark:shadow-[0_0_30px_rgba(239,68,68,0.35)]
      `,
    },
  };

  const { label, styles } = config[risk];

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 perspective-[800px]">
      <div
        className={`
          relative
          px-5 py-1.5 rounded-full
          border backdrop-blur-xl
          bg-card/70
          font-semibold text-base
          transition-all duration-300 ease-out
          transform-gpu
          hover:-translate-y-1 hover:scale-[1.03]
          active:translate-y-0 active:scale-[0.98]
          hover:shadow-lg
          dark:hover:shadow-[0_0_40px_rgba(0,0,0,0.6)]
          ${styles}
        `}
      >
        <span className="pointer-events-none absolute inset-0 rounded-full bg-white/5 dark:bg-white/10" />
        <span className="relative z-10">{label}</span>
      </div>
    </div>
  );
}
