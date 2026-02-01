import { createClient } from "@/lib/supabase/server";

export type JournalEntry = {
  date: string; // YYYY-MM-DD
  mood?: number;
  stress?: number;
  sleep_hours?: number;
  exercised?: boolean;
};

export async function fetchUserJournals(options?: {
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<JournalEntry[]> {
  // ✅ FIX: await the client
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  let query = supabase
    .from("journals")
    .select("date, mood, stress, sleep_hours, exercised")
    .eq("user_id", user.id)
    .order("date", { ascending: true });

  if (options?.startDate) {
    query = query.gte("date", options.startDate);
  }

  if (options?.endDate) {
    query = query.lte("date", options.endDate);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("JOURNAL FETCH ERROR:", error);
    return [];
  }

  return data ?? [];
}
