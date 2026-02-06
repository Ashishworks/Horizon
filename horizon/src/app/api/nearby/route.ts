import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function POST(req: Request) {
    try {
        const { lat, lon } = await req.json();

        if (lat === undefined || lon === undefined) {
            return NextResponse.json({ error: "Missing lat/lon" }, { status: 400 });
        }

        const cacheKey = `nearby:${lat.toFixed(3)}:${lon.toFixed(3)}`;

        // 🟢 LOG 1: Check what key we are looking for
        console.log(`🔍 Checking cache for key: ${cacheKey}`);

        let cachedData;
        try {
            cachedData = await redis.get(cacheKey);
        } catch (redisError) {
            console.error("Upstash Redis Connection Error:", redisError);
        }

        if (cachedData) {
            // 🟢 LOG 2: Successful cache hit
            console.log("✅ CACHE HIT: Returning data from Upstash Redis");
            return NextResponse.json(cachedData);
        }

        // 🟢 LOG 3: Cache miss
        console.log("❌ CACHE MISS: Fetching fresh data from Overpass API...");

        const query = `
            [out:json];
            (
                node["amenity"="hospital"](around:5000,${lat},${lon});
                node["healthcare"="psychiatrist"](around:5000,${lat},${lon});
                node["healthcare"="mental_health"](around:5000,${lat},${lon});
            );
            out;
        `;

        const res = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: query,
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error("Overpass API Error:", errorText);
            return NextResponse.json({ error: "Overpass failed" }, { status: 502 });
        }

        const data = await res.json();

        // 🟢 LOG 4: Confirm saving
        console.log("💾 Saving fresh data to Redis for 24h");
        redis.set(cacheKey, data, { ex: 86400 }).catch(e => console.error("Redis Set Error:", e));

        return NextResponse.json(data);

    } catch (error: any) {
        console.error("Server API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}