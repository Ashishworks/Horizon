'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { MutatingDots } from 'react-loader-spinner';
import { subDays, format } from 'date-fns';
import MoodVolatilityLine from './MoodVolatilityLine';

type JournalEntry = {
  mood: number | null;
  date: string;
};

export default function MoodOverviewHorizontal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchMoodData = async () => {
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
        .select('mood, date')
        .eq('user_id', user.id)
        .gte('date', fromDate)
        .order('date', { ascending: true });

      if (!error && data) {
        setEntries(data);
      }

      setLoading(false);
    };

    fetchMoodData();
  }, [supabase]);

  /* ================== CALCULATIONS ================== */

  const averageMood = useMemo(() => {
    if (!entries.length) return null;
    const sum = entries.reduce((acc, e) => acc + (e.mood ?? 0), 0);
    return Number((sum / entries.length).toFixed(1));
  }, [entries]);

  const moodVolatility = useMemo(() => {
    if (entries.length < 2) return '0.00';

    let totalChange = 0;
    for (let i = 1; i < entries.length; i++) {
      totalChange += Math.abs(
        (entries[i].mood ?? 0) - (entries[i - 1].mood ?? 0)
      );
    }

    return (totalChange / (entries.length - 1)).toFixed(2);
  }, [entries]);

  /* ================== STYLES ================== */

  const moodColor =
    averageMood === null
      ? 'text-muted-foreground'
      : averageMood >= 7
      ? 'text-green-400'
      : averageMood >= 4
      ? 'text-yellow-400'
      : 'text-red-400';

  const volatilityLabel =
    Number(moodVolatility) <= 2
      ? { text: 'Stable', color: 'text-green-500' }
      : Number(moodVolatility) <= 4
      ? { text: 'Moderate fluctuations', color: 'text-yellow-500' }
      : { text: 'High mood swings', color: 'text-red-500' };

  /* ================== LOADING ================== */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <MutatingDots visible height="80" width="80" color="#ff0000ff" />
      </div>
    );
  }

  /* ================== UI ================== */

 return (
  <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 h-full items-center">

    {/* ===== Average Mood ===== */}
    <div className="flex items-center justify-center gap-6 w-full">
  <p className="text-2xl md:text-4xl font-semibold text-muted-foreground">
    Average Mood
  </p>

  <p className={`text-6xl font-bold ${moodColor}`}>
    {averageMood ?? '—'}
  </p>
</div>


    {/* ===== Divider ===== */}
    <div className="hidden md:block absolute left-1/2 top-6 bottom-6 w-px bg-border" />

    {/* ===== Mood Volatility (Number Line) ===== */}
    <div className="flex flex-col justify-center">
      <MoodVolatilityLine value={Number(moodVolatility)} />
    </div>

  </div>
);

}
