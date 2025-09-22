"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient, useSessionContext } from "@supabase/auth-helpers-react";

interface UserProfile {
  id: string;
  full_name?: string | null;
  email?: string | null;
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

  // Fetch user profile from 'profiles' table
  useEffect(() => {
    if (!session) return;

    const fetchUser = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user:", error.message);
      }

      if (!data) {
        // Redirect to login if profile not found
        router.push("/auth");
      } else {
        setUser(data);
      }

      setLoading(false);
    };

    fetchUser();
  }, [session, supabase, router]);

  if (loading || sessionLoading) return <div>Loading dashboard...</div>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded mt-10">
      <h1 className="text-3xl font-bold mb-6">
        Welcome, {user?.full_name || user?.email}!
      </h1>

      {user && (
        <div className="space-y-3">
          <div>
            <span className="font-semibold">Email: </span>
            <span>{user.email || "Not provided"}</span>
          </div>
          <div>
            <span className="font-semibold">Full Name: </span>
            <span>{user.full_name || "Not provided"}</span>
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
