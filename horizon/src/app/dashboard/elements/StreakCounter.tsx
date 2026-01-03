'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { MutatingDots } from 'react-loader-spinner';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import FireFlames from '../ui/fireEmoji';
import TrophyAward from '../ui/trophyEmoji';

export default function StreakCounter() {
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const calculateStreaks = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('journals')
        .select('date')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error || !data || data.length === 0) {
        setLoading(false);
        return;
      }

      const dates = data.map(d => parseISO(d.date));

      /* ---------- Best streak ---------- */
      let maxStreak = 1;
      let streak = 1;

      for (let i = 1; i < dates.length; i++) {
        const diff = differenceInCalendarDays(dates[i], dates[i - 1]);
        if (diff === 1) {
          streak++;
          maxStreak = Math.max(maxStreak, streak);
        } else if (diff > 1) {
          streak = 1;
        }
      }

      /* ---------- Current streak ---------- */
      let current = 1;
      for (let i = dates.length - 1; i > 0; i--) {
        const diff = differenceInCalendarDays(dates[i], dates[i - 1]);
        if (diff === 1) {
          current++;
        } else {
          break;
        }
      }

      setBestStreak(maxStreak);
      setCurrentStreak(current);
      setLoading(false);
    };

    calculateStreaks();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <MutatingDots visible height="80" width="80" color="#ff0000ff" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <div className="text-center">
        <p className="text-5xl font-bold text-orange-400"><FireFlames></FireFlames> {currentStreak}</p>
        <p className="text-sm text-muted-foreground">Current Streak</p>
      </div>

      <div className="text-center">
        <p className="text-2xl font-semibold text-green-400"><TrophyAward/> {bestStreak}</p>
        <p className="text-sm text-muted-foreground">Best Streak</p>
      </div>
    </div>
  );
}
