import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

type Data = {
  message?: string;
  error?: string;
  user?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { data: sessionData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) return res.status(400).json({ error: authError.message });

  res.status(200).json({ message: 'Login successful', user: sessionData.user });
}
