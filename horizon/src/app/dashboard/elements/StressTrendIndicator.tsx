'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { MutatingDots } from 'react-loader-spinner';
import { subDays, format } from 'date-fns';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

type Trend = 'up' | 'down' | 'stable' | null;

export default function StressTrendIndicator() {
  const [trend, setTrend] = useState<Trend>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchStressTrend = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const fromDate = format(subDays(new Date(), 6), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('journals')
        .select('stress_level, date')
        .eq('user_id', user.id)
        .gte('date', fromDate)
        .order('date', { ascending: true });

      if (error || !data || data.length < 3) {
        setTrend(null);
        setLoading(false);
        return;
      }

      // Simple slope calculation
      const values = data.map(d => d.stress_level ?? 0);
      const first = values[0];
      const last = values[values.length - 1];
      const delta = last - first;

      if (delta > 1) setTrend('up');
      else if (delta < -1) setTrend('down');
      else setTrend('stable');

      setLoading(false);
    };

    fetchStressTrend();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <MutatingDots visible height="80" width="80" color="#ff0000ff" />
      </div>
    );
  }

  const config = {
    up: {
      label: 'Increasing',
      color: 'text-red-400',
      icon: <ArrowUp size={40} />,
    },
    down: {
      label: 'Decreasing',
      color: 'text-green-400',
      icon: <ArrowDown size={40} />,
    },
    stable: {
      label: 'Stable',
      color: 'text-yellow-400',
      icon: <Minus size={40} />,
    },
  };

  if (!trend) {
    return (
      <p className="text-muted-foreground text-center">
        Not enough data
      </p>
    );
  }

  const { label, color, icon } = config[trend];

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className={color}>{icon}</div>
      <p className={`text-2xl font-semibold mt-2 ${color}`}>
        {label}
      </p>
      <p className="text-sm text-muted-foreground mt-1">
        Stress trend (last 7 days)
      </p>
    </div>
  );
}
