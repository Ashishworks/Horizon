'use client';

import { ResponsivePie, type ComputedDatum } from '@nivo/pie';
import StreakCounter from './StreakCounter';

type MyPieDatum = {
  id: 'completed' | 'remaining';
  label: string;
  value: number;
};

interface ActivityRingProps {
  entries: any[];
  range: 7 | 30 | 90;
}

export default function ActivityRing({ entries, range }: ActivityRingProps) {
  const completed = entries.length;
  const remaining = Math.max(0, range - completed);

  const pieData: MyPieDatum[] = [
    { id: 'completed', label: 'Days Logged', value: completed },
    { id: 'remaining', label: 'Days Missed', value: remaining },
  ];

  const CenteredMetric = ({ centerX, centerY }: any) => (
    <text
      x={centerX}
      y={centerY}
      textAnchor="middle"
      dominantBaseline="central"
      style={{
        fontSize: '2.25rem',
        fontWeight: 700,
        fill: 'var(--color-foreground)',
      }}
    >
      {completed}
      <tspan
        x={centerX}
        dy="1.7em"
        style={{
          fontSize: '1.125rem',
          fontWeight: 400,
          fill: 'var(--color-muted-foreground)',
        }}
      >
        / {range} Days
      </tspan>
    </text>
  );

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 w-full">
      <div className="w-full md:w-1/2 h-[230px]">
        <ResponsivePie
          data={pieData}
          innerRadius={0.72}
          padAngle={1}
          cornerRadius={4}
          activeOuterRadiusOffset={6}
          enableArcLinkLabels={false}
          enableArcLabels={false}

          colors={({ id }) =>
            id === 'completed'
              ? 'var(--color-chart-1)'
              : 'var(--color-muted)'
          }

          borderWidth={1}
          borderColor="var(--color-border)"

          layers={['arcs', CenteredMetric]}
          animate
          motionConfig="gentle"
        />
      </div>

      <div className="hidden md:flex w-full md:w-1/2 h-[260px] items-center justify-center">
        <StreakCounter />
      </div>
      

    </div>
  );
}
