'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { MutatingDots } from 'react-loader-spinner';
import { subDays, format, startOfWeek, endOfWeek } from 'date-fns';

type RiskLevel = 'Low' | 'Medium' | 'High' | null;

export default function RiskLevelBadge() {
  function RiskLevelBadgeSkeleton() {
  return (
    <div className="flex items-center justify-center h-full animate-pulse">
      <div
        className="
          h-12 w-44
          rounded-full
          border border-green-400/30
          bg-yellow-400/10
          shadow-[0_0_25px_rgba(250,204,21,0.25)]
        "
      />
    </div>
  );
}

  const [risk, setRisk] = useState<RiskLevel>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const computeRisk = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      let score = 0;

      /* -------- Last 7 days mental signals -------- */
      const fromDate = format(subDays(new Date(), 6), 'yyyy-MM-dd');

      const { data: recent, error } = await supabase
        .from('journals')
        .select('mood, stress_level, sleep_hours, negative_thoughts')
        .eq('user_id', user.id)
        .gte('date', fromDate);

      if (!error && recent && recent.length > 0) {
        const avgMood =
          recent.reduce((s, e) => s + (e.mood ?? 0), 0) / recent.length;
        const avgStress =
          recent.reduce((s, e) => s + (e.stress_level ?? 0), 0) /
          recent.length;
        const avgSleep =
          recent.reduce((s, e) => s + (e.sleep_hours ?? 0), 0) /
          recent.length;

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

      const { count } = await supabase
        .from('journals')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('date', format(start, 'yyyy-MM-dd'))
        .lte('date', format(end, 'yyyy-MM-dd'));

      if ((count ?? 0) < 3) score += 1;

      /* -------- Final risk -------- */
      if (score >= 5) setRisk('High');
      else if (score >= 3) setRisk('Medium');
      else setRisk('Low');

      setLoading(false);
    };

    computeRisk();
  }, [supabase]);

  /* -------- Loading -------- */
  if (loading) {
  return <RiskLevelBadgeSkeleton />;
}


  /* -------- No data -------- */
  if (!risk) {
    return (
      <p className="text-muted-foreground text-center">
        Not enough data
      </p>
    );
  }

  /* -------- UI config -------- */
  const config = {
    Low: {
      label: 'Low Risk',
      desc: 'Stable mental patterns',
      styles: `
        border-green-400/40
        text-green-300
        bg-green-400/15
        shadow-[0_0_25px_rgba(34,197,94,0.25)]
      `,
    },
    Medium: {
      label: 'Medium Risk',
      desc: 'Some warning signals detected',
      styles: `
        border-yellow-400/40
        text-yellow-300
        bg-yellow-400/15
        shadow-[0_0_25px_rgba(250,204,21,0.25)]
      `,
    },
    High: {
      label: 'High Risk',
      desc: 'Sustained stress or low mood',
      styles: `
        border-red-400/40
        text-red-300
        bg-red-400/15
        shadow-[0_0_30px_rgba(239,68,68,0.35)]
      `,
    },
  };

  const { label, desc, styles } = config[risk];

  /* -------- Glass Badge -------- */
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <div
        className={`
          px-6 py-2 rounded-full
          border backdrop-blur-xl
          bg-white/5
          font-semibold text-lg
          transition-all duration-300
          ${styles}
        `}
      >
        {label}
      </div>

      
    </div>
  );
}
