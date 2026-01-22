import { redis } from "@/lib/redis";
import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const today = format(new Date(), "yyyy-MM-dd");

    const journalData = {
      user_id: user.id,
      date: today,
      ...body,
      updated_at: new Date(),
    };

    const { error } = await supabase
      .from("journals")
      .upsert(journalData, { onConflict: "user_id,date" });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // ✅ invalidate redis cache after write
    await redis.del(
      `horizon:journals:${user.id}`,
      `horizon:analytics:${user.id}:7`,
      `horizon:analytics:${user.id}:30`,
      `horizon:analytics:${user.id}:90`
    );

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Journal Save Error:", err);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
