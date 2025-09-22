"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

interface User {
  idx?: number;
  id: string;
  name: string | null;
  email: string | null;
  baseline_happiness?: number | null;
  typical_sleep_hours?: number | null;
  common_problems?: string | null;
  known_conditions?: string | null;
  location?: string | null;
  created_at?: string | null;
}

export default function Dashboard() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }
console.log("Session user id:", session.user.id);

    const fetchUser = async () => {
      const userId = session.user.id;

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle(); // allows 0 or 1 row

      if (error) {
        console.error("Error fetching user:", error.message);
      } else {
        // handle rare case if data is returned as an array
        const userData = Array.isArray(data) ? data[0] : data;

        console.log("Full user object:", userData);

        setUser(userData || null);
      }

      setLoading(false);
    };

    fetchUser();
  }, [session, router, supabase]);

  if (!session || loading) return <div>Loading dashboard...</div>;
  if (!user) return <div>User not found.</div>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded">
      <h1 className="text-3xl font-bold mb-4">
        Hello, {user.name || user.email}!
      </h1>

      <div className="mt-4">
        <h2 className="font-semibold mb-2">User Details:</h2>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </div>
  );
}
