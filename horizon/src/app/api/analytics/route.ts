import { redis } from "@/lib/redis";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { subDays, format } from "date-fns";

const RangeSchema = z.enum(["7", "30", "90"]);

type AnalyticsPayload = {
  range: number;
  total: number;
  avgMood: number;
  entries: any[];
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const rangeStr = url.searchParams.get("range") ?? "7";
  const range = RangeSchema.parse(rangeStr);

 const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cacheKey = `horizon:analytics:${user.id}:${range}`;

  // ✅ 1) cache hit
  const cached = await redis.get<AnalyticsPayload>(cacheKey);
  if (cached) {
    return Response.json({ cached: true, ...cached });
  }

  // ✅ 2) fetch entries from supabase
  const fromDate = format(subDays(new Date(), Number(range) - 1), "yyyy-MM-dd");

  const { data: entries, error } = await supabase
    .from("journals")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", fromDate)
    .order("date", { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const total = entries?.length ?? 0;

  const avgMood =
    total === 0
      ? 0
      : entries!.reduce((s, e) => s + (e.mood ?? 0), 0) / total;

  const payload: AnalyticsPayload = {
    range: Number(range),
    total,
    avgMood: Number(avgMood.toFixed(2)),
    entries: entries ?? [],
  };

  // ✅ 3) store cache (10 min)
  await redis.set(cacheKey, payload, { ex: 600 });

  return Response.json({ cached: false, ...payload });
}
