'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ResponsiveBar } from '@nivo/bar';
import { MutatingDots } from 'react-loader-spinner';
import { subDays, format } from 'date-fns';

type BarData = {
  type: string;
  mood: number;
};

export default function ExerciseMoodComparison() {
  const [data, setData] = useState<BarData[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchData = async () => {
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
        .select('mood, exercise')
        .eq('user_id', user.id)
        .gte('date', fromDate);

      if (error || !data || data.length < 3) {
        setLoading(false);
        return;
      }

      const avg = (arr: number[]) =>
        arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

      const exerciseDays = data.filter(
        d => d.exercise && d.exercise.length > 0
      );
      const nonExerciseDays = data.filter(
        d => !d.exercise || d.exercise.length === 0
      );

      setData([
        {
          type: 'Exercise Days',
          mood: Number(avg(exerciseDays.map(d => d.mood ?? 0)).toFixed(1)),
        },
        {
          type: 'No Exercise',
          mood: Number(avg(nonExerciseDays.map(d => d.mood ?? 0)).toFixed(1)),
        },
      ]);

      setLoading(false);
    };

    fetchData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <MutatingDots visible height="80" width="80" color="#ff0000ff" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <p className="text-muted-foreground text-center">
        Not enough data to compare yet.
      </p>
    );
  }

  return (
    <ResponsiveBar
      data={data}
      keys={['mood']}
      indexBy="type"
      margin={{ top: 40, right: 30, bottom: 50, left: 60 }}
      padding={0.4}
      valueScale={{ type: 'linear', min: 0, max: 10 }}
      colors={({ indexValue }) =>
        indexValue === 'Exercise Days'
          ? 'hsl(160,70%,50%)'
          : 'hsl(0,70%,55%)'
      }
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        legend: 'Day Type',
        legendPosition: 'middle',
        legendOffset: 32,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        legend: 'Average Mood',
        legendPosition: 'middle',
        legendOffset: -40,
      }}
      labelTextColor="#fff"
      animate
    />
  );
}
