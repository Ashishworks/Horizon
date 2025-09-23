"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient, useSessionContext } from "@supabase/auth-helpers-react";

interface UserProfile {
  id: string;
  name?: string | null;
  email?: string | null;
  baseline_happiness?: number | null;
  typical_sleep_hours?: number | null;
  common_problems?: string | null;
  known_conditions?: string | null;
  location?: string | null;
  created_at?: string | null;
}

export default function Dashboard() {
  const supabase = useSupabaseClient();
  const { session, isLoading: sessionLoading } = useSessionContext();
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!session && !sessionLoading) {
      router.push("/auth");
    }
  }, [session, sessionLoading, router]);

  // Fetch user profile
  useEffect(() => {
    if (!session) return;

    const fetchUser = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", session.user.email)
        .maybeSingle();

      if (error) console.error("Error fetching user:", error.message);

      if (!data) {
        router.push("/auth");
      } else {
        setUser(data);
      }

      setLoading(false);
    };

    fetchUser();
  }, [session, supabase, router]);

  if (loading || sessionLoading) {
    // Skeleton Loader
    return (
      <div className="max-w-md mx-auto p-6 bg-white shadow rounded mt-10">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-300 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/5"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded mt-10 text-black">
      <h1 className="text-3xl font-bold mb-6">
        Welcome, {user?.name || user?.email}!
      </h1>

      {user && (
        <div className="space-y-3">
          <div>
            <span className="font-semibold">Email: </span>
            <span>{user.email || "Not provided"}</span>
          </div>
          <div>
            <span className="font-semibold">Full Name: </span>
            <span>{user.name || "Not provided"}</span>
          </div>
          <div>
            <span className="font-semibold">Baseline Happiness: </span>
            <span>{user.baseline_happiness || "Not provided"}</span>
          </div>
          <div>
            <span className="font-semibold">Typical Sleep Hours: </span>
            <span>{user.typical_sleep_hours ?? "Not provided"}</span>
          </div>
          <div>
            <span className="font-semibold">Common Problems: </span>
            <span>{user.common_problems || "Not provided"}</span>
          </div>
          <div>
            <span className="font-semibold">Known Conditions: </span>
            <span>{user.known_conditions || "Not provided"}</span>
          </div>
          <div>
            <span className="font-semibold">Location: </span>
            <span>{user.location || "Not provided"}</span>
          </div>
          <div>
            <span className="font-semibold">Joined On: </span>
            <span>{user.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}</span>
          </div>
        </div>
      )}
    </div>
  );
}
