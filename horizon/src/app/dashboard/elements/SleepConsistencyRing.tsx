"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ResponsivePie } from "@nivo/pie";
import { MutatingDots } from "react-loader-spinner";
import { startOfWeek, endOfWeek, format } from "date-fns";

type PieDatum = {
  id: string;
  label: string;
  value: number;
};

export default function SleepConsistencyRing() {
  const [goodSleepDays, setGoodSleepDays] = useState(0);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchSleepConsistency = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const today = new Date();
      const start = startOfWeek(today, { weekStartsOn: 1 });
      const end = endOfWeek(today, { weekStartsOn: 1 });

      const startDate = format(start, "yyyy-MM-dd");
      const endDate = format(end, "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("journals")
        .select("sleep_hours")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .lte("date", endDate);

      if (error || !data) {
        setGoodSleepDays(0);
      } else {
        const count = data.filter((entry) => (entry.sleep_hours ?? 0) >= 7)
          .length;

        setGoodSleepDays(count);
      }

      setLoading(false);
    };

    fetchSleepConsistency();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <MutatingDots visible height="80" width="80" color="#ff0000ff" />
      </div>
    );
  }

  const remaining = Math.max(0, 7 - goodSleepDays);

  const pieData: PieDatum[] = [
    { id: "good", label: "Good Sleep", value: goodSleepDays },
    { id: "missed", label: "Missed", value: remaining },
  ];

  const CenterMetric = ({
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
        fontSize: "2.25rem",
        fontWeight: 700,
        fill: "#f4f4f5",
      }}
    >
      {goodSleepDays}
      <tspan
        x={centerX}
        dy="1.2em"
        style={{
          fontSize: "1.125rem",
          fontWeight: 400,
          fill: "#a1a1aa",
        }}
      >
        / 7 Days
      </tspan>
    </text>
  );

  return (
    <ResponsivePie
      data={pieData}
      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      innerRadius={0.7}
      padAngle={1}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      colors={[
        goodSleepDays >= 5
          ? "hsl(160, 70%, 50%)"
          : goodSleepDays >= 3
          ? "hsl(45, 90%, 55%)"
          : "hsl(0, 70%, 55%)",
        "#3f3f46",
      ]}
      enableArcLinkLabels={false}
      arcLabelsSkipAngle={10}
      animate
      motionConfig="wobbly"
      layers={["arcs", "arcLabels", CenterMetric]}
    />
  );
}
