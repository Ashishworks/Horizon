"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MutatingDots } from "react-loader-spinner";
import { subDays, format } from "date-fns";

export default function AverageMoodCard() {
  const [avgMood, setAvgMood] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchAverageMood = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const fromDate = format(subDays(new Date(), 6), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("journals")
        .select("mood")
        .eq("user_id", user.id)
        .gte("date", fromDate);

      if (error) {
        console.error("Error fetching average mood:", error);
        setAvgMood(null);
      } else if (data && data.length > 0) {
        const sum = data.reduce((acc, entry) => acc + (entry.mood ?? 0), 0);
        setAvgMood(Number((sum / data.length).toFixed(1)));
      } else {
        setAvgMood(null);
      }

      setLoading(false);
    };

    fetchAverageMood();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <MutatingDots visible height="80" width="80" color="#ff0000ff" />
      </div>
    );
  }

  const moodColor =
    avgMood === null
      ? "text-muted-foreground"
      : avgMood >= 7
      ? "text-green-400"
      : avgMood >= 4
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <p className={`text-6xl font-bold ${moodColor}`}>
        {avgMood !== null ? avgMood : "—"}
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        Average mood (last 7 days)
      </p>
    </div>
  );
}
