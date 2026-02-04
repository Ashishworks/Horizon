'use client';

import { useMemo, useState } from 'react';
import {
  subDays,
  format,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  parseISO,
} from 'date-fns';

import NearbyHelpModal from '@/app/components/nearby/NearbyHelpModal';

type RiskLevel = 'Low' | 'Medium' | 'High' | null;

export default function RiskLevelBadge({ entries }: { entries: any[] }) {
  const [open, setOpen] = useState(false);

  const risk: RiskLevel = useMemo(() => {
    if (!entries || entries.length === 0) return null;

    let score = 0;

    /* -------- Last 7 days mental signals -------- */
    const fromDate = format(subDays(new Date(), 6), 'yyyy-MM-dd');
    const recent = entries.filter((e) => e.date >= fromDate);

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
      styles: `
        border-green-500/40
        text-green-600 dark:text-green-300
        bg-green-500/10
      `,
    },
    Medium: {
      label: 'Medium Risk',
      styles: `
        border-yellow-500/40
        text-yellow-600 dark:text-yellow-300
        bg-yellow-500/10
      `,
    },
    High: {
      label: 'High Risk',
      styles: `
        border-red-500/40
        text-red-600 dark:text-red-300
        bg-red-500/10
      `,
    },
  };

  const { label, styles } = config[risk];

  return (
    <>
      {/* 🔘 DASHBOARD BUTTON */}
     <div
  onClick={() => setOpen(true)}
  className="group cursor-pointer flex justify-center relative"
>
  {/* 🔘 Badge */}
  <div
    className={`
      relative px-5 py-1.5 rounded-full
      border backdrop-blur-xl
      bg-card/70
      font-semibold text-base
      transition-all duration-300
      hover:-translate-y-1 hover:scale-[1.03]
      active:scale-[0.97]
      ${styles}
    `}
  >
    <span className="absolute inset-0 rounded-full bg-white/5" />
    <span className="relative z-10">{label}</span>
  </div>

  {/* 💬 Tooltip */}
  <div
    className="
      pointer-events-none
      absolute
      top-10
      left-1/2
      -translate-x-1/2
      opacity-0
      scale-95
      group-hover:opacity-100
      group-hover:scale-100
      transition-all
      duration-200
      z-50
    "
  >
    <div className="px-3 py-1.5 rounded-md bg-black text-white text-xs shadow-lg whitespace-nowrap">
      Click to search help
    </div>
  </div>
</div>


      {/* 🧠 MODAL */}
      <NearbyHelpModal
        open={open}
        onClose={() => setOpen(false)}
        risk={risk}
      />
    </>
  );
}
