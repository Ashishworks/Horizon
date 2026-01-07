'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import { MutatingDots } from 'react-loader-spinner';
import { format, parseISO } from 'date-fns';
import WeeklyActivityRing from './elements/WeeklyActivityRing';
import AverageMoodCard from './elements/AverageMoodCard';
import StressTrendIndicator from './elements/StressTrendIndicator';
import SleepConsistencyRing from './elements/SleepConsistencyRing';
import RiskLevelBadge from './elements/RiskLevelBadge';
import InsightOfTheWeek from './elements/InsightOfTheWeek';
import ExerciseMoodComparison from './elements/ExerciseMoodComparison';
import StreakCounter from './elements/StreakCounter';
import TimeRangeSelector from './elements/TimeRangeSelector';
import ECGLine from './ui/ECGLine';
import Face from '../components/ui/face';
import SleepingEmoji from '../components/lottie/sleeping';
import Unwell from '../components/lottie/unwell';
import Smoothymon from '../components/lottie/Smoothymon';

// --- 1. FULLY DEFINED INTERFACE ---
// Based on your journal page, this is the data structure
interface JournalEntry {
  id: string; // Added ID, essential for keys
  date: string; // e.g., '2025-11-16'
  mood: number;
  sleep_quality?: string;
  sleep_hours?: number;
  exercise: string[];
  deal_breaker?: string;
  productivity?: number;
  productivity_comparison?: 'Better' | 'Same' | 'Worse';
  overthinking?: number;
  special_day?: string;
  stress_level?: number;
  diet_status?: 'Okaish' | 'Good' | 'Bad';
  stress_triggers?: string;
  main_challenges?: string;
  daily_summary?: string;
  social_time?: 'Decent' | 'Less' | 'Zero';
  negative_thoughts?: 'Yes' | 'No';
  negative_thoughts_detail?: string;
  screen_work?: number;
  screen_entertainment?: number;
  caffeine_intake?: string;
  time_outdoors?: string;
}

