import { redis } from "@/lib/redis";

export async function GET() {
  await redis.set("horizon:test", "working", { ex: 60 });
  const value = await redis.get("horizon:test");

  return Response.json({ ok: true, value });
}
