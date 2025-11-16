'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// 1. IMPORT THE 'ComputedDatum' TYPE
import { ResponsivePie, type ComputedDatum } from '@nivo/pie';
import { MutatingDots } from 'react-loader-spinner';
import { startOfWeek, endOfWeek, format } from 'date-fns';

// 2. DEFINE THE SHAPE OF YOUR DATA
type MyPieDatum = {
    id: string;
    label: string;
    value: number;
};

// This component will fetch its own data
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
                return; // Not logged in
            }

            // 1. Get the start and end of the current week
            const today = new Date();
            const start = startOfWeek(today);
            const end = endOfWeek(today);

            // 2. Format dates for Supabase query
            const startDate = format(start, 'yyyy-MM-dd');
            const endDate = format(end, 'yyyy-MM-dd');
            
            // 3. Fetch *only* the count of entries for this user this week
            const { count, error } = await supabase
                .from('journals')
                .select('id', { count: 'exact', head: true }) 
                .eq('user_id', user.id)
                .gte('date', startDate)
                .lte('date', endDate);

            if (error) {
                console.error('Error fetching weekly count:', error);
            } else {
                setEntriesCount(count ?? 0);
            }
            setLoading(false);
        };

        fetchWeeklyCount();
    }, [supabase]);

    // 4. Prepare data for the Nivo Pie chart
    const completed = entriesCount;
    const remaining = 7 - completed;

    // 3. APPLY THE TYPE TO YOUR DATA
    const pieData: MyPieDatum[] = [
        {
            id: 'completed',
            label: 'Days Logged',
            value: completed,
        },
        {
            id: 'remaining',
            label: 'Days Missed',
            value: Math.max(0, remaining), // Ensure it doesn't go below 0
        },
    ];

    // 5. --- FIX: CenteredMetric uses inline 'style' instead of 'className' ---
    const CenteredMetric = ({ centerX, centerY }: { centerX: number, centerY: number }) => {
        return (
            <text
                x={centerX}
                y={centerY}
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                    fontSize: '2.25rem', // 36px, approx text-4xl
                    fontWeight: 700,
                    fill: '#f4f4f5', // zinc-100 / foreground (Hardcoded for dark theme)
                }}
            >
                {`${completed}`}
                    <tspan
                    x={centerX}
                    dy="1.2em"
                    style={{
                        fontSize: '1.125rem', // 18px, approx text-lg
                        fontWeight: 400,
                        fill: '#a1a1aa', // zinc-400 / muted-foreground
                    }}
                >
                    / 7 Days
                </tspan>
            </text>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center w-full h-full">
                <MutatingDots visible={true} height="80" width="80" color="#ff0000ff" />
            </div>
        );
    }

    return (
        <ResponsivePie
            data={pieData}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            innerRadius={0.7} // This makes it a donut
            padAngle={1}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            colors={[
                'hsl(160, 70%, 50%)', // Completed (a nice green/teal)
                '#3f3f46' // Remaining (zinc-700, a dark gray track)
            ]}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#a1a1aa"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: 'color' }}
            arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}

            
            arcLabelsComponent={({ datum }: { datum: ComputedDatum<MyPieDatum> }) => {
                // Only show label for the 'completed' slice AND if its value is > 0
                if (datum.id !== 'completed' || datum.value === 0) {
                    return null;
                }

                // Linter-safe way to access 'centroid'
                const arcWithCentroid = datum.arc as (typeof datum.arc & { 
                    centroid: [number, number]; 
                });
                const centroid = arcWithCentroid.centroid;

                if (!centroid) {
                    return null;
                }

                return (
                    <g transform={`translate(${centroid[0]},${centroid[1]})`}>
                        <text
                            fill={datum.color}
                            textAnchor="middle"
                            dominantBaseline="central"
                            style={{
                                fontSize: '14px',
                                fontWeight: 600,
                            }}
                        >
                            {datum.value}
                        </text>
                    </g>
                );
            }}
            animate={true}
            motionConfig="wobbly" 
            layers={['arcs', 'arcLabels', 'arcLinkLabels', 'legends', CenteredMetric]}
            enableArcLinkLabels={false}
        />
    );
}