export default function DashboardPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<7 | 30 | 90>(7);
  const filteredEntries = useMemo(() => {
    const sorted = [...entries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return sorted.slice(-range);
  }, [entries, range]);

  const hasEnoughData = filteredEntries.length >= 2;
  const nivoDarkTheme = useMemo(() => ({
    axis: {
      ticks: { text: { fill: '#a1a1aa' } },
      legend: { text: { fill: '#f4f4f5' } },
    },
    legends: {
      text: { fill: '#f4f4f5' },
    },
    tooltip: {
      container: {
        background: '#27272a',
        color: '#f4f4f5',
      },
    },
  }), []);

  // --- 2. INITIALIZED SUPABASE AND ROUTER ---
  const supabase = createClientComponentClient();
  const router = useRouter();

  // --- 3. IMPLEMENTED DATA FETCHING ---
  useEffect(() => {
    const fetchEntries = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth'); // Redirect if not logged in
        return;
      }

      // Fetch all journal data for this user, ordered by date
      const { data, error } = await supabase
        .from('journals')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching journal entries:', error);
      } else if (data) {
        setEntries(data as JournalEntry[]);
      }
      setLoading(false);
    };

    fetchEntries();
  }, [supabase, router]);

  // --- 4. IMPLEMENTED DATA PROCESSING (useMemo) ---
  const moodStressData = useMemo(() => {
    if (filteredEntries.length === 0) return [];
    return [
      {
        id: 'Mood',
        data: filteredEntries.map((entry) => ({
          x: format(parseISO(entry.date), 'MMM dd'),
          y: entry.mood ?? 0,
        })),
      },
      {
        id: 'Stress',
        data: filteredEntries.map((entry) => ({
          x: format(parseISO(entry.date), 'MMM dd'),
          y: entry.stress_level ?? 0,
        })),
      },
    ];
  }, [filteredEntries]);

  const exercisePieData = useMemo(() => {
    const exerciseCounts: Record<string, number> = {};

    filteredEntries.forEach((entry) => {
      entry.exercise?.forEach((ex) => {
        const clean = ex.startsWith('Other:') ? 'Other' : ex;
        exerciseCounts[clean] = (exerciseCounts[clean] || 0) + 1;
      });
    });

    return Object.entries(exerciseCounts).map(([id, value]) => ({
      id,
      label: id,
      value,
    }));
  }, [filteredEntries]);

  const screenTimeBarData = useMemo(() => {
    return filteredEntries.map((entry) => ({
      date: format(parseISO(entry.date), 'MMM dd'),
      Work: entry.screen_work ?? 0,
      Entertainment: entry.screen_entertainment ?? 0,
    }));
  }, [filteredEntries]);
  const moodVolatility = useMemo(() => {
    if (filteredEntries.length < 2) return 0;

    let totalChange = 0;
    for (let i = 1; i < filteredEntries.length; i++) {
      totalChange += Math.abs(
        (filteredEntries[i].mood ?? 0) -
        (filteredEntries[i - 1].mood ?? 0)
      );
    }

    return (totalChange / (filteredEntries.length - 1)).toFixed(2);
  }, [filteredEntries]);
  const bestDay = useMemo(() => {
    if (!filteredEntries.length) return null;
    return [...filteredEntries].reduce((best, curr) =>
      (curr.mood ?? 0) > (best.mood ?? 0) ? curr : best
    );
  }, [filteredEntries]);

  const worstDay = useMemo(() => {
    if (!filteredEntries.length) return null;
    return [...filteredEntries].reduce((worst, curr) =>
      (curr.mood ?? 0) < (worst.mood ?? 0) ? curr : worst
    );
  }, [filteredEntries]);

  const sleepConsistency = useMemo(() => {
    if (!filteredEntries.length) return 0;

    const goodSleepDays = filteredEntries.filter(
      (e) => (e.sleep_hours ?? 0) >= 7
    ).length;

    return Math.round((goodSleepDays / filteredEntries.length) * 100);
  }, [filteredEntries]);
  const exerciseConsistency = useMemo(() => {
    if (!filteredEntries.length) return 0;

    const exerciseDays = filteredEntries.filter(
      (e) => e.exercise && e.exercise.length > 0
    ).length;

    return Math.round((exerciseDays / filteredEntries.length) * 100);
  }, [filteredEntries]);

  // --- 5. ADDED LOADING & EMPTY STATES ---
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <MutatingDots
          visible={true}
          height="100"
          width="100"
          color="#ff0000ff"
          secondaryColor="#4fa94d"
        />
      </div>
    );
  }
  if (entries.length === 0) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-foreground">
        <h1 className="text-2xl font-semibold">No journal entries found.</h1>
        <p className="text-muted-foreground">Go write an entry to see your stats!</p>
      </div>
    );
  }

  // --- 6. IMPLEMENTED NIVO THEME ---

  return (
    <div className="p-4 md:p-10 bg-background text-foreground min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center mb-8 gap-4 mt-16 ">
        {/* Left */}
        <h1 className="text-3xl md:text-5xl font-bold">
          Dashboard Reflection
        </h1>
        <div className="mx-2">
          <ECGLine />
        </div>

        {/* Right */}
        <div className="flex items-center gap-4 md:ml-auto">
          <RiskLevelBadge />
          <TimeRangeSelector value={range} onChange={setRange} />
        </div>
      </div>
      {/* --- ROW 1: At-a-Glance --- */}
      {/* ================= ROW 2: LIFESTYLE ANALYTICS ================= */}
      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

        {/* Weekly Activity */}
        <div className="bg-card p-4 rounded-xl border border-border h-[320px] flex flex-col shadow-xl dark:shadow-white/10">
          <h2 className="text-lg font-semibold mb-2 text-center">
            This Week&apos;s Activity
          </h2>
          <div className="flex-1">
            <WeeklyActivityRing />
          </div>
        </div>

        {/* Exercise Breakdown */}
        <div className="bg-card p-4 rounded-xl border border-border h-[320px] flex flex-col shadow-xl dark:shadow-white/10">
          <h2 className="text-lg font-semibold mb-2 text-center">
            Exercise Breakdown
          </h2>
          <div className="flex-1">
            <ResponsivePie
              data={exercisePieData}
              theme={nivoDarkTheme}
              margin={{ top: 20, right: 140, bottom: 20, left: 20 }}
              innerRadius={0.55}
              padAngle={1.2}
              cornerRadius={3}
              activeOuterRadiusOffset={10}
              borderWidth={1}
              borderColor={{ from: 'color', modifiers: [['darker', 99]] }}
              arcLinkLabelsSkipAngle={10}
              arcLabelsSkipAngle={10}
              legends={[
                {
                  anchor: 'right',
                  direction: 'column',
                  translateX: 40,
                  itemWidth: 80,
                  itemHeight: 18,
                  symbolSize: 12,
                },
              ]}
              animate
              colors={['#3B0764', '#5B21B6', '#7C3AED']}
            />
          </div>
        </div>
      
        {/* Center Face */}
        {/* <div className="hidden lg:flex absolute inset-0 items-center justify-center pointer-events-none opacity-5">
          <Face size={80} color={4} shadow={2} mouthHeight={18} mouthWidth={25} />
        </div> */}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Best Day (1/4) */}
        <div className="bg-card p-6 rounded-xl border border-border min-h-[250px] md:col-span-1 flex flex-col">

          {/* Row 1: Title (fixed at top) */}
          <h2 className="text-xl font-semibold text-center bg-gradient-to-br from-green-500/10 to-transparent rounded-xl">
            Best Day
          </h2>

          {/* Row 2: Content (vertically centered) */}
          <div className="flex-1 flex items-center">
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4 w-full">

              {/* Left: Emoji */}
              <div className="flex justify-center">
                <Smoothymon size={200} />
              </div>

              {/* Right: Info */}
              {bestDay && (
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                  <p className="text-4xl font-bold text-green-500">
                    {bestDay.mood}/10
                  </p>

                  <p className="mt-2 text-muted-foreground">
                    {format(parseISO(bestDay.date), 'MMM dd')}
                  </p>

                  {bestDay.daily_summary && (
                    <p className="mt-3 text-sm italic text-muted-foreground">
                      “{bestDay.daily_summary.slice(0, 80)}…”
                    </p>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>



        {/* Worst Day (1/4) */}
        <div className="bg-card p-6 rounded-xl border border-border min-h-[250px] md:col-span-1 flex flex-col">

          {/* Row 1: Title */}
          <h2 className="text-xl font-semibold mb-4 text-center bg-gradient-to-br from-red-500/10 to-transparent rounded-xl">
            Worst Day
          </h2>

          {/* Row 2: Centered content */}
          <div className="flex-1 flex items-center">
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4 w-full">

              {/* Left: Emoji */}
              <div className="flex justify-center">
                <Unwell size={200} />
              </div>

              {/* Right: Info */}
              {worstDay && (
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                  <p className="text-4xl font-bold text-red-500">
                    {worstDay.mood}/10
                  </p>

                  <p className="mt-2 text-muted-foreground">
                    {format(parseISO(worstDay.date), 'MMM dd')}
                  </p>

                  {worstDay.main_challenges && (
                    <p className="mt-3 text-sm italic text-muted-foreground">
                      “{worstDay.main_challenges.slice(0, 80)}…”
                    </p>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>



        {/* Sleep Consistency (1/2) */}
        <div className="bg-card p-6 rounded-xl border border-border min-h-[150px] md:col-span-2">

          {/* Row 1: Title */}
          <h2 className="text-xl font-semibold mb-4 text-center bg-gradient-to-br from-blue-500/10 to-transparent rounded-xl">
            Sleep Consistency
          </h2>

          {/* Row 2: 50-50 layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">

            {/* Left: Sleeping Emoji */}
            <div className="flex justify-center">
              <SleepingEmoji size={180} />
            </div>

            {/* Right: Info */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <p className="text-5xl font-bold">
                {sleepConsistency}%
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                Days with ≥ 7 hours of sleep
              </p>

              <p
                className={`mt-3 text-sm font-medium ${sleepConsistency >= 70
                  ? 'text-green-500'
                  : sleepConsistency >= 40
                    ? 'text-yellow-500'
                    : 'text-red-500'
                  }`}
              >
                {sleepConsistency >= 70
                  ? 'Good sleep routine'
                  : sleepConsistency >= 40
                    ? 'Inconsistent sleep'
                    : 'Poor sleep discipline'}
              </p>
            </div>

          </div>
        </div>


      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="bg-card p-6 rounded-xl border border-border min-h-[280px]">
          <h2 className="text-xl font-semibold mb-2 text-center">
            Average Mood
          </h2>
          <AverageMoodCard />
        </div>
        <div className="bg-card p-6 rounded-xl border border-border min-h-[280px]">
          <h2 className="text-xl font-semibold mb-2 text-center">
            Stress Trend
          </h2>
          <StressTrendIndicator />
        </div>
        <div className="bg-card p-6 rounded-xl border border-border min-h-[280px]">
          <h2 className="text-xl font-semibold mb-2 text-center">
            Sleep Consistency
          </h2>
          <SleepConsistencyRing />
        </div>
        <div className="bg-card p-6 rounded-xl border border-border min-h-[280px]">
          <h2 className="text-xl font-semibold mb-2 text-center">
            Insight of the Week
          </h2>
          <InsightOfTheWeek />
        </div>
        <div className="bg-card p-6 rounded-xl border border-border min-h-[280px]">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Exercise vs Mood
          </h2>
          <ExerciseMoodComparison />
        </div>
        <div className="bg-card p-6 rounded-xl border border-border min-h-[280px]">
          <h2 className="text-xl font-semibold mb-2 text-center">
            Mood Volatility
          </h2>

          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-5xl font-bold">{moodVolatility}</p>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Lower value means more emotional stability
            </p>
            <p className={`mt-2 text-sm font-medium ${Number(moodVolatility) <= 2
              ? 'text-green-500'
              : Number(moodVolatility) <= 4
                ? 'text-yellow-500'
                : 'text-red-500'
              }`}>
              {Number(moodVolatility) <= 2
                ? 'Stable'
                : Number(moodVolatility) <= 4
                  ? 'Moderate fluctuations'
                  : 'High mood swings'}
            </p>
          </div>
        </div>
      </div>

      {/* --- INSIGHT ROW: Best / Worst / Sleep --- */}
      


      {/* --- ROW 2 & 3: Main Chart Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card text-card-foreground p-8 rounded-xl shadow border border-border h-[400px] md:h-[500px]">
          <h2 className="text-xl font-semibold mb-4">Mood & Stress Over Time</h2>
          {hasEnoughData ? (
            <ResponsiveLine
              data={moodStressData}
              theme={nivoDarkTheme}
              margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
              xScale={{ type: 'point' }}
              yScale={{ type: 'linear', min: 0, max: 10, stacked: false }}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Date',
                legendOffset: 36,
                legendPosition: 'middle',
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Level (0-10)',
                legendOffset: -40,
                legendPosition: 'middle',
              }}
              colors={{ scheme: 'set1' }}
              pointSize={10}
              pointColor={{ theme: 'background' }}
              pointBorderWidth={2}
              pointBorderColor={{ from: 'serieColor' }}
              useMesh={true}
              animate={true}
              legends={[{
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: 'left-to-right',
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: 'circle',
              }]}
            />
          ) : (
            <p className="text-center text-muted-foreground mt-10">
              Add more entries to see trends
            </p>
          )}
        </div>
        <div className="bg-card text-card-foreground p-6 rounded-xl shadow border border-border h-[400px] md:h-[500px] lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Screen Time (Work vs. Entertainment)</h2>
          <ResponsiveBar
            data={screenTimeBarData}
            theme={nivoDarkTheme}
            keys={['Work', 'Entertainment']}
            indexBy="date"
            margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
            padding={0.3}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={{ scheme: 'set2' }}
            groupMode="stacked"
            borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Date',
              legendPosition: 'middle',
              legendOffset: 32,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Hours',
              legendPosition: 'middle',
              legendOffset: -40,
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
            animate={true}
            legends={[{
              dataFrom: 'keys',
              anchor: 'bottom-right',
              direction: 'column',
              justify: false,
              translateX: 120,
              translateY: 0,
              itemsSpacing: 2,
              itemWidth: 100,
              itemHeight: 20,
              itemDirection: 'left-to-right',
              itemOpacity: 0.85,
              symbolSize: 20,
            }]}
          />
        </div>
      </div>
    </div>
  );
}