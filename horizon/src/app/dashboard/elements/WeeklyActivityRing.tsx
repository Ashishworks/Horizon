'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ResponsivePie, type ComputedDatum } from '@nivo/pie';
import { MutatingDots } from 'react-loader-spinner';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import StreakCounter from './StreakCounter';
import WeeklyActivityRingSkeleton from '../skeletons/WeeklyActivityRingSkeleton';
import StreakCounterSkeleton from '../skeletons/StreakCounterSkeleton';

type MyPieDatum = {
  id: string;
  label: string;
  value: number;
};

export default function WeeklyActivityRing() {
  const [entriesCount, setEntriesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchWeeklyCount = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const today = new Date();
      const start = startOfWeek(today);
      const end = endOfWeek(today);

      const startDate = format(start, 'yyyy-MM-dd');
      const endDate = format(end, 'yyyy-MM-dd');

      const { count, error } = await supabase
        .from('journals')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate);

      if (!error) {
        setEntriesCount(count ?? 0);
      }

      setLoading(false);
    };

    fetchWeeklyCount();
  }, [supabase]);

  const completed = entriesCount;
  const remaining = Math.max(0, 7 - completed);

  const pieData: MyPieDatum[] = [
    { id: 'completed', label: 'Days Logged', value: completed },
    { id: 'remaining', label: 'Days Missed', value: remaining },
  ];

  const CenteredMetric = ({
    centerX,
    centerY,
  }: {
    centerX: number;
    centerY: number;
  }) => (
    <text
      x={centerX}
      y={centerY}
      textAnchor="middle"
      dominantBaseline="central"
      style={{
        fontSize: '2.25rem',
        fontWeight: 700,
        fill: '#f4f4f5',
      }}
    >
      {completed}
      <tspan
        x={centerX}
        dy="1.7em"
        style={{
          fontSize: '1.125rem',
          fontWeight: 400,
          fill: '#a1a1aa',
        }}
      >
        / 7 Days
      </tspan>
    </text>
  );

 if (loading) {
  return (
    <div className="flex items-center justify-center h-[260px] gap-22">
      <WeeklyActivityRingSkeleton />
      <StreakCounterSkeleton />
    </div>
  );
}


  return (
    <div className="flex flex-col md:flex-row items-center gap-6 w-full">

      {/* LEFT — PIE */}
      <div className="w-full md:w-1/2 h-[260px]">
        <ResponsivePie
          data={pieData}
          margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
          innerRadius={0.7}
          padAngle={1}
          cornerRadius={2}
          activeOuterRadiusOffset={8}
          colors={[
            'hsl(160, 70%, 50%)',
            '#3f3f46',
          ]}
          enableArcLinkLabels={false}
          arcLabelsComponent={({ datum }: { datum: ComputedDatum<MyPieDatum> }) => {
            if (datum.id !== 'completed' || datum.value === 0) return null;

            const arc = datum.arc as typeof datum.arc & {
              centroid: [number, number];
            };

            if (!arc.centroid) return null;

            return (
              <g transform={`translate(${arc.centroid[0]},${arc.centroid[1]})`}>
                <text
                  fill={datum.color}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{ fontSize: 14, fontWeight: 600 }}
                >
                  {datum.value}
                </text>
              </g>
            );
          }}
          animate
          motionConfig="wobbly"
          layers={['arcs', 'arcLabels', CenteredMetric]}
        />
      </div>

      {/* RIGHT — STREAK */}
      <div className="w-full md:w-1/2 h-[260px] flex items-center justify-center">
        <StreakCounter />
      </div>

    </div>
  );
}
