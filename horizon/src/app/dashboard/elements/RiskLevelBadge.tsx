'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { MutatingDots } from 'react-loader-spinner';
import { subDays, format, startOfWeek, endOfWeek } from 'date-fns';

type RiskLevel = 'Low' | 'Medium' | 'High' | null;

export default function RiskLevelBadge() {
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

      /* ---------------- Last 7 days mental signals ---------------- */
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

      /* ---------------- Weekly consistency ---------------- */
      const start = startOfWeek(new Date(), { weekStartsOn: 1 });
      const end = endOfWeek(new Date(), { weekStartsOn: 1 });

      const { count } = await supabase
        .from('journals')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('date', format(start, 'yyyy-MM-dd'))
        .lte('date', format(end, 'yyyy-MM-dd'));

      if ((count ?? 0) < 3) score += 1;

      /* ---------------- Final risk ---------------- */
      if (score >= 5) setRisk('High');
      else if (score >= 3) setRisk('Medium');
      else setRisk('Low');

      setLoading(false);
    };

    computeRisk();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <MutatingDots visible height="80" width="80" color="#ff0000ff" />
      </div>
    );
  }

  if (!risk) {
    return (
      <p className="text-muted-foreground text-center">
        Not enough data
      </p>
    );
  }

  const config = {
    Low: {
      color: 'bg-green-500/20 text-green-400 border-green-500/10',
      label: 'Low Risk',
      desc: 'Stable mental patterns',
    },
    Medium: {
      color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
      label: 'Medium Risk',
      desc: 'Some warning signals detected',
    },
    High: {
      color: 'bg-red-500/20 text-red-400 border-red-500/40',
      label: 'High Risk',
      desc: 'Sustained stress or low mood',
    },
  };

  const { color, label, desc } = config[risk];

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div
        className={`px-4 py-2 rounded-full border text-lg font-semibold ${color}`}
      >
        {label}
      </div>
      
    </div>
  );
}
