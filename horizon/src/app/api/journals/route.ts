import { redis } from "@/lib/redis";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cacheKey = `horizon:journals:${user.id}`;

    // ✅ cache hit
    const cachedRaw = await redis.get<any>(cacheKey);
    if (cachedRaw) {
      const entries =
        typeof cachedRaw === "string" ? JSON.parse(cachedRaw) : cachedRaw;

      return Response.json({ cached: true, entries });
    }

    // ✅ fetch from DB
    const { data: entries, error } = await supabase
      .from("journals")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // ✅ store cache for 10 mins
    await redis.set(cacheKey, JSON.stringify(entries ?? []), { ex: 600 });

    return Response.json({ cached: false, entries: entries ?? [] });
  } catch (err) {
    console.error("Journals API Error:", err);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
