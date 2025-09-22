import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

type Data = {
  message?: string;
  error?: string;
  user?: any;
  session?: any;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(400).json({ error: error.message });

  // Upsert user in 'users' table to ensure profile exists
  if (data.user) {
    await supabase.from('users').upsert([{
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.full_name || data.user.email,
    }]);
  }

  return res.status(200).json({ message: "Login successful", user: data.user, session: data.session });
}
